---
"@fragiola/primitives-react": patch
"@fragiola/primitives-vue": patch
---

A picker's calendar keeps its focus inside a Dialog: every picker (DatePicker, DateRangePicker, the month and year pickers and the typed DatePickerInput and DateRangePickerInput) focuses the grid's focused cell once its popup is a layer of the overlay tree, so an enclosing Dialog's focus trap no longer takes the focus back to its first tabbable; the arrows and Enter reach the grid, and Escape closes the popup first, then the dialog. Angular already did.
