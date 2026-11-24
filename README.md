# primitives

`@fragiola/primitives` is a library of headless, accessible UI primitives (Dialog, Menu, Combobox,
Calendar, ...) that ships the same catalog with the same behaviour in React, Vue and Angular. Each
framework package is a native implementation sharing only a per-component spec, a framework-free
DOM toolkit and one conformance suite. Docs: <https://fragiola.com/primitives>.

| package | what |
| --- | --- |
| [`@fragiola/primitives`](packages/primitives) | the framework-free DOM toolkit, one entry per mechanism |
| [`@fragiola/primitives-react`](packages/react) | the React primitives, one entry per component |
| [`@fragiola/primitives-vue`](packages/vue) | the Vue primitives, one entry per component |
| [`@fragiola/primitives-angular`](packages/angular) | the Angular directives, one secondary entry point per component |

Today, 86 components in React, Vue and Angular ([`spec/`](spec)), stages 0, 1, 2, 3 and 4 complete (stage 5, the niche components, comes only on demand):

| group | components |
| --- | --- |
| overlays | **Dialog**, **AlertDialog**, **Drawer**, **Popover**, **Tooltip**, **HoverCard**, **Menu** (checkbox and radio items, submenus), **ContextMenu** |
| notifications | **Toast** (on the toolkit's toast queue, which a plain module can import) |
| navigation and disclosure | **Tabs**, **NavigationMenu**, **Pagination**, **Collapsible**, **Accordion** |
| forms | **Field**, **Fieldset**, **Form**, **Button**, **Checkbox** and **CheckboxGroup**, **RadioGroup** and **Radio**, **Switch**, **Slider**, **Select**, **Combobox**, **Autocomplete**, **Listbox** (on the collections mechanism) |
| virtual and async lists | **ListboxVirtual**, **SelectVirtual**, **ComboboxVirtual**, **AutocompleteVirtual** (opt-in entries on the toolkit's virtualizer), and each framework's async list |
| inputs | **Label**, **NumberField** (localized text, held buttons, scrub), **OTPField** |
| dates | **Calendar**, **RangeCalendar**, **DatePicker**, **DateRangePicker**, **DateField**, **TimeField**, **DateRangeField** and **TimeRangeField** (typed in segments, on the toolkit's segment editing and time values), and the pickers' opt-in typed input (**DatePickerInput**, **DateRangePickerInput**); the multiple-date **MultipleCalendar**, **CalendarPreset**, **MonthCalendar**, **YearCalendar** (and their ranges), **MonthPicker**, **YearPicker** (and their ranges) and a calendar's day, month and year views (**CalendarView**); every one of them in 13 calendar systems and the date-time fields and pickers in time zones (the toolkit's `/calendar-systems` and `/time-zone`, injected, computed on `Intl`) |
| tags and choices | **TagGroup** (a grid of removable, selectable tags), **TagsInput** (tags typed, pasted, edited in place; a form control), **SegmentedControl** (a radio group with a moving Indicator), **Rating** (stars in whole or half steps) |
| text inputs | **PasswordInput** (a toggle button shows the text, keeping the caret), **SearchField** (Escape and a clear button), **Editable** (a text edited in place, its modes and focus return), **Clipboard** (a copy button, its copied state and a polite announcement) |
| navigation | **Link** (current and disabled, on your router's link, no router dependency), **Breadcrumbs** (the APG trail, a collapsed middle opening a Menu), **Steps** (a linear process with `aria-current="step"`), **Carousel** (the APG carousel, basic or tabbed, native scroll snapping and the rotation rules) |
| color controls | **ColorSlider** (one channel along a gradient track), **ColorArea** (two channels on a 2D area, two APG sliders), **ColorWheel** (the hue on a ring, wrapping), **ColorField** (hex or one channel typed, committed on Enter and blur), on the toolkit's color model (`/color`: rgb, hsl and hsb with alpha) |
| color pickers | **ColorSwatch** (a color over a checkerboard, an image), **ColorSwatchPicker** (a palette, the APG listbox in rows), **ColorPicker** (one color shared by the controls inside it, a format switch, the eyedropper; an inline picker bundles no overlay code), **ColorPickerPopover** (its opt-in popup) |
| commands and cascades | **Command** (a command palette: the APG combobox with an always shown list of actions, its scorer, nested pages, and the opt-in **CommandVirtual** list), **CascadeSelect** (a select whose popup opens one list per level of a tree) |
| files | **DropZone** (a drop target for files: drag, paste, or a press that opens the file dialog, with a polite announcement), **FileUpload** (a form control holding a list of files: the checks and their reasons, sizes, image previews, the native form through its hidden file input; the app uploads) |
| toggles and bars | **Toggle**, **ToggleGroup**, **Toolbar**, **Menubar** (on Menu) |
| display | **Progress**, **Meter**, **Avatar**, **Separator**, **ScrollArea** (native scrolling, custom scrollbars), **AspectRatio** |

Plus the [direction provider](spec/direction.md) and the render utilities. Stage 0 ported the
cross-framework POC's components to production; stage 1 brought the production scope and
Fragiola UI parity; stage 2 the consensus set; stage 3 the dates and times; stage 4 the differentiators, from TagGroup to FileUpload (`docs/handoff.md` §5). See [`docs/handoff.md`](docs/handoff.md),
[`docs/catalog.md`](docs/catalog.md) and [`docs/decisions.md`](docs/decisions.md); the rules are in [`AGENTS.md`](AGENTS.md).

```sh
pnpm install
pnpm check && pnpm typecheck && pnpm test && pnpm build   # build runs the bundle guard
pnpm conformance                                          # the conformance suite, every framework
pnpm dev                                                  # every fixture's dev server
pnpm site:dev                                             # the embeds on http://localhost:5191
```

MIT licence.
