# CV Tailor

> Personal · OSS · 2026

An agentic Claude Code skill that turns any job description into a tailored, ATS-friendly LaTeX CV — grounded strictly in your verified experience files, with honesty rules that refuse to fabricate.

**Tech:** tools, productivity
**Source:** https://github.com/athallarizky/cv-tailor

## Overview

## Overview

Ask an LLM to "tailor my CV for this job posting" and you get two failure modes at once: generic templates that ignore the job description, and confident fabrication — invented metrics, claimed-but-unused technologies, inflated titles. CV Tailor is an agentic skill for Claude Code (a `SKILL.md` pipeline any AI agent can execute) designed against both: it produces a genuinely tailored, ATS-friendly LaTeX CV **where every bullet traces back to a source file you control**.



## Architecture

    cv-tailor/
    ├── SKILL.md              # the skill: 10-step pipeline, modes, honesty rules
    ├── resources/
    │   ├── meta/              # contact · about (voice) · location (templates only in git)
    │   ├── educations/        # degrees, honors
    │   └── experiences/       # brag files: What I Did / Impact / Context /
    │                         #   Framing Notes + YAML meta (featured, overlap_risk)
    ├── templates/
    │   └── ats-friendly-technical-resume/   # LaTeX + Markdown, dual-engine
    ├── scripts/               # setup.sh (tectonic) · compile.sh · publish-icloud.sh
    └── output/                # generated CVs (gitignored → archived to iCloud)
    …

*(Full body — pipeline, honesty rules, privacy — in project.json.)*
