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

Today, 33 components in React, Vue and Angular ([`spec/`](spec)), stages 0 and 1 complete, stage 2
under way:

| group | components |
| --- | --- |
| overlays | **Dialog**, **AlertDialog**, **Drawer**, **Popover**, **Tooltip**, **Menu** (checkbox and radio items, submenus), **ContextMenu** |
| navigation and disclosure | **Tabs**, **NavigationMenu**, **Collapsible**, **Accordion** |
| forms | **Field**, **Fieldset**, **Form**, **Button**, **Checkbox** and **CheckboxGroup**, **RadioGroup** and **Radio**, **Switch**, **Slider**, **Select**, **Combobox** |
| dates | **Calendar**, **RangeCalendar**, **DatePicker**, **DateRangePicker** |
| toggles and bars | **Toggle**, **ToggleGroup**, **Toolbar** |
| display | **Progress**, **Avatar**, **Separator** |

Plus the [direction provider](spec/direction.md) and the render utilities. Stage 0 ported the
cross-framework POC's components to production; stage 1 brought the production scope and
Fragiola UI parity (`docs/handoff.md` §5). See [`docs/handoff.md`](docs/handoff.md),
[`docs/catalog.md`](docs/catalog.md) and [`docs/decisions.md`](docs/decisions.md); the rules are in [`AGENTS.md`](AGENTS.md).

```sh
pnpm install
pnpm check && pnpm typecheck && pnpm test && pnpm build   # build runs the bundle guard
pnpm conformance                                          # the conformance suite, every framework
pnpm dev                                                  # every fixture's dev server
pnpm site:dev                                             # the embeds on http://localhost:5191
```

MIT licence.
