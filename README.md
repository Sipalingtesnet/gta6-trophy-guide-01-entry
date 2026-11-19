# Leonida Nights — GTA VI Trophy Guide & Tracker

![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)
![rank](https://make.fun/badge/gta6-trophy-guide-01/Sipalingtesnet/gta6-trophy-guide-01-entry/rank.svg)
![reward](https://make.fun/badge/gta6-trophy-guide-01/Sipalingtesnet/gta6-trophy-guide-01-entry/reward.svg)

An entry for [Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01) on make.fun.

## What it is

An offline web app that guides and tracks all **55 PlayStation 5 trophies** of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze — written for the game's launch on 19 November 2026.

- **Every trophy, with its official name, description and grade** as PlayStation publishes them (the list matches Exophase and PSNProfiles on every entry), plus a guide in our own words: what to do, where and how, and when it can be missed.
- **A cited guide for each trophy.** Every guide names its sources beside it — chiefly the official lists on Exophase and PSNProfiles, and PowerPyx's GTA 6 Trophy Guide & Roadmap for the methods and counts. A specific location or step always carries its source. Five trophies that no published guide has pinned down yet are marked **unconfirmed** rather than guessed at.
- **A tracker.** Tick trophies off; progress saves in the browser (localStorage) and can be exported to a file and imported back. Filters by kind (story, missable, collectibles, activities, side quests, crime & robberies, secret, platinum & 100% — and online, which explains the list has no online trophies), by grade, by earned status, and by search.
- **A spoiler setting** that hides the names, descriptions and guides of story trophies until they are earned.
- **A roadmap to the platinum** in three stages — story (60–80 hours), the 100% Completion Checklist (~100 hours), then Strangers & Freaks and cleanup (~10 hours) — with the one possibly missable trophy, **Positive Mental Attitude**, flagged loud and early: the Chapter 1 balcony meditation at Jason's house disappears after Chapter 1.

## The honest bit

The game launched the day this guide was written. Its guides are built from the official trophy descriptions plus published launch guides, and they say plainly where a step is unconfirmed. Steps may shift as more of the game is mapped after launch.

## Run it

No build step, no network. Serve `app/` with any static server and open `app/index.html` in desktop Chrome:

```sh
node serve.ts   # http://localhost:8080
```

Or open `app/index.html` directly from the files. Everything the app loads is a file under `app/`; it makes no network request at run time.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output folder and writes `dossier.json` with the vendored make.fun library in `vendor/makefun-frontend.ts`, which is the kit's copy, unchanged.

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide and tracker.
- `app/data/trophies.json` — the 55 trophies with official names, descriptions, grades, kinds, missable flags, roadmap stages, guides and sources.
- `screenshots/` — four renders of the app running in a browser.
- `main.ts` — the entry program. `serve.ts` — a tiny static server for local testing.

## License

MIT — see `LICENSE`. An independent fan guide, written in our own words. No Rockstar Games logo, artwork, box art or game screenshot appears anywhere in it. Trophy names and descriptions are shown as PlayStation publishes them. Grand Theft Auto and GTA are trademarks of Take-Two Interactive; this guide is not affiliated with Rockstar Games.
