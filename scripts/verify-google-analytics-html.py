#!/usr/bin/env python3
"""Verify the direct Google Analytics scripts in a static HTML export."""

from __future__ import annotations

import argparse
import re
from html.parser import HTMLParser
from pathlib import Path


class ScriptCollector(HTMLParser):
    """Collect script attributes and inline bodies from an HTML document."""

    def __init__(self) -> None:
        super().__init__()
        self.scripts: list[tuple[dict[str, str | None], str]] = []
        self._current_attrs: dict[str, str | None] | None = None
        self._current_body: list[str] = []

    def handle_starttag(
        self,
        tag: str,
        attrs: list[tuple[str, str | None]],
    ) -> None:
        if tag.lower() != "script":
            return
        self._current_attrs = dict(attrs)
        self._current_body = []

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


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("html_path", type=Path)
    parser.add_argument("primary_id")
    parser.add_argument("expected_ids", nargs="+")
    args = parser.parse_args()

    expected_ids = list(dict.fromkeys(args.expected_ids))
    if not expected_ids or expected_ids[0] != args.primary_id:
        raise SystemExit("The primary GA ID must be the first expected ID.")

    collector = ScriptCollector()
    collector.feed(args.html_path.read_text(encoding="utf-8"))

    primary_url = (
        "https://www.googletagmanager.com/gtag/js?id=" + args.primary_id
    )
    loader_scripts = [
        attrs
        for attrs, _body in collector.scripts
        if (attrs.get("src") or "").split("?", 1)[0]
        == "https://www.googletagmanager.com/gtag/js"
    ]
    if len(loader_scripts) != 1:
        raise SystemExit(
            "Expected exactly one direct GA loader; "
            f"found {len(loader_scripts)}."
        )
    if (
        loader_scripts[0].get("id") != "google-analytics"
        or loader_scripts[0].get("src") != primary_url
        or "async" not in loader_scripts[0]
    ):
        raise SystemExit(
            "The direct Google Analytics loader must use the expected ID, "
            "source URL, and async attribute."
        )

    init_scripts = [
        body
        for attrs, body in collector.scripts
        if attrs.get("id") == "google-analytics-init"
        and not attrs.get("src")
    ]
    if len(init_scripts) != 1:
        raise SystemExit(
            "Expected exactly one direct Google Analytics init script; "
            f"found {len(init_scripts)}."
        )

    init_script = init_scripts[0]
    if init_script.count('gtag("js", new Date());') != 1:
        raise SystemExit("Expected exactly one gtag JavaScript initialization call.")

    configured_ids = re.findall(
        r'gtag\("config", "(G-[A-Z0-9]+)"\);',
        init_script,
    )
    if configured_ids != expected_ids:
        raise SystemExit(
            "Unexpected GA configuration order or duplicates. "
            f"Expected {expected_ids}, found {configured_ids}."
        )

    print(
        "Verified direct Google Analytics loader and config calls for: "
        + ", ".join(configured_ids)
    )


if __name__ == "__main__":
    main()
