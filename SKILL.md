---
name: "claude-code-compat"
description: "Keep Claude Code in sync with cross-tool Agent Skills and AGENTS.md by regenerating a managed block in CLAUDE.md. Run it whenever anything under .agents changes, such as a skill being added, removed, renamed, or having its name or description edited, and whenever a repository has an AGENTS.md or .agents/skills but no up-to-date CLAUDE.md, because Claude Code natively reads only CLAUDE.md and .claude/skills. It lists each skill's name and description so Claude Code can discover and load them on demand."
compatibility: "Requires Node. Designed for Claude Code."
metadata:
  author: "Leeor Nahum"
  version: "1.0.0"
---

# Claude Code Compatibility

Claude Code natively reads `CLAUDE.md` and discovers skills under `.claude/skills`. It does not natively read `AGENTS.md` or `.agents/skills`. This skill bridges that gap deterministically by writing one managed block into `CLAUDE.md`.

## What it produces

A `CLAUDE.md` at the repository root containing a single managed block between guard comments:

- An `@AGENTS.md` import, so Claude Code loads the repository's `AGENTS.md`.
- An Agent Skills Index that lists every skill under `.agents/skills` by canonical name and description only. That is the Agent Skills startup tier. Claude Code reads a skill's full `SKILL.md` on demand, the same way it treats a native skill.

Only the block is generated. Any content you keep in `CLAUDE.md` outside the block is preserved. To uninstall, delete the block or the whole `CLAUDE.md`.

## When to run it

Run the generator from the repository root whenever the bridge could be stale:

```sh
node .agents/skills/claude-code-compat/scripts/claude-compat.mjs
```

Run it after any of these:

- A skill is added, removed, or renamed under `.agents/skills`
- A skill's `name` or `description` changes
- `AGENTS.md` is added to a repo that has no `CLAUDE.md` yet
- You arrive in a repo for Claude Code and `CLAUDE.md` is missing or out of date

This skill is invoked by the agent, the same way skill-sync is. There is no install step, no git hook, and no git configuration. The generator is just a script the agent runs on demand. That keeps the repo clean and avoids per-clone setup.

To uninstall, delete the managed block from `CLAUDE.md` (or delete `CLAUDE.md`), then remove the skill directory.

## Behavior

- Scope is the current directory only. It reads `./AGENTS.md` and `./.agents/skills`.
- Skills are sorted by name. Re-running is idempotent and produces no drift.
- Emits only `name` and `description`, per the Agent Skills spec. No other fields are invented.
- If `CLAUDE.md` does not exist it is created. If it exists, the block is replaced in place or appended.
- Requires Node. No npm install and no dependencies.
