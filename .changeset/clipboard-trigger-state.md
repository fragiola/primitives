---
"@fragiola/primitives-react": minor
---

Clipboard's Trigger content can follow the status, as the Indicator's: in React its children may be a function of the state (`{({ copied }) => (copied ? "Copied" : "Copy link")}`), so a visible label that changes names the button in both states with no `aria-label` (WCAG 2.5.3 Label in Name). Vue's Trigger default scoped slot (`v-slot="{ state }"`) and Angular's `state()` through `exportAs` (`#trigger="clipboardTrigger"`) already gave it; the Indicator stays `aria-hidden`.
