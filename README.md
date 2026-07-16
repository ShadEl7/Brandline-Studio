Brandline Studio — Local preview and package

Files:
- index.html, packages.html, about.html, portfolio.html, contact.html, quote.html, terms.html
- styles.css, script.js

Preview locally:
1) Open `index.html` in your browser (double-click) for a quick static preview.

Or run a simple local server (recommended) from the `Downloads` folder:

```powershell
# from PowerShell
Set-Location C:\Users\bugsy\Downloads
python -m http.server 8000
# then open http://localhost:8000/Brandline-Studio/index.html
```

ZIP created as `Brandline-Studio.zip` in `C:\Users\bugsy\Downloads` when requested.

Logo:
- The site will use an external `logo.jpg` when present, placed in the `Brandline-Studio` folder (72–200px wide recommended). If the image fails to load the header falls back to an embedded inline SVG so the branding still appears.

Notes:
- The site is static. Contact form is a prototype (client-side only).
- If you want exact pixel-perfect matching to an uploaded prototype, upload the prototype HTML/CSS or screenshots and I will align markup and spacing precisely.
