# uiverdict

A benchmark harness that scores AI-generated React components against a written spec on behavior tests, accessibility, type safety, lint, and bundle size.

> Status: Phase 1 scaffold. Tooling, config validation, and the CLI skeleton exist. The scoring pipeline is not implemented yet, and every pipeline command currently exits with "not implemented".

## What this is / What this is NOT

**This is**
- A small, reproducible harness where every reported number is produced by code in this repo.
- A calibration-first design: scorers must tell known-good fixtures from known-bad ones before any model is measured.

**This is NOT**
- A ranking of AI models.
- A security sandbox.
- A measure of visual design quality.
- A substitute for human review.

## Quick start

```bash
npm install     # first time only; creates package-lock.json
npm run check   # typecheck + lint + tests
```

`make install` and `make check` do the same if you have `make`. Calibration and report commands arrive in later phases.

## Known limitations

- The pipeline (generate, score, aggregate, report) is not built yet.
- Scoring weights and caps in `config/scoring.json` are starting values. They will be justified by calibration tests before any result is published.

## How this was built

Built with AI assistance. The maintainer reviews and runs everything before it is merged.

## License

MIT
