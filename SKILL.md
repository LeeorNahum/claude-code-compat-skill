---
name: "claude-code-compat"
description: "Keep Claude Code in sync with cross-tool Agent Skills and AGENTS.md by regenerating a managed block in CLAUDE.md. Run it whenever anything under .agents changes, such as a skill being added, removed, renamed, or having its name or description edited, and whenever a repository has an AGENTS.md or .agents/skills but no up-to-date CLAUDE.md, because Claude Code natively reads only CLAUDE.md and .claude/skills. It lists each skill's name, path, and description so Claude can read matching skills directly."
compatibility: "Requires Node. Designed for Claude Code."
metadata:
  author: "Leeor Nahum"
  version: "2.0.1"
---

# Claude Code Compatibility

Claude Code natively reads `CLAUDE.md` and discovers skills under `.claude/skills`. It does not natively read `AGENTS.md` or `.agents/skills`. This skill bridges that gap deterministically by writing one managed block into `CLAUDE.md`.

## What it produces

A `CLAUDE.md` at the repository root containing a single managed block between guard comments:

- An `@AGENTS.md` import, so Claude Code loads the repository's root `AGENTS.md`.
- A standing "Nested AGENTS.md" directive telling the agent to read a directory's own `AGENTS.md` before working in it. Claude Code only imports the root `AGENTS.md`, so nested ones (under a package, app, or skill directory) would otherwise be missed. This keeps their local rules in force.
- An Agent Skills Index that lists every skill under `.agents/skills` by canonical name, path, and description. Claude Code should read the listed `SKILL.md` path directly when a description matches, because these project skills are not native slash-command skills.

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

When this skill is relevant, run the generator. There is no install step, no git hook, and no git configuration. The generator is just a script the agent runs on demand. That keeps the repo clean and avoids per-clone setup.

To uninstall, delete the managed block from `CLAUDE.md` (or delete `CLAUDE.md`), then remove the skill directory.

## Behavior

- Scope is the current directory only. It reads `./AGENTS.md` and `./.agents/skills`.
- Skills are sorted by name. Re-running is idempotent and produces no drift.
- Emits only each skill's name, direct `SKILL.md` path, and description. No other frontmatter fields are invented.
- If `CLAUDE.md` does not exist it is created. If it exists, the block is replaced in place or appended.
- Requires Node. No npm install and no dependencies.
