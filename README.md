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

Today: **Dialog** and **Tabs** ([`spec/`](spec)). The first version (stage 0) ports the
cross-framework POC's components to production: Dialog, Popover, Menu, Combobox, Select, Tooltip,
Tabs, Checkbox and CheckboxGroup, Slider, Calendar, RangeCalendar, DatePicker and
DateRangePicker. See [`docs/handoff.md`](docs/handoff.md), [`docs/catalog.md`](docs/catalog.md)
and [`docs/decisions.md`](docs/decisions.md); the rules are in [`AGENTS.md`](AGENTS.md).

```sh
pnpm install
pnpm check && pnpm typecheck && pnpm test && pnpm build   # build runs the bundle guard
pnpm conformance                                          # the conformance suite, every framework
pnpm dev                                                  # every fixture's dev server
pnpm site:dev                                             # the embeds on http://localhost:5191
```

MIT licence.
