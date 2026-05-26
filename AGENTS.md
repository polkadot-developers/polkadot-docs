# AGENTS.md — polkadot-docs

This file is loaded automatically by coding agents (Claude Code, Cursor, Codex, and any tool that respects the `AGENTS.md` convention) when they open this repository. Read it before generating or editing any documentation.

## Style and authoring rules

Documentation in this repository follows the **PaperMoon Documentation Style Guide**. The agent-loadable rule set lives in a separate repository so it can be shared across customers and updated independently:

- **Canonical source**: [`papermoonio/documentation-style-guide/AGENTS.md`](https://github.com/papermoonio/documentation-style-guide/blob/main/AGENTS.md)
- **Prose reference**: [`papermoonio/documentation-style-guide/style-guide.md`](https://github.com/papermoonio/documentation-style-guide/blob/main/style-guide.md)
- **Reviewer checklist**: [`papermoonio/documentation-style-guide/checklist.md`](https://github.com/papermoonio/documentation-style-guide/blob/main/checklist.md)

**Read the canonical `AGENTS.md` before authoring.** It front-loads the rules that AI-generated documentation most often violates — list punctuation, bold misuse, em dashes, banned phrases, terminology, code-identifier backticks, identifier consistency, image filenames, and the "no redundant subheadings above lead-in lists" rule. The pre-output checklist at the bottom of that file is the last thing to run before returning a draft.

## Linting

Vale rules and the PaperMoon vocab are not copied into this repo — they are pulled from the canonical [`papermoonio/documentation-style-guide`](https://github.com/papermoonio/documentation-style-guide) repo on every CI run, and on demand for local linting. The single source of truth is the styleguide repo.

```bash
./scripts/sync-styleguide-vale.sh   # pull canonical Vale rules + PaperMoon vocab
vale .                              # lint
```

The `styles/PaperMoon/` and `styles/config/vocabularies/PaperMoon/` directories are gitignored. Project-specific vocab lives in `styles/config/vocabularies/Polkadot/` and is committed.

CI runs the sync script and then Vale against changed markdown files on every pull request (see `.github/workflows/vale.yml`).

## Project-specific rules

These supplement (and where they conflict, override) the canonical styleguide:

- **Customer override on heading case**: This site uses Chicago title case per the styleguide default.
- **External links open in a new tab**: this is handled by the MkDocs plugin configured for this site. Do not add `{target=\_blank}` manually — the canonical styleguide also drops the manual rule.
- **Snippet includes**: Reusable code lives in `.snippets/code/` and is included via `--8<-- 'code/path/to/file.ext'`. Do not inline code that already exists as a snippet.
- **Variables**: `variables.yml` at the repo root holds shared version pins and identifiers. Reference via `{{ variable_name }}`.

## Precedence

When rules conflict:

1. **This file** (`polkadot-docs/AGENTS.md`) — project-specific overrides win.
2. **PaperMoon canonical styleguide** — default.
3. **Google developer documentation style guide** — fallback for anything the PaperMoon guide does not cover.

## How to use this in an agent session

A typical session opens by reading this file, then fetching the canonical styleguide rules (the file at the GitHub URL above, or a local clone if present). Apply the rules during generation, not just at review time. Run the pre-output checklist from the canonical `AGENTS.md` before returning a draft.
