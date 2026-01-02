**Summary**

This document lists issues, risks, and concrete improvement options found in the current codebase. I focused on timing/looping, architecture, performance hotspots, globals/DOM mixing, and testing/tooling.

**High-priority Issues**

- **Global namespace pollution**: many values are exported onto `window` for legacy pages. This makes refactors fragile and couples code to globals. See the main bridge: [src/main.js](src/main.js#L14).

- **Fixed-timestep / `setInterval` usage**: multiple places use `setInterval` for logic and rendering which is suboptimal for modern browsers and causes timing drift. Examples:
  - Game loop: [src/classes/game.js](src/classes/game.js#L88)
  - Canvas drawing / effect loops: [src/classes/canvas.js](src/classes/canvas.js#L51) and [src/classes/canvas.js](src/classes/canvas.js#L95)
  - Misc effects/leaderboard: [src/effects.js](src/effects.js#L56), [pages/leaderboard/main.js](pages/leaderboard/main.js#L16)
    Recommendation: use `requestAnimationFrame` for rendering; for game logic either (a) convert everything to time-based updates using a `dt` argument (preferred), or (b) keep a stable physics tick using an accumulator + fixed-step updates (capped) when determinism is required.

- **Mixed concerns: logic & DOM**: code often manipulates the DOM directly inside core classes (e.g. updating `GameTimer` in [src/classes/game.js](src/classes/game.js#L143), many `document.getElementById` occurrences). This couples game logic with presentation; extract DOM updates into renderer/UI modules and pass only data/events.

**Medium-priority Issues**

- **Inconsistent time units / naming**: `GameFrequency` and `FrameFrequency` are numeric constants but the units are unclear (ms vs frames). Prefer explicit names (`GAME_TICK_MS`, `RENDER_INTERVAL_MS`) and use seconds for `dt` inside update methods.

- **Frequent innerHTML/string concatenation**: functions like `updateScores()` in [src/main.js](src/main.js#L36) rebuild HTML via string concatenation in a loop. This is inefficient and can cause layout thrashing. Use `DocumentFragment`, template cloning, or minimal DOM updates.

- **Direct prompts and synchronous user input**: `newGame()` uses `prompt()` to get map dimensions. Synchronous prompts block rendering; prefer a modal UI or form.

- **Uncapped accumulators / spiral of death**: if switching to accumulator-based fixed-step loops, cap the number of iterations per frame to avoid long stalls (e.g., max 5 steps per frame) and/or clamp accumulated time.

**Performance / Algorithmic**

- **Per-tick object reclassification**: each tick the game clears object lists and re-adds all objects to spatial lists (`map.clearObjectLists()` + `addObject()` per object). This may be expensive for many objects; consider incremental updates, spatial hashing, or reuse of buckets to reduce allocations.

- **High-frequency DOM/CSS changes**: code that manipulates styles (e.g. canvas shake via marginLeft/marginTop every few ms) can be expensive. Prefer CSS transforms with `will-change` and RAF-driven updates.

**Correctness / Robustness**

- **Implicit mutation while iterating**: the code removes deleted objects by splicing while iterating backward which is OK, but be careful if other loops assume object indices; prefer a `deleted` flag and a separate cleanup pass or a stable removal queue.

- **No clear units for timers**: `this.t` is incremented by `GameFrequency` and compared against `Settings.RoundTime * 60000`. Using mixed units makes reasoning error-prone; normalize on seconds (floating) for calculations and UI formatting.

**Testing / Tooling / DX**

- **Broader unit tests**: current tests exist in `tests/` but expand coverage to include deterministic game-tick logic (physics, collisions, scoring). Decouple logic from DOM to make tests pure and fast.

**UX / Accessibility**

- **Keyboard focus & ARIA**: ensure menus and dynamic UI elements are keyboard-navigable and implement ARIA attributes where appropriate.

- **Audio controls**: centralize audio management; respect reduced-motion / mute OS preferences.

**Concrete refactor plan (incremental)**

1. Introduce a canonical time unit and `dt` API
   - Define `TIME_MS_PER_TICK` or prefer `tick(dtSeconds)` where `dtSeconds` is a float number of seconds since last update.
   - Update `Game.step()` and all `object.step()` signatures to accept `dt` (seconds).
2. Replace render loop with `requestAnimationFrame` and implement a fixed-step accumulator with a maximum iterations cap and a clamp on accumulated time.
   - Option A: fully time-based (variable-step) — easiest but less deterministic.
   - Option B: accumulator fixed-step + RAF rendering — keeps determinism and smoother rendering.
3. Extract DOM updates
   - Remove `document.getElementById` calls from core classes; raise events or call a renderer module to update UI elements (timer, scoreboard).
4. Replace global `window` API with an explicit bridge
   - Add a `bridge` module that exposes only the needed functions or an event emitter.
   - Migrate callers gradually; tests will help check regressions.
5. Optimize hotspots
   - Rework `updateScores()` to use `DocumentFragment` or virtual DOM approach.
   - Evaluate `map` spatial indexing to avoid per-tick full reclassification.
6. Tooling & tests
   - Add ESLint, stricter Prettier rules, and expand unit tests for game logic.

**Quick wins I can implement for you**

- Convert the canvas drawing loop to `requestAnimationFrame` and keep the current fixed-step `Game.step()` semantics using an accumulator (with a cap) — this minimizes code changes.
- Or: convert all `step()` signatures to accept `dt` (seconds) and propagate `dt` to objects; then swap the loop to RAF with variable-step updates.
- Replace `updateScores()` HTML concatenation with a `DocumentFragment` implementation.

If you want, I can: (pick one)

- Implement the RAF + accumulator loop and safety caps (minimal risk), or
- Implement the `dt`-based step refactor (requires changes across many object classes but is cleaner long-term).

---

If you want I can commit these suggestions as a single PR and start with the RAF + accumulator change (small, safe), then follow the incremental plan above. Which option would you like me to implement first?
