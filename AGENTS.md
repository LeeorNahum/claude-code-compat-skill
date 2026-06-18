# Maintenance contract: claude-code-compat

Rules for editing this skill.

- `scripts/claude-compat.mjs` is the source of truth for the generated `CLAUDE.md` block. Keep it zero-dependency and runnable with plain `node`.
- The generated index emits only `name` and `description`, per the Agent Skills spec. Do not add other fields to the output.
- Keep descriptions in the index formatted as blockquotes, so they read as metadata and not as instructions to execute.
- Scope stays single-directory: the script reads `./AGENTS.md` and `./.agents/skills` only.
- Output must stay idempotent. Re-running produces no drift, and human content outside the managed block is never touched.
- Keep `SKILL.md` under 500 lines and focused on what an agent needs to run the skill.
- Bump `metadata.version` on any behavior change: patch for wording, minor for new guidance or structure, major for changed output or a renamed skill.
