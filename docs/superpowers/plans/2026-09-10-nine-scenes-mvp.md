# Nine Scenes MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship 9 runnable ScenePlugins matching home catalog IDs, unlock cards, and generalize ScenePage so friction-only UI does not break other scenes.

**Architecture:** Each scene is a `ScenePlugin` under `src/scenes/<camelCase>/` (config, physics, Scene3D, index). Register in `registry.ts`. Unlock in `SceneGrid.tsx`. Gate pull-friction overlays/liftoff behind `sceneId === 'pull-friction'`; add a generic live-data overlay for others. Charts grid columns follow `chartDefs.length`.

**Tech Stack:** React, React Three Fiber, drei, uPlot, existing `SimulationEngine` / Zustand store

## Global Constraints

- Scene IDs must match home cards exactly: `double-slit`, `faraday-induction`, `ideal-gas`, `standing-wave`, `bernoulli`, `photoelectric`, `rlc-circuit`, `doppler`, `kepler-orbit`
- Formula panel stays unmounted; formulas arrays optional but allowed in config
- Desktop experiment page: no page vertical/horizontal scroll regression
- Do not reduce pull-friction chart count or remove its overlays
- Branch: `cursor/nine-scenes-mvp-ee33`; commit frequently; push; PR against `main`

---

## File map

| Path | Role |
|------|------|
| `docs/superpowers/specs/2026-09-10-nine-scenes-mvp-design.md` | Spec (done) |
| `src/pages/ScenePage.tsx` | Gate friction UI; generic transport |
| `src/components/ScenePage/GenericLiveDataOverlay.tsx` | New: t + derived keys |
| `src/components/ScenePage/Charts.tsx` | Dynamic grid cols |
| `src/scenes/<scene>/` × 9 | Plugins |
| `src/scenes/registry.ts` | Register 9 plugins |
| `src/components/Home/SceneGrid.tsx` | `status: 'available'` |

---

### Task 1: Shell generalization

**Files:**
- Modify: `src/pages/ScenePage.tsx`
- Create: `src/components/ScenePage/GenericLiveDataOverlay.tsx`
- Modify: `src/components/ScenePage/Charts.tsx`

- [ ] Gate `LiveDataOverlay`, `FrictionInfoOverlay`, liftoff `useEffect`, Transport `disabled`/`离地` to `sceneId === 'pull-friction'`
- [ ] For other scenes render `GenericLiveDataOverlay` showing `t` and up to 8 numeric `derived` entries (skip internal keys if needed)
- [ ] Charts: `grid-cols-3|4|5` from `Math.min(5, Math.max(3, chartDefs.length))` (if length is 3–5 use exact; if somehow else clamp)
- [ ] Commit: `fix(scene): gate friction overlays; dynamic chart grid`

### Task 2–10: One plugin each

For each scene folder, create `config.ts`, `physics.ts`, `Scene3D.tsx`, `index.ts` following `pullFriction` pattern. Keep Scene3D lightweight (orbit controls, ambient+directional light, simple meshes). 3–5 charts. Status types from existing union only.

#### Task 2: `doubleSlit` / `double-slit`
- Params: `lambda` (nm), `d` (mm), `L` (m), `screenW` (m)
- Physics: phase drive `t`; `I(x)=cos²(π d x /(λ L))` sample at center + fringe spacing `β=λL/d`
- Viz: slits + screen intensity bars
- Charts: I_center, fringe_spacing, phase

#### Task 3: `faradayInduction` / `faraday-induction`
- Params: `B`, `N_turns`, `area`, `v`
- Physics: magnet/loop position `x=v*t` (wrap); `ε = N*B*area*ω*sin(ωt)` simplified oscillating flux
- Viz: coil + moving magnet
- Charts: epsilon, flux, x

#### Task 4: `idealGas` / `ideal-gas`
- Params: `n`, `T`, `V`
- Physics: `P = nRT/V`; animate particle “temperature” via `v` proxy
- Viz: box + bouncing particles (count clamped)
- Charts: P, T, V (V from params mirrored into derived each tick)

#### Task 5: `standingWave` / `standing-wave`
- Params: `L`, `mu`, `tension`, `n_mode`, `amp`
- Physics: `f = (n/(2L))*sqrt(T/μ)`; `y` at antinode
- Viz: string Line/tube standing wave
- Charts: y_antinode, frequency, wavelength

#### Task 6: `bernoulli` / `bernoulli`
- Params: `rho`, `A1`, `A2`, `v1`, `h1`, `h2`
- Physics: continuity `v2=v1*A1/A2`; Bernoulli ΔP
- Viz: pipe constriction + particle flow
- Charts: v2, deltaP, Q_flow

#### Task 7: `photoelectric` / `photoelectric`
- Params: `freq` (Hz×10^14), `intensity`, `workFunction` (eV)
- Physics: `K_max = hf - W`; rate ∝ intensity if K>0
- Viz: plate + photon hits + electron spray when above threshold
- Charts: K_max, rate, threshold_ratio

#### Task 8: `rlcCircuit` / `rlc-circuit`
- Params: `R`, `L`, `C`, `V0`
- Physics: underdamped/overdamped Q'' + (R/L)Q' + Q/(LC)=0; store Q in `x`, I in `v`
- Viz: schematic-ish R/L/C blocks + charge bar
- Charts: Q, I, energy

#### Task 9: `doppler` / `doppler`
- Params: `f0`, `vs`, `vo`, `v_sound`
- Physics: `f' = f0*(v±vo)/(v±vs)`; wavefront expand
- Viz: source moving, observer, rings
- Charts: f_obs, wavelength, approach_factor

#### Task 10: `keplerOrbit` / `kepler-orbit`
- Params: `M`, `a`, `e`
- Physics: Keplerian θ-dot from areal law; `r=a(1-e²)/(1+e cosθ)`; put θ in `x`
- Viz: central sun + orbiting body + ellipse line
- Charts: r, speed, true_anomaly

After each plugin (or batched 2–3): register in `registry.ts`, set card available, commit.

### Task 11: Register + unlock all

- [ ] Ensure `registry.ts` imports all 9
- [ ] All 9 cards `status: 'available'` in `SceneGrid.tsx`
- [ ] Commit: `feat(scenes): register and unlock nine MVP scenes`

### Task 12: Verify + ship

- [ ] `npm run lint`
- [ ] Smoke: build or vite preview; hit each route mentally via import check
- [ ] Push branch; open/update PR; merge to `main` if CI green / user overnight preference

---

## Physics cheat-sheet (implementation constants)

- Ideal gas: `R = 8.314`
- Photoelectric: `h = 4.135667696e-15` eV·s; map UI `freq` as ×10¹⁴ Hz
- Kepler: `G = 6.67430e-11`; use solar-mass scale params so orbit visible (e.g. M in solar masses, a in AU, display units in derived)
- Prefer stable Euler / analytic forms; clamp dt usage in RLC
