---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

Drawer and NavigationMenu, natively in React, Vue and Angular, which complete stage 1. The toolkit gains the `/swipe` entry: `watchSwipe` (pointer and touch swipes that lock on an axis after 6 px, with pointer capture, scroll containment and a touch that does not scroll the page), `swipeRelease`, `swipeMovement`, `swipeProgress` and `resolveSnapPoints`; only Drawer imports it. New entry `/drawer`, built on Dialog's parts plus a `Content`: a modal panel at an edge (`swipeDirection`, `"down"` by default) dismissed by a swipe (the new reason `swipe`), with snap points (`snapPoints`, `snapPoint` / `defaultSnapPoint` / `onSnapPointChange`), nested drawers (`data-nested-drawer-open`, `--nested-drawers`), `data-swiping`, `data-swipe-direction`, `data-swipe-dismiss`, `data-expanded` and the variables `--drawer-swipe-movement-x`, `--drawer-swipe-movement-y`, `--drawer-snap-point-offset` and `--drawer-swipe-progress`, and a Drawer handle. New entry `/navigation-menu`: the APG disclosure navigation menu with Base UI's parts (Root, List, Item, Trigger, Icon, Content, Link, Portal, Backdrop, Positioner, Popup, Viewport, Arrow), hover and press opening with delays, the arrow keys between the items, the open key into a Content, one shared popup sized by the open Content (`--popup-width`, `--popup-height`, `--positioner-width`, `--positioner-height`), `data-activation-direction` on the Contents, and nested levels through the overlay tree.
