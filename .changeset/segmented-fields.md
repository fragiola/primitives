---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

Segmented date and time fields, natively in React, Vue and Angular, each in its own entry. `/date-field` (`Root`, `Input`, `Segment`): a date typed in segments, each an APG spinbutton, in the order, digits and names `Intl` gives the locale; digits fill a segment and move on, the arrows step it with a wrap, Page Up/Down by a larger step, Home and End to its edges, ArrowLeft and ArrowRight to the segment on that side of the screen, Backspace erases; `granularity` (`day`, or `hour`, `minute`, `second` for a `PlainDateTime`), `placeholderValue`, `hourCycle`, `min`, `max`, `isDateUnavailable` (invalid values carry `data-invalid`), `locale`, a hidden native `date` or `datetime-local` input for forms, and the Field layer. `/time-field`: the same anatomy over a `PlainTime`, with the locale's hour cycle and the day period typed by its first letter, submitting an ISO time. The toolkit gains `/time` (`PlainTime`, `PlainDateTime`, their comparison, math and ISO text) and `/segments` (the segment editing on `Intl.DateTimeFormat#formatToParts`), written in-house with no date library; only the two fields import them.
