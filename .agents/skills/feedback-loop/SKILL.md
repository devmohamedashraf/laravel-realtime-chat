---
name: feedback-loop
description: Review gate that runs after completing all tasks in a request. Presents a summary of every change for the user to accept or reject before moving on. Use after any code, config, styling, or logic changes.
user-invocable: false
---

## Review Gate Protocol

You MUST follow this protocol after completing work on the user's request.

### When this activates

After you finish ALL tasks for a given request — not after each individual file edit or each sub-task. Complete everything first, then trigger the review gate.

### How to present the review

Use `AskUserQuestion` with a structured summary:

1. **List every file changed** with a one-line description of what changed
2. **Group related changes** if there are many (e.g. "API changes", "Frontend changes")
3. **Mention anything removed** (deleted code, removed files, dropped dependencies)

### AskUserQuestion format

```
header: "Review" (max 12 chars, e.g. "Review", "All changes", "Updates")
options:
  - "Looks good" — User accepts current changes, continue to next iteration
  - "Needs changes" — User wants adjustments (follow up asking what specifically)
```

NEVER use "Approve" or "Approved" as an option label — those words are reserved for the freetext "approved" signal that means ALL done.

### On approval

There are two levels of approval:

1. **Selecting "Looks good" option** — Accepts the current set of changes, then ask: "What else would you like to change or improve next?" This keeps the iteration loop going.
2. **Typing "approved" in freetext (case-insensitive)** — The user is done with ALL changes. Finalize everything and stop iterating. Do not ask what's next.

### On rejection

If the user selects "Needs changes":
1. Ask a follow-up question with specific options about WHAT needs changing
2. Fix everything requested
3. Present the review gate again with only the new/modified changes

### Rules

- **Two approval levels** — Selecting "Looks good" accepts current changes and asks what's next. Typing "approved" (case-insensitive) in freetext means ALL done, stop iterating.
- **Never use "Approve" as an option label** — Only offer "Looks good" and "Needs changes" to avoid confusion with the freetext "approve" signal.
- **Never skip the review** — Every request that modifies files must end with this gate
- **Never ask mid-work** — Finish all tasks first, then ask once
- **Be concise** — File path + one-line description per change, no walls of text
- **Include the diff summary** — e.g. "3 files changed, 1 file created"

### Flow

```
User request → Complete ALL tasks → Summarize changes → AskUserQuestion → Accept or iterate
```
