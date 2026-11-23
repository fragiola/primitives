---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

Range fields and the pickers' typed input, natively in React, Vue and Angular, each in its own entry. `/date-range-field` (`Root`, `Input` with a required `range`, `"start"` or `"end"`, `Segment`): a start and an end date (or date and time) typed in segments, each an APG spinbutton, as one sequence (typing moves on into the end, Backspace and the arrows cross back), a `DateRange` value once both ends are complete, an end before the start invalid through the hidden inputs' crossed `min` / `max` (`rangeOverflow` / `rangeUnderflow`), `startName` and `endName`, `min`, `max`, `isDateUnavailable`, `granularity`, `required`, `readOnly`, `disabled`, form reset and Field support. `/time-range-field`: the same over a `TimeRange` (no range across midnight). `/date-picker-input` (`DatePickerInput`: `Root`, `Segments`, `Segment`) and `/date-range-picker-input` (`DateRangePickerInput`): opt-in roots that replace the picker's Root and add DateField segments beside its Trigger, bound both ways (a typed entry sets the value only when complete and valid, a chosen date fills the segments, a time granularity's calendar chooses the date part and keeps the typed time), with the picker's form and the segments as the Field control; `/date-picker` and `/date-range-picker` are unchanged. The toolkit's `segmentTarget` moves across several groups, and `/time` gains the `TimeRange` type.
