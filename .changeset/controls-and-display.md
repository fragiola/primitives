---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

Controls and display components, natively in React, Vue and Angular, each in its own entry. `/button`: a native `button` or a `render` element with `role="button"` and a native button's keys (`nativeButton`), `disabled` and `focusableWhenDisabled`. `/radio-group` and `/radio`: the APG radio group (one tab stop at the checked radio, arrows move and check, mirrored in RTL through the direction provider, `loopFocus`, `orientation`), hidden radio inputs (`name`, `required`, form reset) and Field support. `/switch`: the APG switch (`Root`, `Thumb`) with a hidden checkbox input, `uncheckedValue`, `required`, `readOnly` and Field support. `/progress`: a `progressbar` (`Root`, `Label`, `Value`, `Track`, `Indicator`), determinate or indeterminate (`value={null}`), `min`/`max`, `format`/`locale`, `data-progressing`/`data-complete`/`data-indeterminate` and the `--progress-indicator-size` variable. `/avatar`: `Root`, `Image` (rendered only once loaded, `onLoadingStatusChange`) and `Fallback` (`delay`). `/separator`: `role="separator"` with `aria-orientation`, or `decorative`. The toolkit gains `radioKeyTarget` (`/collection`), `progressValue` (`/range`) and a new `/image` entry (`watchImageStatus`).
