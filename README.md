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

Today, 62 components in React, Vue and Angular ([`spec/`](spec)), stages 0, 1, 2 and 3 complete:

| group | components |
| --- | --- |
| overlays | **Dialog**, **AlertDialog**, **Drawer**, **Popover**, **Tooltip**, **HoverCard**, **Menu** (checkbox and radio items, submenus), **ContextMenu** |
| notifications | **Toast** (on the toolkit's toast queue, which a plain module can import) |
| navigation and disclosure | **Tabs**, **NavigationMenu**, **Pagination**, **Collapsible**, **Accordion** |
| forms | **Field**, **Fieldset**, **Form**, **Button**, **Checkbox** and **CheckboxGroup**, **RadioGroup** and **Radio**, **Switch**, **Slider**, **Select**, **Combobox**, **Autocomplete**, **Listbox** (on the collections mechanism) |
| virtual and async lists | **ListboxVirtual**, **SelectVirtual**, **ComboboxVirtual**, **AutocompleteVirtual** (opt-in entries on the toolkit's virtualizer), and each framework's async list |
| inputs | **Label**, **NumberField** (localized text, held buttons, scrub), **OTPField** |
| dates | **Calendar**, **RangeCalendar**, **DatePicker**, **DateRangePicker**, **DateField**, **TimeField**, **DateRangeField** and **TimeRangeField** (typed in segments, on the toolkit's segment editing and time values), and the pickers' opt-in typed input (**DatePickerInput**, **DateRangePickerInput**); the multiple-date **MultipleCalendar**, **CalendarPreset**, **MonthCalendar**, **YearCalendar** (and their ranges), **MonthPicker**, **YearPicker** (and their ranges) and a calendar's day, month and year views (**CalendarView**); every one of them in 13 calendar systems and the date-time fields and pickers in time zones (the toolkit's `/calendar-systems` and `/time-zone`, injected, computed on `Intl`) |
| toggles and bars | **Toggle**, **ToggleGroup**, **Toolbar**, **Menubar** (on Menu) |
| display | **Progress**, **Meter**, **Avatar**, **Separator**, **ScrollArea** (native scrolling, custom scrollbars), **AspectRatio** |

Plus the [direction provider](spec/direction.md) and the render utilities. Stage 0 ported the
cross-framework POC's components to production; stage 1 brought the production scope and
Fragiola UI parity; stage 2 the consensus set; stage 3 the dates and times (`docs/handoff.md` §5). See [`docs/handoff.md`](docs/handoff.md),
[`docs/catalog.md`](docs/catalog.md) and [`docs/decisions.md`](docs/decisions.md); the rules are in [`AGENTS.md`](AGENTS.md).

```sh
pnpm install
pnpm check && pnpm typecheck && pnpm test && pnpm build   # build runs the bundle guard
pnpm conformance                                          # the conformance suite, every framework
pnpm dev                                                  # every fixture's dev server
pnpm site:dev                                             # the embeds on http://localhost:5191
```

MIT licence.
