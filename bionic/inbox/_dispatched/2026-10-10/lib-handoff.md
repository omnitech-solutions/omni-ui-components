# Library completion: handoff (orchestrator stopped by the owner)

Integration branch: `lib-completion` (from `master` at `a980114`). Baseline gate at start: `pnpm verify` green, 173 test files.
Nothing was published. Nothing was pushed to `master`. All work is on `lib-completion` or on `lib/<unit>` branches.

## What went wrong (read this first)
- I launched all 13 Wave 1 workers at once on a 4-core / 16 GB container. Load reached 83 and memory 14.6 GB. Workers' installs, typechecks, Storybook servers, Chromium and full test runs thrashed each other; several runs were killed, so most PRs have no clean `pnpm verify`.
- The recurring failures (`DynamicForm.new-contact.test.tsx`, one `ConversationHeader` test) are 5 s timeouts that pass when run alone. This is a load flake, but it was never proven on a quiet machine.
- I merged U02 (PR #5) without running the full gate myself. Its own report said its full suite never finished.
- Reports were slow to surface because workers only report when finished.
- Recommended next time: 3 workers at a time, one `pnpm verify` at a time, or run the work on a bigger machine / CI (the U40 workflow exists).

## Merged into `lib-completion`
| Unit | PR | State |
|---|---|---|
| U40 CI workflow | #1 | Merged. Workflow has never run on GitHub. |
| U01 publish prep (0.1.0, CHANGELOG, RELEASING, README) | #2 | Merged. I verified: gate 173 files green, build green, tarball contains `dist`, `dist-types`, `dist/dynamic-form`, `dist/styles.css`, `README.md`. |
| `.gitignore` `.claude/worktrees/` | (direct commit `a8de13f`) | Done. |
| U02 entry points `./native`, `./chat`, `./highlight` | #5 | Merged, NOT fully verified: worker's targeted tests (12 files, 266 tests) pass; lint, typecheck, build pass; full test suite never completed. `./native` is 530 kB min / 161 kB gzip including React: weight not investigated. Lowlight, react-markdown etc. remain plain `dependencies` (owner's call). |

## Open PRs (not merged), with caveats
| Unit | PR | Verify | Hand-driven | Caveat |
|---|---|---|---|---|
| U05a portals part 1 | #3 | 176/177 files; 1 load flake (new-contact), passes alone | NOTHING (no Storybook/browser) | Edited `components/ui/popover.tsx` and `tooltip.tsx`, outside its Owns list. Needs a dark/light render and focus check. |
| U10 StatusClock/SessionBar | #4 | exit 0, 173 files | Yes: 2x dark and light, 0 console errors, computed colours equal board-1e pixels. Copy click not driven. | **Breaking change**: `buildTag` is now `{ sha, branch, commitIcon, branchIcon, ... }`, `label` and `icon` removed. Owner to accept or ask for a deprecated `label` fallback. No pixel diff vs board. |
| U24 MessageMenu | #6 | 173/174, 1 load flake, build not re-run on final edit | Yes: keyboard, Esc closes confirm only, focus return, 0 console errors dark/light | `onCopy` also writes to the clipboard (owner to confirm). No `MessageItem` existed, so it was defined in the unit. |
| U14 small polish | #7 | exit 1: 2 load-flake failures in unrelated file; lint/typecheck/build not captured | Yes at 300 px dark and light | Left-side clipping of the 300 px header (history button out of frame) was seen and not investigated. Tests are class assertions only. |
| U27 ModelsSettings | #8 | 172/174, 3 load timeouts, build unconfirmed | Yes: in-SettingsDialog story dark/light | The light "404" was `favicon.ico` first-load noise (also appears on untouched stories). |

## Work on branches without a PR (pushed, unverified)
- **U20 ConversationTranscript** (`lib/U20-conversation-transcript`, wip commit): component, 13 tests passing, light mode driven. Open: `ChatReply` story `play` throws (multiple "Bad reply" buttons: scope to the turn); 2 console 404s untraced; dark mode never checked; verify never completed. Worker was resumed once and was killed when you stopped everything.
- **U25 StreamStatus + `describeFailure`** (`lib/U25-stream-status`, wip): component and tests written; one `failure.test.ts` case (`timeout name`) failed, regex loosened and not re-run; never driven in a browser (worker believed Chromium was unavailable: it IS at `/opt/pw-browsers`, use `executablePath`); verify never completed.
- **U44 hygiene** (`lib/U44-hygiene`, wip): `.prettierrc`, oxlint warnings fixed, `barrel.test.ts`, `use-controllable-state` export. Open: barrel test not proven to fail on a duplicate; full verify not run; `pnpm lint` still showed warnings on `lib-completion` in Table, dynamic-form and `.storybook/` files, so check they are all covered.
- **U03 CSS isolation** (`lib/U03-css-isolation`, wip saved by me from an uncommitted worktree, 14 files): touches `tailwind.css`, `base-palette.css`, `styles.css`, `vite.config.ts`, six `Table/*.css` files (outside its Owns list: review), `package.json`, `fixtures/host-app`, `css-delivery.md`. Zero-pixel diff NOT demonstrated. This is the one real unknown and the most important ★ unit.
- **U11 panel demo fidelity** (`lib/U11-panel-demo-fidelity`, wip saved by me, 7 files): Tag filled variant, Panel factories, NativeApp showcase, `tokens.css`, tests. `visible` reflow, header-meta truncation and the 900/1180 measurement are unconfirmed. The "width 330" question is still unanswered.

## Not started
U04, U05b, U06, U12, U15 (the remaining ★ units, all Wave 2), U21, U22, U23, U26, U28, U29, U41, U42, U43, U90, U91. No final PR `lib-completion` → `master` exists.

## ★ minimum set status
U01 done. U40 done (not ★). U02 merged (partly verified). U10 PR open. U05a PR open (unverified in browser). U03, U11 in progress/unverified. U04, U05b, U06, U12, U15 not started.

## Owner decisions pending
1. Accept U10's breaking `buildTag` shape?
2. Does "width 330" mean the transcript alone (current) or the transcript column inside a 900 px window?
3. U24: should `onCopy` also write to the clipboard?
4. Move lowlight/react-markdown/remark-gfm/diff to optional peer dependencies?
5. After merge: run `npm publish` per `RELEASING.md` (do not publish before U02/U05/U06 etc. land if you want them in 0.1.0; re-pack after the `exports` change).
6. Keep or drop the `Notification`/`Message` stubs.

## Recommended way to resume
1. On a quiet machine run `pnpm verify` on `lib-completion` (U02 is in without it).
2. Merge #3 (after one browser check), #4, #6, #7, #8 one at a time, `pnpm verify` after each.
3. Finish ★ units first: U03 (prove zero-pixel diff), U11, then U04, U05b, U06, U12, U15, with at most 3 workers at once and Storybook ports as in `lib-work-units.md`.
4. Then U44, U20, U25, then the remaining units, then U90/U91.
5. Worktrees are in `.claude/worktrees/` (git-ignored); the branches on `origin` hold all pushed work.
