---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

The color pickers, natively in React, Vue and Angular, each in its own entry, completing the Color family. `/color-swatch` (`ColorSwatch`): a color over the recipe's checkerboard, an `img` named by the app (else by the color's CSS text). `/color-swatch-picker` (`ColorSwatchPicker`: `Root`, `Item`): the APG listbox of swatches laid out in rows, ArrowUp and ArrowDown moving between the rows, a Field control submitting the color as hex. `/color-picker` (`ColorPicker`: `Root`, `FormatSelect`, `EyeDropperTrigger`): one color shared with the ColorArea, ColorSlider, ColorWheel, ColorField, ColorSwatchPicker and ColorSwatch inside it (a control with its own `value` or `defaultValue` keeps its own state), a format switch converting the value to its space, the browser's eyedropper where `EyeDropper` exists, a Field control submitting the color as hex; it bundles no overlay code. `/color-picker-popover` (`ColorPickerPopover`: `Root`, `Trigger`, `Portal`, `Positioner`, `Popup`): its opt-in non-modal popup on Popover's overlay lifecycle. The four color controls read an enclosing picker. The toolkit adds `openEyeDropper` and `supportsEyeDropper` to `/color` and `rowTarget` to `/selection`. Every other entry is unchanged.
