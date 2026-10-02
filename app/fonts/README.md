# Local Arcade fonts

- Inter variable: Google Fonts `ofl/inter/Inter[opsz,wght].ttf`, losslessly converted to WOFF2 with FontTools. All source glyphs and the optical-size/weight axes are retained, including Vietnamese.
- Press Start 2P: Google Fonts full TTF at `fonts.gstatic.com/s/pressstart2p/v16/e3t4euO8T-267oIAQAu6jDQyK0nS.ttf`, converted to WOFF2 without subsetting.
- Each font's original SIL Open Font License is included beside it.

`next/font/local` bundles/preloads these files and handles static preview base paths.
The pixel face is used for the fixed Latin brand and English hero. Other locale
heroes use Inter plus system script fallbacks, avoiding unsupported glyphs being
mixed into a pixel heading. Regular body copy uses the complete Inter variable font.
