# Maintenance contract: claude-code-compat

Rules for editing this skill. User-facing guidance lives in `SKILL.md`. `README.md` is the human skim layer.

## File roles

| File | Role |
| --- | --- |
| `SKILL.md` | Trigger, what the generator produces, when to run it, behavior |
| `scripts/claude-compat.mjs` | The generator, source of truth for the `CLAUDE.md` block |
| `README.md` | Short human summary |

## Editing

- `scripts/claude-compat.mjs` is the source of truth for the generated `CLAUDE.md` block. Keep it zero-dependency and runnable with plain `node`.
- The generated index emits only each skill's `name`, direct `SKILL.md` path, and `description`. Do not add other frontmatter fields to the output.
- Keep descriptions in the index formatted as blockquotes, so they read as metadata and not as instructions to execute.
- Keep the direct-read guidance above the index short. It exists so Claude reads `.agents/skills/<name>/SKILL.md` directly instead of trying native slash-command skill invocation.
- Scope stays single-directory: the script reads `./AGENTS.md` and `./.agents/skills` only.
- Output must stay idempotent. Re-running produces no drift, and human content outside the managed block is never touched.
- Keep `SKILL.md` under 500 lines and focused on what an agent needs to run the skill.
- Quote every frontmatter string value. Keys stay unquoted.
- No em dashes, and no semicolons used to join what should be separate sentences. Use commas, periods, parentheses, or "to".
- Bump `metadata.version` on any behavior change: patch for wording, minor for new guidance or structure, major for changed output or a renamed skill.

## Before finishing

- The README install command matches the actual path once installed under `.agents/skills/claude-code-compat`.
- `metadata.version` bumped if and only if behavior changed.
- `README.md` matches the actual file layout.
