#!/usr/bin/env python3
"""Verify that production Google Analytics loads by default with a notice marker."""

from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, urlparse


class AnalyticsMarkupCollector(HTMLParser):
    """Collect script and meta elements from a static HTML document."""

    def __init__(self) -> None:
        super().__init__()
        self.scripts: list[tuple[dict[str, str | None], str]] = []
        self.meta: list[dict[str, str | None]] = []
        self._current_attrs: dict[str, str | None] | None = None
        self._current_body: list[str] = []

    def handle_starttag(
        self,
        tag: str,
        attrs: list[tuple[str, str | None]],
    ) -> None:
        normalized_tag = tag.lower()
        if normalized_tag == "meta":
            self.meta.append(dict(attrs))
            return
        if normalized_tag != "script":
            return
        self._current_attrs = dict(attrs)
        self._current_body = []

    def handle_startendtag(
        self,
        tag: str,
        attrs: list[tuple[str, str | None]],
    ) -> None:
        if tag.lower() == "meta":
            self.meta.append(dict(attrs))

    def handle_data(self, data: str) -> None:
        if self._current_attrs is not None:
            self._current_body.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() != "script" or self._current_attrs is None:
            return
        self.scripts.append(
            (self._current_attrs, "".join(self._current_body)),
        )
        self._current_attrs = None
        self._current_body = []


def get_meta_content(
    meta: list[dict[str, str | None]],
    name: str,
) -> list[str | None]:
    return [item.get("content") for item in meta if item.get("name") == name]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("html_path", type=Path)
    parser.add_argument("expected_id")
    args = parser.parse_args()

    collector = AnalyticsMarkupCollector()
    collector.feed(args.html_path.read_text(encoding="utf-8"))

    loader_scripts = [
        attrs
        for attrs, _body in collector.scripts
        if (attrs.get("src") or "").split("?", 1)[0]
        == "https://www.googletagmanager.com/gtag/js"
    ]
    if len(loader_scripts) != 1:
        raise SystemExit(
            "Expected exactly one default Google Analytics loader; "
            f"found {len(loader_scripts)}."
        )

    loader_src = loader_scripts[0].get("src") or ""
    loader_id = parse_qs(urlparse(loader_src).query).get("id", [])
    if loader_id != [args.expected_id]:
        raise SystemExit(
            f"Expected Google Analytics loader ID {args.expected_id}; "
            f"found {loader_id}."
        )

    inline_initializers = [
        body
        for _attrs, body in collector.scripts
        if ("gtag(\"config\"" in body or "gtag('config'" in body)
        and args.expected_id in body
    ]
    if len(inline_initializers) != 1:
        raise SystemExit(
            "Expected exactly one default Google Analytics initializer for "
            f"{args.expected_id}; found {len(inline_initializers)}."
        )

    analytics_ids = get_meta_content(collector.meta, "google-analytics-id")
    if analytics_ids != [args.expected_id]:
        raise SystemExit(
            f"Expected one Google Analytics ID marker for {args.expected_id}; "
            f"found {analytics_ids}."
        )

    analytics_modes = get_meta_content(collector.meta, "analytics-mode")
    if analytics_modes != ["always-enabled"]:
        raise SystemExit(
            "Expected analytics-mode='always-enabled'; "
            f"found {analytics_modes}."
        )

    storage_markers = get_meta_content(
        collector.meta,
        "cookie-notice-storage",
    )
    if storage_markers != ["arcade-cookie-notice-v1"]:
        raise SystemExit(
            "Expected one cookie notice storage marker; "
            f"found {storage_markers}."
        )

    print(
        "Verified that Google Analytics "
        + args.expected_id
        + " loads by default and the cookie notice marker is present."
    )


if __name__ == "__main__":
    main()
