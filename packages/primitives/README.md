# @fragiola/primitives

The framework-free **DOM toolkit** of [Fragiola Primitives](https://fragiola.com/primitives):
the DOM behaviours and the pure math that the React, Vue and Angular primitives
(`@fragiola/primitives-react`, `-vue`, `-angular`) share. It holds no component state: every
function takes elements and options, and returns a value or a cleanup.

```sh
pnpm add @fragiola/primitives
```

**One entry per mechanism.** Import what you use from its subpath; the root entry only re-exports
them, so both tree-shake to the same output.

| entry | what |
| --- | --- |
| `@fragiola/primitives/overlay` | `openOverlaySession(document, options)`: a layer, the focus-out watch and the focus return of an overlay |
| `@fragiola/primitives/layers` | `pushLayer(document, options)` (Escape and outside press on the topmost overlay), `watchFocusOutside` |
| `@fragiola/primitives/focus` | `getTabbables`, `nextTabbableAfter`, `previousTabbableBefore`, `trapFocus`, `focusInitial`, `isKeyboardModality` |
| `@fragiola/primitives/scroll-lock` | `lockScroll(document)` → unlock (counted) |
| `@fragiola/primitives/inert` | `inertOutside(elements)` → restore |
| `@fragiola/primitives/positioning` | `anchorFloating(anchor, floating, options)` → cleanup (Floating UI), `toPlacement`, `fromPlacement`, `Side`, `Align` |
| `@fragiola/primitives/collection` | `stepIndex`, `edgeIndex`, `stepThroughNone`, `tabsKeyTarget`, `menuKeyTarget`, `submenuKeys`, the roving focus (`rovingKeyTarget`, `rovingKeys`, `rovingTabStop`, `textFieldKeepsKey`, `inDocumentOrder`), `createTypeahead`, the combobox's item helpers, `chipKeyTarget` |
| `@fragiola/primitives/presence` | `nextFrame`, `waitForAnimations` |
| `@fragiola/primitives/pointer` | `startDrag`, `isInSafeArea`, `isInHoverBridge`, `trackHoverBridge` |
| `@fragiola/primitives/swipe` | `watchSwipe(element, options)` → cleanup (pointer and touch swipes, scroll containment), `swipeRelease`, `swipeMovement`, `swipeProgress`, `resolveSnapPoints` |
| `@fragiola/primitives/hover` | `createHoverIntent`, `createDelayGroup` |
| `@fragiola/primitives/range` | range math (`snapToStep`, `valueToPercent`, thumbs) and `sliderKeyTarget` |
| `@fragiola/primitives/number` | a number field's localized text (`formatNumber`, `parseNumber`, `isNumberText`: grouping, decimal separators, non-Latin digits, currency and percent), `stepNumber`, `clampNumber`, the press-and-hold `watchAutoRepeat` and the `watchScrub` of a scrub area |
| `@fragiola/primitives/selection` | the collections mechanism: the list model (`createListModel`), the selection rules (`applySelection`: `none`, `single`, `multiple`, the APG's toggle and replace models, ranges, select all) and the listbox's key map (`listKeyTarget`, `listPressSelection`, `pageTarget`) |
| `@fragiola/primitives/form` | `bridgeForm`, `validateField`, the field's state and change rules, `onSubmitAttempt`, a Label's press (`preventLabelSelection`, `labelFocusTarget`), an OTP field's value (`normalizeOtp`, `replaceOtp`, `removeOtpCharacter`, `otpPattern`) |
| `@fragiola/primitives/date` | `PlainDate` (`{ year, month, day }`, no time zone) and its math, `monthGrid`, `calendarKeyTarget`, the locale data from `Intl` |
| `@fragiola/primitives/id` | `createId` |
| `@fragiola/primitives/direction` | `getDirection(element)` |

ESM only, `"sideEffects": false`. It never touches the global `document` or `window` (only an
element's `ownerDocument` and `defaultView`), and its only runtime dependency is
`@floating-ui/dom`, reached by the positioning entry alone.

MIT licence.
