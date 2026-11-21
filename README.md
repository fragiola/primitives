# primitives

`@fragiola/primitives` is a library of headless, accessible UI primitives (Dialog, Menu, Combobox,
Calendar, ...) that ships the same catalog with the same behaviour in React, Vue and Angular. Each
framework package is a native implementation sharing only a per-component spec, a framework-free
DOM toolkit and one conformance suite.

The first version (stage 0) ports the cross-framework POC's components to production: Dialog,
Popover, Menu, Combobox, Select, Tooltip, Tabs, Checkbox and CheckboxGroup, Slider, Calendar,
RangeCalendar, DatePicker and DateRangePicker. See [`docs/handoff.md`](docs/handoff.md) and
[`docs/catalog.md`](docs/catalog.md).
