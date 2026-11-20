# Issue tracker: GitHub

Issues for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Link parent**: make an issue a child of a parent. `gh issue create --parent <parent> ...`, or `gh issue edit <parent> --add-sub-issue <child>` afterwards (`gh` 2.94+). Older `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (database id, as in **Blocking**). Where sub-issues aren't enabled, make `Part of #<parent>` the body's first line, alone on it.
- **Blocking**: record that one issue blocks another. Use GitHub's native issue dependencies: `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). Where dependencies aren't available, write one `Blocked by: #<n>, #<m>` line naming every blocker, on its own line after any `Part of` line.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`. The label strings come from `docs/agents/labels.md`.
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v`; `gh` does this automatically when run inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/flow:triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`.
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either: resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## Wayfinding operations

Used by `/flow:wayfinder`. The map is an issue, and its tickets are its children.

- **Map**: **Create an issue** with the `wayfinder:map` role's string as its label (`--label`).
- **Child ticket**: **Create an issue** with its `wayfinder:<type>` role's string as its label, then **Link parent** to the map.
- **Frontier query**: the map's children with their state, assignees and open blockers, by **Children** and **Blockers** below, with the map as the parent.
- **Claim**: `gh issue edit <n> --add-assignee @me`.
- **Resolve**: `gh issue comment <n> --body-file <file>` with the resolution comment, then `gh issue close <n>`.

## Orchestration operations

Used by `/agents:orchestrate`, and its PR operations by `/flow:review`'s landing. The **parent** is an issue, and its tickets are its children (**Link parent**).

- **Children**: `gh api repos/{owner}/{repo}/issues/<parent>/sub_issues --paginate --jq '.[] | {number, title, state, labels: [.labels[].name], assignees: [.assignees[].login], blocked_by: .issue_dependencies_summary.blocked_by}'`. `blocked_by` counts open blockers only. Where sub-issues aren't enabled, the children are the issues whose body starts `Part of #<parent>`: `gh issue list --state all --limit 500 --search '"Part of #<parent>" in:body' --json number,title,body,state,labels,assignees`, keeping only bodies that start with `Part of #<parent>` followed by a line end (the search also matches `#123` for `#12`).
- **Blockers**: open blockers only: `gh api repos/{owner}/{repo}/issues/<n>/dependencies/blocked_by --jq '[.[] | select(.state=="open") | .number]'`. Where dependencies aren't available, the open issues in the ticket's `Blocked by:` line.
- **Claim**: `gh issue edit <n> --add-assignee @me`.
- **Unclaim**: `gh issue edit <n> --remove-assignee @me`.
- **Close**: `gh issue close <n> --reason completed --comment "..."`.
- **Open PR**: `gh pr create --draft --base <base> --head <branch> --title "..." --body-file <file>`.
- **Read PR**: `gh pr view <pr> --json baseRefName,body,state,mergeCommit`.
- **Find PR**: the PR for a branch, in any state: `gh pr list --head <branch> --state all --json number,state,baseRefName`.
- **Edit PR body**: `gh pr edit <pr> --body-file <file>`.
- **Wait for checks**: `gh pr checks <pr> --watch --fail-fast`.
- **Mark ready**: `gh pr ready <pr>`.
- **Mark draft**: `gh pr ready <pr> --undo`.
- **Merge PR**: `gh pr merge <pr>` with the repo's method (`--merge`, `--squash` or `--rebase`).
- **Close parent**: a `Closes #<parent>` line in the final PR's body; GitHub closes the parent when the PR merges into the default branch. Nothing to run.
- **CI triggers**: the `on:` block of each file in `.github/workflows/`. A `pull_request` trigger filtered to `branches: [main]` runs only on PRs into `main`.
