---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

Toast and HoverCard, natively in React, Vue and Angular, each in its own entry (`/toast`, `/hover-card`). Toast renders a toast queue that lives outside every framework: `createToastManager` (also from each `/toast` entry) holds the app's notifications, so a plain module can import it and add toasts with no component, with `add`, `update`, `close`, promise toasts (loading, then success or error), a `limit` with the rest queued (their timers wait), priorities, per-toast timeouts and pauses while hovered, focused or the page is hidden. Its Viewport is an F6 landmark with two live regions (polite and assertive) that announce each toast once, in order; its Root swipes away through the toolkit's `/swipe`, stacks with `--toast-index`, `--toast-offset-y` and `--toast-height`, and exits through presence (React `Toast.useToastManager`, Vue `useToastManager`, Angular `injectToastManager`). HoverCard (Base UI's PreviewCard) previews a link on hover and keyboard focus after `delay`, stays open while hovered across a safe area, closes after `closeDelay`, Escape or an outside press, never moves focus, and has detached triggers and the overlay lifecycle. The toolkit gains `/toast` (`createToastManager`, `watchToastViewport`, `measureToastHeight`); no new dependency.
