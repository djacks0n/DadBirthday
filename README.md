# 雨音通り · Amaoto Street

A rainy 3D Tokyo street I made for my dad's 60th. You walk around and go into places:

- **Bar Amaoto**: your bottle shelf (bottle keep), picks for whatever kind of night it is, and a tasting log
- **Shrine**: omikuji fortunes with quotes, a rack for the ones you keep, and a garden that grows the more you use the site
- **Mountain gear**: TVs playing Abel & Victoria
- **The bench**: map of Japan with rain walks
- **Amaoto Station**: ski trips and hikes in Japan, plus ours. Check off where you've been
- **Konbini**: today's picks, settings, and backups
- **Bowling**: one lane, one very sharp ball
- **The lantern**: the birthday note

Everything saves in the browser (localStorage). The konbini has a backup download.

## Running it

It's a plain static site in `public/`. No build step.

```
cd public && python3 -m http.server 8000
```

Then open http://localhost:8000.

Useful URL tricks:
- `?reset` wipes saved stuff and shows the birthday message again
- `?hour=13` fakes the time of day (the street follows the real clock otherwise)

## Deploying on Render

Static site, build command `echo done`, publish directory `public`.

## Changing stuff

All the words, whiskey picks, quotes, videos, and trips are in `public/data/content.js`.

`scripts/make-japan-svg.js` regenerates the Japan map outline (needs `npm install` first).
