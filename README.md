# claude-code-compat

A Claude Code compatibility skill. It maintains a managed block in `CLAUDE.md` so Claude Code can see an `AGENTS.md` and the skills under `.agents/skills`, neither of which it discovers natively.

## Why

Claude Code reads `CLAUDE.md` and `.claude/skills`. Repositories that follow the cross-tool `AGENTS.md` and `.agents/skills` conventions are invisible to it. This skill bridges that gap with no symlinks and no per-clone setup.

## What it does

Running the generator writes one managed block into `CLAUDE.md`:

- Imports the repository's `AGENTS.md`
- Lists each skill under `.agents/skills` by name and description, which is the Agent Skills startup tier

Claude Code then loads a skill's full `SKILL.md` on demand, the same way it treats a native skill. Anything you keep in `CLAUDE.md` outside the block is left untouched.

## Use

From the repository root:

```sh
node scripts/claude-compat.mjs
```

Run it whenever skills change. The block is regenerated in place, idempotently. Requires Node, with no dependencies. See `SKILL.md` for the full trigger conditions and behavior.
