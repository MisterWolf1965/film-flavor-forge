
Goal: Fix the Generate page workflow so the visual steps actually progress end-to-end.

What I found
1. `GeneratorView` advances with `step = (step + 1) % 4`, but the UI has 5 steps in `GenerationProgress`.
2. Because of `% 4`, step index `4` ("Send to Platform") is never reached.
3. Step animation is currently tied only to `autoRunning`, so single-click generation (`Generate AI`) does not drive the workflow steps on the Generate page.

Implementation plan
1. Align step logic with the actual 5-step workflow
   - File: `src/components/GeneratorView.tsx`
   - Replace hardcoded modulo/interval logic with constants:
     - `TOTAL_STEPS = 5`
     - `STEP_DURATION_MS = 3000`
   - Update timer progression to cycle through all steps (`0..4`), not `0..3`.
   - This restores full progression including "Send to Platform".

2. Drive progress for both single generate and auto generate
   - File: `src/pages/Index.tsx`
   - Pass generation state to `GeneratorView` so steps can animate during single runs too (not only auto mode).
   - Example direction: `isActive={autoRunning || generating}` and keep `autoRunning` separately if needed for labels/control behavior.
   - Keep existing button loading state intact.

3. Update `GeneratorView` props to support the new trigger
   - File: `src/components/GeneratorView.tsx`
   - Extend props from only `autoRunning` to include a unified active signal (or both flags).
   - Reset steps to `-1` when inactive; start from `0` immediately when active.

4. Keep cadence consistent with current UX memory
   - 5 steps × 3 seconds = 15 seconds total cycle.
   - This matches the intended cinematic workflow timing and avoids mismatch with Auto AI cadence.

Technical details
- Root cause is a step-count mismatch:
  - `GenerationProgress.tsx` defines 5 workflow steps.
  - `GeneratorView.tsx` uses `% 4` and `3750ms`.
- Correcting to 5 steps with `3000ms` avoids invisible/frozen final state.
- No backend changes required; this is frontend state/timing coordination only.

Validation checklist (end-to-end)
1. On Generate tab, click **Generate AI**:
   - Confirm steps animate in order 1→5.
   - Confirm "Send to Platform" appears as active before completion.
2. Click **Auto AI**:
   - Confirm stepper loops through all 5 steps continuously while running.
3. Click **Stop**:
   - Confirm stepper resets to idle state.
4. Click **Placeholder**:
   - Confirm single-run step animation also works (if we wire single-run generically).
5. Ensure no regression in gallery output (hero image, scene grid, storyboard still render as before).
