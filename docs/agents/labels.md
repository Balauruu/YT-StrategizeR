# Labels

The skills speak in **roles**. This file maps each role to the label string this repo's tracker uses, and it is the one place those strings live. When a skill names a role (e.g. "apply the `ready-for-agent` role"), use its string from this file.

`/flow:setup` creates every label below with its colour and description, and the Description column is the tracker's label description. On a local-markdown tracker the strings go in each issue file's `labels:` frontmatter. A role missing from this file or from the tracker is a setup gap (`~/.claude/skills/flow:shared/shared-rules.md` § Shared files).

## State

Used by `/flow:triage`, `/flow:to-tickets` and `/agents:orchestrate`. An issue carries at most one state label.

| Role              | Label in our tracker    | Colour    | Description                                                                                       |
| ----------------- | ----------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `needs-triage`    | `state:needs-triage`    | `#C5DEF5` | Maintainer needs to evaluate this                                                                 |
| `needs-info`      | `state:needs-info`      | `#FBCA04` | Waiting on the reporter; the question is in a comment                                             |
| `needs-decision`  | `state:needs-decision`  | `#D93F0B` | Waiting on an owner decision; the question is in a comment                                        |
| `ready-for-agent` | `state:ready-for-agent` | `#0E8A16` | Issue: an agent builds it from its brief once blockers close. PR: an agent may push to its branch |
| `ready-for-human` | `state:ready-for-human` | `#1D76DB` | Needs a human: real data, credentials, judgement or manual testing, on an issue or a PR           |
| `wontfix`         | `state:wontfix`         | `#FFFFFF` | Will not be actioned                                                                              |

## Type

Used by `/flow:triage`. A triaged issue carries exactly one type label.

| Role          | Label in our tracker | Colour    | Description                 |
| ------------- | -------------------- | --------- | --------------------------- |
| `bug`         | `type:bug`           | `#D73A4A` | Something is broken         |
| `enhancement` | `type:enhancement`   | `#A2EEEF` | New feature or improvement  |

## Design

Used by `/flow:to-tickets` and `/agents:orchestrate`. A design's own lifecycle (Draft, In Review, Approved) stays in its `Status:` line; the tracker marks only the build.

| Role       | Label in our tracker | Colour    | Description                                                 |
| ---------- | -------------------- | --------- | ----------------------------------------------------------- |
| `building` | `design:building`    | `#006B75` | Parent of a design's tickets; open while it is being built  |

## Wayfinder

Used by `/flow:wayfinder`. A map and its tickets carry only these.

| Role                      | Label in our tracker      | Colour    | Description                                                     |
| ------------------------- | ------------------------- | --------- | --------------------------------------------------------------- |
| `wayfinder:map`           | `wayfinder:map`           | `#5319E7` | Wayfinder map: the index of an effort's decisions               |
| `wayfinder:web-research`  | `wayfinder:web-research`  | `#6F42C1` | Ticket (AFK): a question published sources outside the workspace answer |
| `wayfinder:scout`         | `wayfinder:scout`         | `#B39DDB` | Ticket (AFK): a question the workspace's own files answer by reading |
| `wayfinder:spike`         | `wayfinder:spike`         | `#7E57C2` | Ticket (AFK): produce the answer by running, experimenting or observing |
| `wayfinder:grilling`      | `wayfinder:grilling`      | `#D4C5F9` | Ticket (HITL): a conversation with the owner                    |
| `wayfinder:prototype`     | `wayfinder:prototype`     | `#BFA8F0` | Ticket (HITL): a rough artifact to react to                     |
| `wayfinder:brainstorm`    | `wayfinder:brainstorm`    | `#9575CD` | Ticket (HITL): a frame-setting decision tested by isolated critics |
| `wayfinder:task`          | `wayfinder:task`          | `#E99695` | Ticket: work that unblocks a decision                           |
