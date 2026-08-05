#!/usr/bin/env python3
"""Verify that Google Analytics is configured but not preloaded before consent."""

from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path


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
    if loader_scripts:
        raise SystemExit(
            "Google Analytics must not be present in the initial static HTML; "
            f"found {len(loader_scripts)} loader script(s)."
        )

    inline_initializers = [
        body
        for _attrs, body in collector.scripts
        if 'gtag("config"' in body or "gtag('config'" in body
    ]
    if inline_initializers:
        raise SystemExit(
            "Google Analytics configuration must run only after consent; "
            "an inline initializer was found in the initial HTML."
        )

    analytics_ids = get_meta_content(collector.meta, "google-analytics-id")
    if analytics_ids != [args.expected_id]:
        raise SystemExit(
            "Expected one consent-gated Google Analytics ID marker for "
            f"{args.expected_id}; found {analytics_ids}."
        )

    consent_markers = get_meta_content(collector.meta, "analytics-consent")
    if consent_markers != ["required"]:
        raise SystemExit(
            "Expected one analytics consent marker with content='required'; "
            f"found {consent_markers}."
        )

    storage_markers = get_meta_content(
        collector.meta,
        "analytics-consent-storage",
    )
    if storage_markers != ["arcade-cookie-consent-v1"]:
        raise SystemExit(
            "Expected one analytics consent storage marker; "
            f"found {storage_markers}."
        )

    print(
        "Verified that Google Analytics "
        + args.expected_id
        + " is configured but not loaded before consent."
    )


if __name__ == "__main__":
    main()
