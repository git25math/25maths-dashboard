Original prompt: 请帮我复刻一份/Users/zhuxingzhe/Project/ExamBoard/25maths-games-legends，Build and iterate a playable web game in this workspace, validating changes with a Playwright loop.

## Progress log

- 2026-03-20: Copied `25maths-games-legends` into this workspace (excluded `.git`, `node_modules`, `dist`).
- 2026-03-20: Added Playwright-friendly hooks to copied game (`window.render_game_to_text`, `?demo=1`/`?autotest=1` flow to reach Map in 1 click).
- 2026-03-20: Validated via Playwright loop; artifacts in `output/web-game-legends/` (screenshots + state JSON).
- 2026-03-20: Added one-click rsync helper to sync demo → upstream: `scripts/sync-legends-demo-to-upstream.sh` (dry-run by default).

## TODO

- (Optional) Extend Playwright actions to enter a mission and capture battle/practice screens.
