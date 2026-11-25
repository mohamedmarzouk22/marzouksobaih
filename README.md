# marzouksobaih.com

Static site, no build step. Deployed to Hostinger from this repository.

## Add a new simulation movie to "Recent work"
1. Long video: upload to YouTube, then add an entry to `data/recent-work.json`:
   `{"type":"youtube","id":"<YouTube ID>","title":"...","description":"...","tags":["..."]}`
2. Short clip or image: put it in `assets/img/work/` (images: under 500 KB; GIF under 2 MB) and add
   `{"type":"image","src":"assets/img/work/<file>","title":"...","description":"...","tags":["..."]}`
3. Newest entries go at the top of the list. Commit and push; Hostinger publishes automatically.

## Hero background video (optional)
Put a muted, under-5-MB H.264 MP4 in `assets/video/` and add `data-video="assets/video/md-hero.mp4"` to `<section id="hero">`.

## Local preview
`python3 -m http.server 8000` and open http://localhost:8000 (opening index.html directly will not load the JSON).

## Notes
- The CV in `pdf/` has no phone number on purpose.
- `personal.html` is set to noindex and is not in the sitemap.
