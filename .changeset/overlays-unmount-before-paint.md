---
"@fragiola/primitives": patch
"@fragiola/primitives-react": patch
"@fragiola/primitives-angular": patch
---

Closing overlays and disclosure panels no longer flash: once the exit animations finish, the popup is unmounted before the browser paints again. Before this, an exit made with a keyframe animation whose `animation-fill-mode` is `none` (tw-animate-css's `animate-out`) showed the popup back at full opacity for one frame. React now ends the exit inside `flushSync` (popups and the Collapsible, Accordion and Tabs panels), and Angular renders it with `ApplicationRef.tick()`. Vue already rendered it in time. The toolkit's `waitForAnimations` also waits for an animation that starts while it is waiting.
