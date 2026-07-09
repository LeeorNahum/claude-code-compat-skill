# Maintenance contract: claude-code-compat

Rules for editing this skill.

- `scripts/claude-compat.mjs` is the source of truth for the generated `CLAUDE.md` block. Keep it zero-dependency and runnable with plain `node`.
- The generated index emits only each skill's `name`, direct `SKILL.md` path, and `description`. Do not add other frontmatter fields to the output.
- Keep descriptions in the index formatted as blockquotes, so they read as metadata and not as instructions to execute.
- Keep the direct-read guidance above the index short. It exists so Claude reads `.agents/skills/<name>/SKILL.md` directly instead of trying native slash-command skill invocation.
- Scope stays single-directory: the script reads `./AGENTS.md` and `./.agents/skills` only.
- Output must stay idempotent. Re-running produces no drift, and human content outside the managed block is never touched.
- Keep `SKILL.md` under 500 lines and focused on what an agent needs to run the skill.
- Bump `metadata.version` on any behavior change: patch for wording, minor for new guidance or structure, major for changed output or a renamed skill.
