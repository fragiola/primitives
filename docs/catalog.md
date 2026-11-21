# Primitives catalog: every component in the reference libraries

A survey of every headless component shipped by the UI libraries in
`~/organizations/fragiola/references`. It asks what `@fragiola/primitives` (React, Vue, Angular)
must ship to be the most complete headless library, not a Base UI subset.

## Sources

Read from source on 2026-11-21 (index exports, package folders, docs status tags).

| key | library | framework | version |
| --- | --- | --- | --- |
| BU | Base UI | React | 1.9.0 |
| RX | Radix Primitives | React | `radix-ui` 1.8.1 |
| HU | Headless UI | React (Vue 1.7) | 2.2.10 |
| RA | React Aria Components | React | 1.22.1 (`react-aria` 3.53.1) |
| ARK | Zag.js machines + Ark UI | React, Vue, Solid, Svelte | Zag 1.48.0, Ark 5.40.0 |
| KB | Kobalte | Solid | 0.13.14 |
| RK | Reka UI | Vue | 2.11.0 |
| BT | Bits UI | Svelte | 2.21.0 |
| ML | Melt next-gen | Svelte | 0.44.0 (pre-1.0) |
| NG | Angular Aria + CDK | Angular | 22.3 |
| SP | Spartan brain | Angular | 1.10.0 |
| APG | W3C ARIA Authoring Practices | — | 30 patterns |

Styled catalogs were also read, to see what apps expect: shadcn/ui 4.23 (bases Base UI, Radix and
React Aria), Web Awesome 3.15, Blueprint 6, Untitled UI, Angular Material 22.

Legend: ✓ shipped; ~ shipped but alpha, beta, preview, unstable or partial; blank: missing.
"POC" marks the ten components the POC already built in five frameworks.

## 1. The matrix

### Overlays

| component | BU | RX | HU | RA | ARK | KB | RK | BT | ML | NG | SP | APG | POC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dialog | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AlertDialog | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ | |
| Drawer / Sheet (swipe, snap points) | ✓ | | | ✓ | ~ | | ~ | | | | ✓ | | |
| Popover | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ |
| HoverCard / PreviewCard | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | | | ✓ | | |
| Tooltip | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ |
| Toast | ✓ | ✓ | | ~ | ✓ | ✓ | ✓ | | ✓ | | ✓ | | |
| Tour (spotlight steps) | | | | | ✓ | | | | | | | | |
| FloatingPanel (drag, resize, minimize) | | | | | ✓ | | | | | | | | |

### Menus and commands

| component | BU | RX | HU | RA | ARK | KB | RK | BT | ML | NG | SP | APG | POC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Menu, with submenus | ✓ | ✓ | ~ (no submenus) | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ~ (CDK) | ✓ | ✓ |
| Menu checkbox and radio items | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ~ (CDK) | ✓ | |
| ContextMenu | ✓ | ✓ | | ~ (hook) | ✓ | ✓ | ✓ | ✓ | | ✓ | ~ (CDK) | | |
| Menubar | ✓ | ✓ | | | | ✓ | ✓ | ✓ | | ✓ | ~ (CDK) | ✓ | |
| NavigationMenu (mega menu) | ✓ | ✓ | | | ✓ | ✓ | ✓ | ✓ | | | ✓ | ~ | |
| Filterable menu | ~ | | | ✓ (Autocomplete) | | | ✓ | | | | | | |
| Command palette | | | | ✓ (Autocomplete + Menu) | | | | ✓ | | | ✓ | | |

### Selection

| component | BU | RX | HU | RA | ARK | KB | RK | BT | ML | NG | SP | APG | POC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Select | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ |
| Select, multiple | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | | |
| Combobox | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Combobox, multiple with chips | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | | ✓ |
| Autocomplete (free text) | ✓ | | | ~ | ✓ | ✓ (Search) | ~ | | | ✓ | ✓ | ✓ | |
| Listbox (standalone) | | | | ✓ | ✓ | ✓ | ✓ | | | ✓ | | ✓ | |
| CascadeSelect (nested levels) | | | | | ~ | | | | | | | | |
| TagGroup (selectable, removable tags) | | | | ✓ | | | ~ | | | | | | |
| SegmentedControl | | | | | ✓ | ✓ | | | | | | | |
| Toggle | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | |
| ToggleGroup | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | | | ✓ | | |
| ColorSwatchPicker | | | | ✓ | ✓ | | ~ | | | | | | |

### Form controls

| component | BU | RX | HU | RA | ARK | KB | RK | BT | ML | NG | SP | APG | POC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Button | ✓ | | ✓ | ✓ | | ✓ | | ✓ | | | ✓ | ✓ | |
| Checkbox (mixed state) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | | ✓ | ✓ | ✓ |
| CheckboxGroup | ✓ | | | ✓ | ✓ | | ✓ | ✓ | | | | | ✓ |
| RadioGroup | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | |
| Switch | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | | ✓ | ✓ | |
| Slider, range and multi-thumb | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ~ (single) | | ✓ | ✓ | ✓ |
| AngleSlider (circular) | | | | | ✓ | | | | | | | | |
| NumberField (spinbutton) | ✓ | | | ✓ | ✓ | ✓ | ✓ | | | | | ✓ | |
| Text field / Input / Textarea | ✓ | | ✓ | ✓ | ~ (Field) | ✓ | | | | | ✓ | | |
| SearchField | | | | ✓ | | ✓ | | | | | | | |
| PasswordInput (show / hide) | | ~ | | | ✓ | | | | | | | | |
| OTP / PinInput | ✓ | ~ | | | ✓ | | ✓ | ✓ | ✓ | | ✓ | | |
| TagsInput / TokenField | ~ (Combobox chips) | | | ~ | ✓ | | ✓ | | | | | | |
| Editable (inline edit) | | | | | ✓ | | ✓ | | | | | | |
| Rating | | | | | ✓ | ~ | ~ | ✓ | | | | ✓ | |
| FileUpload / DropZone | | | | ✓ | ✓ | ✓ | | | ✓ | | | | |
| Color: Area, Slider, Wheel, Field, Swatch, Picker | | | | ✓ | ✓ | ✓ | ~ | | | | | | |
| SignaturePad | | | | | ✓ | | | | | | | | |
| ImageCropper | | | | | ~ | | | | | | | | |
| Field (label, description, error, validation) | ✓ | | ✓ | ✓ | ✓ | ✓ | ~ | | | | ✓ | | |
| Fieldset | ✓ | | ✓ | | ✓ | | | | | | | | |
| Form (validation, server errors) | ✓ | ~ | | ✓ | | | ~ | | | | | | |

### Date and time

| component | BU | RX | HU | RA | ARK | KB | RK | BT | ML | NG | SP | APG | POC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Calendar | | | | ✓ | ✓ | | ~ | ✓ | | | ✓ | ✓ | ✓ |
| RangeCalendar | | | | ✓ | ✓ | | ~ | ✓ | | | ✓ | | ✓ |
| Calendar, multiple dates | | | | | ✓ | | ~ | ✓ | | | ✓ | | |
| Month and year pickers | | | | ✓ | ✓ | | ~ (and ranges) | ✓ | | | ✓ | | |
| DateField (typed segments) | | | | ✓ | ~ | | ~ | ✓ | | | | ~ | |
| TimeField | | | | ✓ | ✓ (DateInput) | ~ | ~ | ✓ | | | | | |
| DateRangeField / TimeRangeField | | | | ✓ (in picker) | ✓ | | ~ | ✓ | | | | | |
| DatePicker | | | | ✓ | ✓ | | ~ | ✓ | | | ✓ | ✓ | ✓ |
| DateRangePicker | | | | ✓ | ✓ | | ~ | ✓ | | | | | ✓ |
| Presets ("last 7 days") | | | | | ✓ | | | | | | | | |
| Timer (countdown, stopwatch) | | | | | ✓ | | | | | | | | |

Calendar systems and time zones: RA, RK and BT use `@internationalized/date` (13 calendar
systems, `ZonedDateTime`, DST rules). Zag has its own `date-utils`, and Spartan has date adapters
(native, UTC, Jalali, Luxon). Base UI has internal date-fns and Luxon adapters but no public date
component yet. **Angular has no headless date picker at all**: Angular Material's is styled only.

### Navigation and disclosure

| component | BU | RX | HU | RA | ARK | KB | RK | BT | ML | NG | SP | APG | POC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tabs | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Accordion | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| Collapsible / Disclosure | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | |
| Toolbar | ✓ | ✓ | | ✓ | | | ✓ | ✓ | | ✓ | | ✓ | |
| Pagination | | | | | ✓ | ✓ | ✓ | ✓ | | | | | |
| Steps / Stepper | | | | ~ (hook) | ✓ | | ✓ | | | ✓ (CDK) | | | |
| Breadcrumbs | | | | ✓ | | ✓ | | | | | | ✓ | |
| Link (router aware) | | | | ✓ | | ✓ | | | | | | ✓ | |
| Carousel | | | | | ✓ | | ~ | | | | | ✓ | |
| Table of contents (scroll spy) | | | | | ~ | | | | | | | | |
| NavigationTree (sidebar of links) | | | | ~ | | | | | | ✓ (Tree nav mode) | | ✓ (treeview) | |

### Feedback, layout, data display

| component | BU | RX | HU | RA | ARK | KB | RK | BT | ML | NG | SP | APG | POC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Progress (linear, circular) | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | | |
| Meter | ✓ | | | ✓ | | ✓ | | ✓ | | | | ✓ | |
| Avatar (image fallback) | ✓ | ✓ | | | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | | |
| ScrollArea | ✓ | ✓ | | | ✓ | | ✓ | ✓ | | | | | |
| Separator | ✓ | ✓ | | ✓ | | ✓ | ✓ | ✓ | | | ✓ | | |
| AspectRatio | | ✓ | | | | | ✓ | ✓ | | | | | |
| Marquee | | | | | ✓ | | | | | | | | |
| QR code | | | | | ✓ | | | | | | | | |
| JSON tree viewer | | | | | ~ | | | | | | | | |
| Text highlight | | | | | ✓ | | | | | | | | |
| Clipboard (copy button) | | | | | ✓ | | | | | ✓ (CDK) | | | |
| Chat message scroller | | | | | | | | | | | ✓ | | |
| Tree view | | | | ✓ | ✓ | | ~ | | ✓ | ✓ | | ✓ | |
| Table, GridList, Grid | | | | ✓ | | | | | | ✓ | | ✓ | |
| Splitter | | | | | ~ | | ✓ | | | | ✓ | ✓ | |

### Utilities

| utility | who ships it |
| --- | --- |
| Portal | RX, HU, ARK, KB, NG, SP; BU and RK build it into parts |
| Focus scope / trap | RA, ARK, RK, NG, HU; BU and RX internally |
| VisuallyHidden | RX, RA, RK |
| Direction provider | BU, RX, RA (I18nProvider), NG (Bidi) |
| Locale / i18n provider, formatters, collator, filter | RA, ARK, KB, RK |
| Presence / transitions | ARK, RK, HU (Transition), BU (internal) |
| Collections (list, grid, tree) and selection model | RA, ARK, KB, NG (CDK) |
| Async list (paging, sorting, filtering) | RA (`useAsyncList`), ARK |
| Virtualizer | RA (own), RK, HU, BU, ARK (TanStack or scroll-to-index) |
| Drag and drop in collections | RA, NG (CDK) |
| Live announcer | RA, KB, NG, ARK, RX (0.x) |
| Hotkeys | ARK (preview), Blueprint |
| Render prop / `mergeProps` | BU (`useRender`), RX (`Slot`), RA, ARK, BT, ML |
| Environment (shadow DOM, iframe root) | ARK |
| CSP nonce | BU, RK |

## 2. What the matrix shows

- **No library has everything.**
  - Base UI is strong on overlays and forms, and has no date or time component at all.
  - React Aria is the most complete on data, forms and dates, but has no Menubar, NavigationMenu
    or stable Toast.
  - Zag/Ark is the broadest catalog (51 machines) and the only one with Tour, FloatingPanel,
    SignaturePad and ImageCropper.
  - Reka is the most complete Vue library, but most of its date, color and form components are
    alpha.
- **The consensus set** (in 7 or more of the 11 libraries) is small: Dialog, AlertDialog, Popover,
  Tooltip, Menu, Select, Combobox, Checkbox, RadioGroup, Switch, Slider, Toggle, Tabs, Accordion,
  Collapsible, Progress, Avatar. The POC already has 9 of these.
- **Dates are the clearest gap.**
  - Base UI, Radix, Headless UI, Kobalte and Melt have no calendar.
  - Angular has no headless date picker at all.
  - Only React Aria, Zag/Ark and Bits ship the full family (calendar, segmented fields, pickers,
    ranges) as stable.
  - The POC's calendar family already passes tests React Aria fails, so this is where Fragiola
    can lead.
- **Angular is the thinnest ecosystem.**
  - Angular Aria covers 8 patterns.
  - Spartan brain covers most of the shadcn set but has no tree, grid or menu of its own.
  - A complete headless library for Angular has no direct competitor.
- **Cross-cutting capabilities matter as much as components.**
  - virtualization and async loading of collections;
  - detached triggers (Base UI handles, Bits tether);
  - drag and drop in lists;
  - calendar systems and time zones;
  - one Field layer that every control plugs into.

  Each one is a mechanism in `@poc/dom`, written once.

## 3. Proposed scope for `@fragiola/primitives`

The rules:
- **Behaviour only.** Components that are only markup and CSS belong to Fragiola UI, not here.
  Examples: Card, Badge, Alert, Skeleton, Kbd, Spinner, Empty, Item, Typography.
- **Each component lives in one place in the ecosystem.** These already have their own Fragiola
  library:
  - Tree view: `@fragiola/tree`
  - Splitter: `@fragiola/splitter`
  - Table, GridList and Grid: `@fragiola/data-grid`
  - Drag and drop: `@fragiola/dnd`
  - Dashboard layout: `@fragiola/grid-layout`
  - Node graphs: `@fragiola/flow`
- **APG first.** Where the APG has no pattern, follow Base UI. Every component gets a spec and a
  conformance suite, as in the POC.
- **Same catalog in React, Vue and Angular.** A component is done only when all three pass.

The stages:

| stage | components | why |
| --- | --- | --- |
| 0. From the POC (exists, 5 frameworks) | Dialog, Popover, Menu, Combobox, Select, Tooltip, Tabs, Checkbox and CheckboxGroup, Slider, Calendar, RangeCalendar, DatePicker, DateRangePicker | bring to production scope (`production-scope.md`) |
| 1. Fragiola UI parity | Field, Fieldset, Form; Button; RadioGroup; Switch; Accordion; Collapsible; AlertDialog; ContextMenu; Menu checkbox and radio items; Drawer; NavigationMenu; Progress; Avatar; Separator | what Fragiola UI imports from Base UI today |
| 2. The consensus set | Toast, HoverCard, Toggle, ToggleGroup, Toolbar, Menubar, ScrollArea, Meter, NumberField, OTP field, Autocomplete, Listbox, Pagination, Label, AspectRatio | in most libraries; apps expect them |
| 3. The date and time family | DateField, TimeField, DateRangeField, TimeRangeField, multiple-date calendar, month and year pickers (and ranges), presets, calendar systems and time zones | the gap nobody else fills in every framework |
| 4. Differentiators | Command palette, TagsInput, TagGroup, SegmentedControl, Editable, Rating, FileUpload and DropZone, Color family (Area, Slider, Wheel, Field, Swatch, SwatchPicker, Picker), Steps, Carousel, PasswordInput, SearchField, Breadcrumbs, Link, CascadeSelect, Clipboard | in 1 to 4 libraries; what makes the catalog "complete" |
| 5. Niche (only on demand) | Tour, FloatingPanel, AngleSlider, SignaturePad, ImageCropper, Marquee, Timer, Table of contents, QR code, JSON tree, Highlight, chat message scroller | one library each |

The mechanisms to build in the DOM layer, before the stages that need them:

| mechanism | needed by |
| --- | --- |
| Field layer (ids, label, description, error, validity, states) | stage 1 and every later form control |
| Collections: list, grid and tree models, selection, typeahead, sections | Listbox, Autocomplete, TagGroup, Command, CascadeSelect |
| Virtualizer and async list | Combobox, Select, Listbox, Command |
| Detached triggers with payload | Dialog, Popover, Menu, Tooltip, Drawer |
| Swipe gestures and snap points | Drawer, Toast |
| Segment editing and calendar systems | stage 3 |
| Color model and channel gradients | the Color family |
| Toast queue (outside the framework) | Toast |

Size of the full catalog, stages 0–4: about 85 components, each built three times. Stage 5 adds
about 12 more.
