# Display & Mechanics Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce project rules: all user-facing numbers show two decimals (display layer only); mechanics scenes expose tangential/normal gravity components and show only the active static or kinetic friction block.

**Architecture:** Add shared `formatQuantity`. Extend `pullFriction` `derived` with `G_t`, `G_n`, `mg`, and numeric `frictionMode` so overlays/Scene3D share one engine source of truth. Update pull-friction UI, then sweep remaining display `toFixed` call sites.

**Tech Stack:** React, TypeScript, R3F, `SceneState.derived: Record<string, number>`, `npm run lint` (`tsc --noEmit`). No Vitest — verify helpers with `npx tsx` assert scripts.

**Spec:** `docs/superpowers/specs/2026-09-11-display-and-mechanics-rules-design.md`  
**Project rules (alwaysApply):** `.cursor/rules/display-precision.mdc`, `.cursor/rules/mechanics-presentation.mdc`

## Global Constraints

- Display: always two decimals (e.g. `12.30`)
- Engine/tick/history: do **not** quantize to two decimals
- Non-finite → `—`
- Mechanics rule is project-wide; first land on `pull-friction` (`src/scenes/pullFriction/`)
- Gravity: show \(G_t\), \(G_n\) (flat floor: \(G_t=0\), \(G_n=mg\))
- Friction result UI: only active static **or** kinetic block (μₛ/μₖ **param sliders** may both remain)
- Overlays/3D/status must use engine `frictionMode` (no conflicting local machines)

---

## File map

| Path | Role |
|------|------|
| Create `src/utils/formatQuantity.ts` | Shared formatter |
| Create `src/scenes/pullFriction/frictionMode.ts` | `FRICTION_MODE` constants |
| Modify `src/scenes/pullFriction/physics.ts` | derived + status string formatting |
| Modify `src/components/ScenePage/FrictionInfoOverlay.tsx` | Gt/Gn + mode-switched friction |
| Modify `src/components/ScenePage/LiveDataOverlay.tsx` | two decimals + derived fields |
| Modify `src/scenes/pullFriction/Scene3D.tsx` | labels |
| Modify `src/components/ScenePage/GenericLiveDataOverlay.tsx` | two decimals |
| Modify `src/components/ScenePage/Charts.tsx` | readout |
| Modify `src/components/ScenePage/ParamSliders.tsx` | current value |
| Modify remaining `src/scenes/**` `toFixed` display sites | compliance |

`frictionMode` in `derived` (number):

- `0` none (liftoff / no contact)
- `1` static
- `2` kinetic

Existing physics API (do not rename): `createInitialState`, `tick`, `detectStatus`.  
Existing derived keys to keep: `Fx`, `Fy`, `N`, `fk`, `fs_max`, `f_signed`, `F_net_x`, `F_actual`, `E_remaining`, `W_F`, `Q`, `E_k`.  
Params key for energy budget: `E0`.

---

### Task 1: `formatQuantity` helper

**Files:**
- Create: `src/utils/formatQuantity.ts`
- Create: `scripts/assert-format-quantity.ts`

**Produces:** `formatQuantity(n: number): string`

- [ ] **Step 1: Write failing assert script**

```ts
import assert from 'node:assert/strict'
import { formatQuantity } from '../src/utils/formatQuantity'

assert.equal(formatQuantity(12), '12.00')
assert.equal(formatQuantity(12.345), '12.35')
assert.equal(formatQuantity(0), '0.00')
assert.equal(formatQuantity(-1.2), '-1.20')
assert.equal(formatQuantity(Number.NaN), '—')
assert.equal(formatQuantity(Number.POSITIVE_INFINITY), '—')
console.log('formatQuantity asserts OK')
```

- [ ] **Step 2: Run assert — expect FAIL (missing module)**

Run: `npx --yes tsx scripts/assert-format-quantity.ts`

- [ ] **Step 3: Implement**

```ts
/** User-facing quantity display: always two decimal places. */
export function formatQuantity(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return n.toFixed(2)
}
```

- [ ] **Step 4: Re-run assert — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/utils/formatQuantity.ts scripts/assert-format-quantity.ts
git commit -m "feat(utils): add formatQuantity for two-decimal display"
```

---

### Task 2: Expose `G_t` / `G_n` / `frictionMode` from physics

**Files:**
- Create: `src/scenes/pullFriction/frictionMode.ts`
- Modify: `src/scenes/pullFriction/physics.ts`
- Create: `scripts/assert-pull-friction-derived.ts`

**Produces:**

```ts
export const FRICTION_MODE = {
  none: 0,
  static: 1,
  kinetic: 2,
} as const
export type FrictionMode = (typeof FRICTION_MODE)[keyof typeof FRICTION_MODE]
```

New derived each tick: `mg`, `G_t`, `G_n`, `frictionMode`, `f_s`  
(`f_s` = `|f_signed|` when static; else `0`)

- [ ] **Step 1: Add `frictionMode.ts`** (constants above)

- [ ] **Step 2: Write failing derived assert**

```ts
import assert from 'node:assert/strict'
import { createInitialState, tick } from '../src/scenes/pullFriction/physics'
import { FRICTION_MODE } from '../src/scenes/pullFriction/frictionMode'

const staticParams = {
  F: 10, theta: 0, m: 5, mu_s: 0.8, mu_k: 0.3, g: 9.8, E0: 1000,
}
let s = createInitialState()
s = tick(s, staticParams, 1 / 60)
assert.equal(s.derived.G_t, 0)
assert.ok(Math.abs((s.derived.G_n ?? 0) - 5 * 9.8) < 1e-9)
assert.equal(s.derived.frictionMode, FRICTION_MODE.static)

const kineticParams = {
  F: 80, theta: 0, m: 5, mu_s: 0.3, mu_k: 0.2, g: 9.8, E0: 1000,
}
s = createInitialState()
for (let i = 0; i < 30; i++) s = tick(s, kineticParams, 1 / 60)
assert.equal(s.derived.frictionMode, FRICTION_MODE.kinetic)
assert.ok(Math.abs(s.v) > 0.01)
console.log('pullFriction derived asserts OK')
```

- [ ] **Step 3: Run — expect FAIL**

Run: `npx --yes tsx scripts/assert-pull-friction-derived.ts`

- [ ] **Step 4: Extend `createInitialState` derived**

Add `G_t: 0`, `G_n: 0`, `mg: 0`, `frictionMode: FRICTION_MODE.static`, `f_s: 0`.

- [ ] **Step 5: In `tick`, after forces, set mode + gravity fields**

```ts
import { FRICTION_MODE } from './frictionMode'

const mg = m * g
const G_t = 0
const G_n = mg
```

Merge `mg`, `G_t`, `G_n`, `frictionMode`, `f_s` into every returned `derived` (including liftoff return).

Assign **outgoing** mode from post-step `v` / contact so UI matches motion:

```ts
let frictionModeOut: number
if (N_raw <= 0) frictionModeOut = FRICTION_MODE.none
else if (Math.abs(v) > 0.001) frictionModeOut = FRICTION_MODE.kinetic
else if (Math.abs(Fx) <= fs_max + EPS) frictionModeOut = FRICTION_MODE.static
else frictionModeOut = FRICTION_MODE.kinetic

const f_s_out =
  frictionModeOut === FRICTION_MODE.static ? Math.abs(f_signed) : 0
```

For static lock, `f_signed` already equals opposing `Fx`.

- [ ] **Step 6: Format `detectStatus` numbers with `formatQuantity`**

Import from `@/utils/formatQuantity`. Replace every `toFixed(*)` inside status `description` strings.

- [ ] **Step 7: Re-run assert — PASS**

- [ ] **Step 8: Commit**

```bash
git add src/scenes/pullFriction/frictionMode.ts src/scenes/pullFriction/physics.ts scripts/assert-pull-friction-derived.ts
git commit -m "feat(pullFriction): expose Gt/Gn and frictionMode in derived"
```

---

### Task 3: `FrictionInfoOverlay` — engine-driven UI

**Files:**
- Modify: `src/components/ScenePage/FrictionInfoOverlay.tsx`

**Consumes:** `engine.state.derived` (`G_t`, `G_n`, `mg`, `N`, `fs_max`, `fk`, `f_s`, `frictionMode`, `F_actual`), `formatQuantity`, `FRICTION_MODE`  
**Must stop** using raw `params.F` for friction state when energy-limited.

- [ ] **Step 1: Read mode from derived**

```ts
const d = engine.state.derived
const mode = d.frictionMode ?? FRICTION_MODE.static
```

- [ ] **Step 2: Render rows**

Always:

- `mg = ${formatQuantity(d.mg)} N`
- `G_t = ${formatQuantity(d.G_t)} N`
- `G_n = ${formatQuantity(d.G_n)} N`
- `N = ${formatQuantity(Math.max(0, d.N ?? 0))} N`

If `mode === FRICTION_MODE.static`: show `μₛ`, `fs_max`, `f_s` only.  
If `mode === FRICTION_MODE.kinetic`: show `μₖ`, `fk` only.  
If `mode === FRICTION_MODE.none`: show `无接触 · 摩擦不适用` (no fs/fk values).

Footer text from mode: `静止（静摩擦）` / `滑动中（动摩擦）` / `离地（无摩擦）`.

Keep μₛ/μₖ **param sliders** elsewhere untouched.

- [ ] **Step 3: `npm run lint`**

- [ ] **Step 4: Commit**

```bash
git add src/components/ScenePage/FrictionInfoOverlay.tsx
git commit -m "feat(pullFriction): switch friction overlay by frictionMode"
```

---

### Task 4: `LiveDataOverlay` + `Scene3D` labels

**Files:**
- Modify: `src/components/ScenePage/LiveDataOverlay.tsx`
- Modify: `src/scenes/pullFriction/Scene3D.tsx`

- [ ] **Step 1: LiveDataOverlay**

- Import `formatQuantity`, `FRICTION_MODE`
- Remove per-cell `precision`; render `formatQuantity(value)`
- Add/show `G_t`, `G_n`
- Friction cell: static → `d.f_s`; kinetic → `d.fk`; none → treat as non-finite / `—`
- Prefer `d.F_actual`, `d.N`, etc. over recomputing from unlimited `params.F`
- Energy remaining / E0 / η also via `formatQuantity`

- [ ] **Step 2: Scene3D labels**

Replace all force/speed label `toFixed(*)` with `formatQuantity`.  
Show `G_t` and `G_n` (not only scalar `mg`).  
Friction label/arrow: hide when `frictionMode === none`; label `f_s` vs `f_k` by mode.

- [ ] **Step 3: `npm run lint`**

- [ ] **Step 4: Commit**

```bash
git add src/components/ScenePage/LiveDataOverlay.tsx src/scenes/pullFriction/Scene3D.tsx
git commit -m "feat(pullFriction): two-decimal labels and gravity components in 3D"
```

---

### Task 5: Shell-wide display sweep

**Files:**
- Modify: `src/components/ScenePage/GenericLiveDataOverlay.tsx`
- Modify: `src/components/ScenePage/Charts.tsx`
- Modify: `src/components/ScenePage/ParamSliders.tsx`
- Modify: `src/components/ScenePage/ParamSlidersPlaceholder.tsx` (if still referenced)
- Modify: `src/components/ScenePage/LiveData.tsx` (align if still imported)
- Modify every remaining display `toFixed` under `src/scenes/**`

- [ ] **Step 1: Find call sites**

```bash
rg -n "toFixed\(" src --glob '*.{ts,tsx}'
```

- [ ] **Step 2: GenericLiveDataOverlay** — always `formatQuantity(c.value)`; remove precision heuristic

- [ ] **Step 3: Charts** — current readout `formatQuantity(current)`

- [ ] **Step 4: ParamSliders** — always `formatQuantity(v)` (no step-based 1-decimal branch)

- [ ] **Step 5: Scene physics status strings + Scene3D labels** — switch to `formatQuantity`

Expected hits include (verify with `rg`): bernoulli, keplerOrbit, photoelectric, rlcCircuit, doubleSlit, doppler, faradayInduction, and any others.

- [ ] **Step 6: Only `formatQuantity` may call `toFixed`**

```bash
rg -n "toFixed\(" src --glob '*.{ts,tsx}'
```

Expected sole implementation site: `src/utils/formatQuantity.ts`.

- [ ] **Step 7: `npm run lint`**

- [ ] **Step 8: Commit**

```bash
git add src/components/ScenePage src/scenes src/utils
git commit -m "feat(ui): route all user-facing numbers through formatQuantity"
```

---

### Task 6: Acceptance

- [ ] **Step 1: Manual smoke with `npm run dev`**

`/scene/pull-friction`:

1. All visible numbers two decimals  
2. `G_t` / `G_n` visible  
3. High μₛ at rest → only static friction block  
4. After sliding → only kinetic block  
5. Liftoff → friction N/A  

Spot-check `/scene/double-slit` (or any non-mechanics) for two-decimal overlay/charts.

- [ ] **Step 2: Automated checks**

```bash
npx --yes tsx scripts/assert-format-quantity.ts
npx --yes tsx scripts/assert-pull-friction-derived.ts
npm run lint
```

- [ ] **Step 3: Push + update PR**

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| Display-layer two decimals | 1, 4, 5 |
| Engine not quantized | 2 |
| Mechanics rule; land pull-friction | 2–4 |
| \(G_t\)/\(G_n\) | 2–4 |
| Active friction only | 3–4 |
| Param μₛ/μₖ remain | 3 (explicit) |
| Single status source | 2–3 (`frictionMode`) |
| Charts / sliders | 5 |

No TBD placeholders. Names match repo: `createInitialState`, `tick`, `detectStatus`, `fs_max`, `F_actual`, `E0`, `ScenePage`.
