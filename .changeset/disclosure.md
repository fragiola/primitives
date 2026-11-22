---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

Disclosure components, natively in React, Vue and Angular, each in its own entry. `/collapsible` (`Root`, `Trigger`, `Panel`): the APG disclosure, `open`/`defaultOpen`, `disabled`, and a panel animatable in CSS with no layout jump: `--collapsible-panel-height`/`-width` are the content's size in pixels while it opens or closes (set before the transition starts) and `auto` at rest, with `data-starting-style`/`data-ending-style`; `keepMounted`, and `hiddenUntilFound` (`hidden="until-found"`: the browser's find-in-page opens a closed panel). `/accordion` (`Root`, `Item`, `Header`, `Trigger`, `Panel`): the APG accordion, `value`/`defaultValue` as an array, `multiple`, `disabled`, `orientation`, `loopFocus`, the arrows, Home and End between the enabled triggers (mirrored in RTL), and the same panel mechanics with `--accordion-panel-height`/`-width`. Tabs gains `data-activation-direction` (physical: `left`, `right`, `up`, `down`, `none`) on every part, panel enter and exit states (`data-starting-style`, `data-ending-style`, `inert` while exiting, with `keepMounted`), and the Indicator's physical variables `--active-tab-left`/`-right`/`-top`/`-bottom`/`-width`/`-height`. The toolkit gains `measurePanelSize`, `freezePanelSize`, `panelSizeVariables` and `watchBeforeMatch` (`/presence`), and `accordionKeyTarget`, `activationDirection` and `tabsIndicatorBox` (`/collection`).
