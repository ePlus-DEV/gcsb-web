#!/usr/bin/env python3
"""Verify the Google Analytics bootstraps emitted by Next.js static export."""

from __future__ import annotations

import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from typing import Any


class ScriptCollector(HTMLParser):
    """Collect inline script contents from an HTML document."""

    def __init__(self) -> None:
        super().__init__()
        self.scripts: list[str] = []
        self._current_script: list[str] | None = None

    def handle_starttag(
        self,
        tag: str,
        attrs: list[tuple[str, str | None]],
    ) -> None:
        del attrs
        if tag.lower() == "script":
            self._current_script = []

    def handle_data(self, data: str) -> None:
        if self._current_script is not None:
            self._current_script.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "script" and self._current_script is not None:
            self.scripts.append("".join(self._current_script))
            self._current_script = None


def parse_next_script_payloads(html: str) -> list[list[Any]]:
    """Decode JSON payloads queued through Next.js' self.__next_s bootstrap."""

    collector = ScriptCollector()
    collector.feed(html)
    payloads: list[list[Any]] = []

    for script in collector.scripts:
        if "self.__next_s" not in script:
            continue

        match = re.search(r"\.push\((.*)\)\s*;?\s*$", script, re.DOTALL)
        if not match:
            continue

        try:
            payload = json.loads(match.group(1))
        except json.JSONDecodeError:
            continue

        if isinstance(payload, list):
            payloads.append(payload)

    return payloads


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("html_path", type=Path)
    parser.add_argument("primary_id")
    parser.add_argument("expected_ids", nargs="+")
    args = parser.parse_args()

    expected_ids = list(dict.fromkeys(args.expected_ids))
    if not expected_ids or expected_ids[0] != args.primary_id:
        raise SystemExit("The primary GA ID must be the first expected ID.")

    html = args.html_path.read_text(encoding="utf-8")
    payloads = parse_next_script_payloads(html)
    primary_url = (
        "https://www.googletagmanager.com/gtag/js?id=" + args.primary_id
    )

    loader_payloads = [
        payload
        for payload in payloads
        if len(payload) == 2
        and payload[0] == primary_url
        and isinstance(payload[1], dict)
        and payload[1].get("id") == "google-analytics"
    ]
    if len(loader_payloads) != 1:
        raise SystemExit(
            f"Expected exactly one Next.js GA loader for {primary_url}; "
            f"found {len(loader_payloads)}."
        )

    init_payloads = [
        payload
        for payload in payloads
        if len(payload) == 2
        and payload[0] == 0
        and isinstance(payload[1], dict)
        and payload[1].get("id") == "google-analytics-init"
    ]
    if len(init_payloads) != 1:
        raise SystemExit(
            "Expected exactly one Next.js Google Analytics init bootstrap; "
            f"found {len(init_payloads)}."
        )

    init_script = init_payloads[0][1].get("children")
    if not isinstance(init_script, str):
        raise SystemExit("The Google Analytics init bootstrap has no script body.")

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
        "Verified one Google Analytics loader and config calls for: "
        + ", ".join(configured_ids)
    )


if __name__ == "__main__":
    main()
