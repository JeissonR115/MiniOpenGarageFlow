# Design

## Context

See `proposal.md` for motivation and `specs/visual-consistency/spec.md` for the required behavior. The sidebar already uses `lucide-react`; other forms and list actions are mostly text-only. Shared component styling, including buttons, panels, inputs, tables, and responsive overrides, lives in `src/app/globals.css`. `src/app/layout.tsx` defines the current display and sans-serif fonts.

## Goals / Non-Goals

**Goals:**

- Reuse the installed Lucide library and give navigation and actions consistent, recognizable icons.
- Apply a restrained, proportionate classic treatment across shared interface elements by adjusting layout, spacing, dimensions, borders, corner radii, and shadows.
- Preserve the current font families, color values, visible action labels, responsive behavior, and functional outcomes.

**Non-Goals:**

- Add another icon dependency, change application data or business logic, or alter authorization, filtering, CSV contents, and routes.
- Change font families, the color palette, or the meaning and visibility of existing actions.

## Decisions

1. **Reuse Lucide and retain text labels.** Extend the icon conventions already used by `AppSidebar` to primary navigation and visible actions in the dashboard, customer, vehicle, order, service, user, and login flows. Include filter application, **Limpiar**, and **Exportar CSV** in both list pages. Icons supplement rather than replace labels; decorative SVGs are hidden from assistive technology, and any icon-only control keeps an accessible name. This avoids a second visual vocabulary and preserves discoverable actions.
2. **Keep visual changes in the shared presentation layer.** Refine shared CSS and only the markup needed to pair icons with controls. Use the existing color and font tokens unchanged; tune alignment, spacing, sizing, borders, corner treatment, and restrained shadows instead. This lets the whole app share the treatment without introducing a new theme or modifying data behavior.
3. **Preserve responsive and interaction states.** Apply refinements alongside existing mobile overrides and retain focus-visible, disabled, hover, and permission-dependent states. Existing links, forms, and export URLs remain the source of behavior.

## Risks / Trade-offs

- [Global control styles can affect mobile navigation and forms differently] → Check the shared controls at desktop and mobile breakpoints, keeping the existing sidebar and mobile-menu overrides intact.
- [Icons can become ambiguous or inaccessible if they replace labels] → Keep action text visible and mark adjacent decorative icons as hidden from assistive technology; retain accessible names on icon-only controls.
- [Visual refinements could unintentionally alter brand treatment] → Do not edit the existing font declarations or color tokens; limit changes to geometry and icon placement.

## Migration Plan

No data, route, or dependency migration is needed. Release the interface changes normally; rollback consists of reverting the presentation and markup changes. The existing icon library remains in use.
