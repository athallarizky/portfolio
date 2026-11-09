# Threads Jobs Watcher

> Personal · Automation · 2026

A scheduled watcher that monitors Threads for Indonesian IT job postings (frontend / fullstack / AI), filters them through a calibrated scoring model, and delivers a Telegram digest plus a categorized markdown archive — running itself every two hours on launchd.

**Tech:** python, tools
**Source:** (private repo — no public link)

## Overview

## Overview

Job postings on Threads move fast and bury fast. Threads Jobs Watcher turns that firehose into a daily digest: every two hours (07:00–22:00 WIB) it searches Threads for Indonesian IT vacancies — frontend, fullstack, AI engineer — filters what it finds through a calibrated scoring model, deduplicates against seen posts, and delivers the survivors two ways: a Telegram digest to a private topic, and a full markdown archive (the entire thread content plus metadata, categorized by role) auto-pushed to a private org repo. Runs unattended on macOS `launchd`; a run with zero findings stays silent on purpose.

*(The repo is private — it contains scraping infrastructure and operational details — so there is no public source link.)*



## Architecture

    threads-jobs-watcher/  (private)
    ├── scraper.py            # CloakBrowser session → search → scroll → extract posts
    ├── config.py             # queries · ANCHORS · INCLUDE/EXCLUDE_KW · LOCATION_HINTS · MIN_SCORE
    ├── test_filter.py        # filter logic vs fixtures — calibration without a browser
    ├── notify.py             # Telegram digest via hermes send (token lives bot-side)
    ├── login_setup.py        # one-time manual burner login (headed window)
    ├── runner.sh             # jitter + run + log prune
    ├── push_reports.sh       # report + archive auto-push
    ├── reports/YYYY-MM-DD/   # run JSONs (gitignored locally, pushed to private archive)
    └── launchd plist         # every 2h 07:00–22:00 WIB, randomized offset
    …

*(Full body — filter calibration, dual sinks, security stance — in project.json.)*
