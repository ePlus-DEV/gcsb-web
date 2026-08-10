# gcsb-web

Google Cloud Skills Boost - Helper - Website

## Arcade widget embed

For a cross-origin iframe, the browser does not allow the widget to read the full parent page URL directly. Include the parent bridge script next to the iframe so the widget can receive the exact embedding page URL through `postMessage`.

```html
<iframe
  data-arcade-widget
  src="https://arcade.eplus.dev/widget"
  title="Arcade Points Widget"
  loading="lazy"
></iframe>
<script async src="https://arcade.eplus.dev/arcade-widget-parent.js"></script>
```

The bridge sends only the parent page origin + pathname. Query strings and hashes are removed before the URL is forwarded to the widget.

The widget still supports `?source_url=` as the highest-priority explicit override and falls back to same-origin parent access, `document.referrer`, then `ancestorOrigins` where available.
