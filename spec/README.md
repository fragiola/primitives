# Specs

The source of truth for every component. Each framework implementation, each style recipe
(`examples/shared/src/recipes/`) and each conformance test (`conformance/`) follows these pages. A
behaviour change starts here (with its reason), then the tests, then the implementations
(AGENTS.md rule 5). Moved from the POC (`maurodesouza/poc-cross-framework-primitives`, `spec/`) and
updated for this library's decisions (`docs/handoff.md` §3, `docs/decisions.md`).

| spec | components |
| --- | --- |
| [dialog.md](dialog.md) | Dialog |
| [tabs.md](tabs.md) | Tabs |
| [popover.md](popover.md) | Popover |
| [tooltip.md](tooltip.md) | Tooltip |
| [menu.md](menu.md) | Menu (with submenus) |
| [field.md](field.md) | Field |
| [fieldset.md](fieldset.md) | Fieldset |
| [form.md](form.md) | Form |
| [checkbox.md](checkbox.md) | Checkbox and CheckboxGroup |
| [radio-group.md](radio-group.md) | RadioGroup and Radio |
| [switch.md](switch.md) | Switch |
| [button.md](button.md) | Button |
| [slider.md](slider.md) | Slider |
| [select.md](select.md) | Select |
| [combobox.md](combobox.md) | Combobox (D10) |
| [calendar.md](calendar.md) | Calendar, RangeCalendar, DatePicker and DateRangePicker |
| [progress.md](progress.md) | Progress |
| [avatar.md](avatar.md) | Avatar |
| [separator.md](separator.md) | Separator |
| [direction.md](direction.md) | DirectionProvider and reading the direction (a global provider, no component) |

The render utilities (React `useRender` and `mergeProps`, and the Vue and Angular equivalents)
have no spec of their own: they are the primitive contract's `render`, made public
([below](#render-utilities)).

Every spec of the POC is here: stage 0 (`docs/handoff.md` §5) is ported, with §3's changes applied.
Stage 1 adds the Field layer (Epic #26: Field to production, Fieldset, Form, every form control in
a Field, Slider's Label and Value, the pickers' form support) and the direction provider; then
the controls and display components (Epic #29: Button, RadioGroup and Radio, Switch, Progress,
Avatar, Separator).

Primary source: the WAI-ARIA Authoring Practices (APG) patterns in
`~/organizations/fragiola/references/wai-aria-practices/content/patterns/`. The behaviour rule is
**APG first; where the APG has no rule, Base UI** (`references/base-ui`; D4, `docs/handoff.md`):
a spec says which one it follows wherever they differ.

## The format of a spec

Every spec has these sections, in this order:

1. **Purpose**: what the component is for, and what it is not.
2. **Anatomy**: each part, its default element and its part attribute value.
3. **API**: the props of each part, their defaults, the events, controlled and uncontrolled state.
   Names are the normalized names below; each framework expresses them as the mapping table says.
4. **State attributes and ARIA**: per part, what the primitive sets.
5. **Keyboard**: the key map.
6. **Focus**: where focus goes on open, close and inside.
7. **Pointer**: mouse, touch and pen.
8. **Dismissal and layering** (overlays).
9. **Positioning** (positioned overlays).
10. **Animation**: the enter and exit states.
11. **RTL**: what changes in right-to-left.
12. **Scenarios**: the fixtures every implementation renders, and what each one checks.
13. **Differences from Base UI**: where the spec departs from Base UI, and why (D4).

## Shared conventions

### Part attribute

Every element a primitive renders carries `data-primitives-part="<component>-<part>"`, the
component's slug and the part in kebab-case (guidelines `decisions.md#np-part-attribute`):
`data-primitives-part="dialog-popup"`, `"tabs-tab"`, `"menu-submenu-trigger"`. One attribute for
the whole library, since many components have parts of the same name; the POC's
`data-<component>-part` is converted during the port. The conformance contract layer and the style
recipes select by it, never by class names.

### State attributes

A boolean state is an attribute that is **present** (empty value) or **absent**, never `"false"`.
The vocabulary is shared by every component:

| attribute | meaning |
| --- | --- |
| `data-open` | an overlay while open |
| `data-popup-open` | a trigger while its overlay is open (Base UI's name, D4 §3 "Naming"): a Menu, Popover, Select or picker trigger, a Combobox's Input, InputGroup and Trigger |
| `data-starting-style` | an element that just mounted, for one frame, so a CSS transition starts from it |
| `data-ending-style` | an element whose exit animation is running; it unmounts when its animations finish |
| `data-disabled` | the part is disabled |
| `data-highlighted` | the item that keyboard or pointer navigation points at (menu item, combobox item) |
| `data-selected` | a selected tab, combobox item or calendar date |
| `data-pressed` | not used in these specs |
| `data-orientation` | `horizontal` or `vertical` (a value, not a boolean) |
| `data-activation` | `automatic` or `manual` on Tabs (a value) |
| `data-side` | the side an overlay ended up on (a value: `top`, `bottom`, the logical `inline-start` / `inline-end`, or the physical `left` / `right`, named as the overlay asked for it; Base UI's names, D4 §3 "Naming", [popover.md](popover.md#positioning)) |
| `data-align` | `start`, `center` or `end` (a value) |
| `data-today` | the calendar cell of today |
| `data-outside-month` | a calendar cell of the previous or next month |
| `data-unavailable` | a calendar date the app marked unavailable |
| `data-readonly` | a read-only calendar or switch |
| `data-range-start`, `data-range-end`, `data-in-range` | the range of a RangeCalendar |
| `data-range-preview` | a cell inside the range being chosen (between the start and the hovered or focused date) |
| `data-empty` | a combobox list with no item |
| `data-nested` | a submenu's positioner and popup |
| `data-checked`, `data-unchecked`, `data-indeterminate` | a checkbox's state (exactly one is present); a switch's and a radio's `data-checked` / `data-unchecked`; an indeterminate Progress |
| `data-progressing`, `data-complete` | a Progress's status (with `data-indeterminate`: exactly one is present) |
| `data-required` | a required form control |
| `data-placeholder` | a Select showing its placeholder |
| `data-instant` | a tooltip that opened with no delay |
| `data-dragging` | a slider while a pointer drags a thumb |
| `data-index` | a slider thumb's value index (a value) |
| `data-invalid`, `data-valid` | a field that shows an error, or that validated and is valid (neither before its first validation) |
| `data-dirty`, `data-touched`, `data-filled`, `data-focused` | a field whose value changed, whose control lost focus once, whose value is not empty, whose control has focus |

### No text, and the one exception

Primitives render only their children: no UI copy and no accessible name of their own. The
fixtures give every name (`aria-label`, `<label>`, text children). **The exception is locale data**
in the calendar family: the month heading, the weekday names, the day numbers and each cell's full
date name come from `Intl` for the given locale. They are data, not copy, and no app could provide
them cell by cell; the consumer can still replace each one ([calendar.md](calendar.md#api)).

### Change details

Every `on<Value>Change` receives the new value and a details object: `{ reason }`. The reasons are
shared:

| reason | when |
| --- | --- |
| `trigger-press` | the trigger toggled the overlay |
| `close-press` | a `Close` part was pressed |
| `escape-key` | Escape dismissed the overlay |
| `outside-press` | a press outside the overlay (and its child layers) dismissed it |
| `focus-out` | focus left a non-modal overlay |
| `item-press` | a menu or combobox item was chosen |
| `list-navigation` | the keyboard opened a menu or combobox |
| `input-change` | typing opened or changed a combobox |
| `input-press` | a press on a combobox's input (or its input group, its chips) opened it |
| `input-clear` | a combobox's text was cleared: a choice with `multiple`, or a close that reset it to empty |
| `clear-press` | a combobox's Clear was pressed |
| `chip-remove-press` | a combobox chip's remove button was pressed |
| `trigger-hover` | the pointer entered or left a tooltip's trigger (or its popup) |
| `trigger-focus` | keyboard focus entered or left a tooltip's trigger |
| `keyboard` | a key changed a slider's value |
| `track-press` | a press on a slider's control moved a thumb |
| `drag` | a pointer drag moved a slider's thumb |
| `none` | anything else (a programmatic change) |

### Normalized API names

| concept | name |
| --- | --- |
| open state | `open`, `defaultOpen`, `onOpenChange(open, details)` |
| value | `value`, `defaultValue`, `onValueChange(value, details)` |
| disabled | `disabled` |
| orientation | `orientation` |
| arrow keys wrap around | `loopFocus` (Base UI's name, D4 §3 "Naming") |
| an element to focus | `initialFocus`, `finalFocus` (an element, a ref, or `false` for none; Vue and Angular also take a getter, read when the focus moves; Angular also an `ElementRef`) |
| positioning | `side` (`top`, `bottom`, `inline-start`, `inline-end`, `left`, `right`), `align` (`start`, `center`, `end`), `sideOffset`, `alignOffset`, `collisionPadding` |
| a modal overlay that is non-modal by default | `modal` (Menu and Select; scroll lock and a blocked outside pointer, [menu.md](menu.md#modal), [select.md](select.md#modal)) |
| locale | `locale` (a BCP 47 tag; defaults to the document's `lang`, then the browser's) |

Controlled and uncontrolled: when `value` (or `open`) is given, the component is controlled and
only reports changes; otherwise it keeps its own state, seeded by `defaultValue`.

**A controlled value the consumer rejects stays the consumer's value.** A controlled component
reports a change and then shows whatever the consumer gives back. When the consumer keeps the
value unchanged (an `inputValue` that refuses some characters, an `open` that stays `true`), the
component shows the consumer's value, not the user's input: the input's text goes back to the
kept value within the same event, and a kept `open` leaves the overlay open and working (focus
inside, the outside inert). Frameworks that write a native element before the consumer answers
(an `<input>`'s text) must re-assert the kept value after the consumer's update has rendered.
Scenarios: [`/dialog/rejected-close`](dialog.md#dialogrejected-close),
[`/combobox/rejected-input`](combobox.md#comboboxrejected-input), and the `controlled` scenarios of
Checkbox, Slider and Select.

### Forms

The form controls (Select, Checkbox, Switch, RadioGroup, Slider, Combobox, DatePicker,
DateRangePicker) take `name` and render a **hidden input** that
carries their value, so a native `<form>` submits them (`FormData`), resets them (`reset` returns
an uncontrolled control to its default) and, where `required` applies, validates them as the
native control would. A hidden input is never in the accessibility tree nor in the tab order
(`aria-hidden="true"`, `tabindex="-1"`, or `type="hidden"`): users meet the primitive's own role
only. Each hidden input carries the component's part attribute with the value `input` (Combobox:
`hidden-input`, since its `input` is the visible Input).

**The Field layer** ([field.md](field.md)) sits above the controls. A `Field.Root` around a
`Field.Control` (a native input), a Checkbox, a CheckboxGroup, a Switch, a RadioGroup, a Select, a Slider, a Combobox, a
DatePicker or a DateRangePicker gives the control:

- its label (`Field.Label`, linked with `for` and `aria-labelledby`);
- its description (`Field.Description`, in `aria-describedby`);
- its validation: the native validity of the element the form validates, plus a `validate`
  function, shown on submit, on blur or on change (`validationMode`), with `Field.Error` parts and
  `aria-invalid`;
- the states `data-invalid`, `data-valid`, `data-dirty`, `data-touched`, `data-filled` and
  `data-focused`.

Each control follows the spec's integration contract: it takes the field's ids, `name` and
`disabled`, and reports its focus and its changes. Outside a field, it behaves as before.
[Fieldset](fieldset.md) groups fields under a legend and disables them; [Form](form.md) validates
every field on submission, focuses the first invalid one, and shows server errors.

## API mapping by framework

The specs describe one API. Each framework expresses it with its own means, never as a foreign API:

| concept | React | Vue | Angular |
| --- | --- | --- | --- |
| namespace | `Dialog.Popup` (object of components) | `Dialog.Popup` (object of components) | one standalone directive per part, selector `[dialogPopup]`, class `DialogPopup` |
| element override (`render`) | `render={<section />}` or `render={(props, state) => ...}` | `as="section"`, or the `#render="{ props, state, children }"` scoped slot | the directive sits on the consumer's own element (Angular's `render`) |
| portal | `<Dialog.Portal>` (`createPortal` into `body`) | `<Dialog.Portal>` (`Teleport`) | the structural `*dialogPortal` on an `<ng-container>`: its view moves to `body`, in the declaration's injectors and change detection |
| controlled state | `open` + `onOpenChange` | `v-model:open` (`open` prop + `update:open` emit) | `open = input<boolean>()` + `openChange = output<boolean>()` (two-way `[(open)]` or one-way `[open]`; not `model()`, which writes its own value) |
| uncontrolled seed | `defaultOpen` | `default-open` | `defaultOpen = input()` |
| change details | `onOpenChange(open, details)` | `@open-change="(open, details) => ..."` (besides `update:open`) | `openChangeDetails = output<{ open, details }>()` (`(openChange)` emits the value alone) |
| class and style from state | `className` / `style` as a value or `(state) => value` | `class` / `style` values; state through `data-*` or the `render` slot | the consumer's own `class`; state through `data-*` or the directive's `state()` signal (`exportAs`) |
| element reference | `ref` prop | template ref (the component instance, element as `$el`) | the host element: a template reference variable (`#cancel`); `#cancel="dialogClose"` gives the directive |
| children function (collections, calendar weeks, a combobox's List and Value) | `children={(item) => ...}` | default scoped slot (`v-slot="{ week }"`) | `@for` over the directive's signal, read through `exportAs` (`@for (week of body.weeks(); ...)`, `{{ cell.dayNumber() }}`); a part rendered only in some states is structural (`*tabsPanel="'account'"`) |
| field context (a control inside `Field.Root`) | `useContext` of the field's context | `inject` of the field's provided state | `injectField()` (optional injection of the enclosing `[fieldRoot]`) |
| field validation (`validate`, `validationMode`) | `validate={(value) => ...}` `validationMode="onBlur"` | `:validate="(value) => ..."` `validation-mode="onBlur"` | `[validate]="fn"` `validationMode="onBlur"` (inputs of `[fieldRoot]`) |
| server errors (Form) | `errors={...}` `onClearErrors={(errors) => ...}` | `:errors="..."` `@clear-errors="(errors) => ..."` | `[errors]="..."` `(clearErrors)="..."` on `form[formRoot]` |
| a submission the Form lets through | `onSubmit` | `@submit` | `(submit)` (a blocked submission stops the event in its capture phase, before any listener of the consumer) |
| direction | `<DirectionProvider direction="rtl">`, `useDirection()` | `<DirectionProvider direction="rtl">`, `useDirection()` (a computed ref) | `[directionProvider]="'rtl'"` or `provideDirection('rtl')`, `injectDirection()` (a signal) |
| render utilities | `useRender({ render, props, state, ref })`, `mergeProps(a, b, ...)` (`/render`) | `renderPart(tag, context, as, state, props)`, `asProp` (`/render`; Vue's own `mergeProps` merges attributes) | `dataValue`, `dataValues` (`/render`: the directive sits on the consumer's own element, Angular's `render`) |
| part hooks (lower layer) | not shipped yet: the parts are the API | not shipped yet: the parts are the API | `injectDialog()`, `injectTabs()`, `injectPopover()`, `injectTooltip()`, `injectMenu()`, `injectCombobox()` → `{ state, ... }` of the enclosing root; `injectField()` → the enclosing `[fieldRoot]` or `null` (the parts are the directives themselves) |
| a menu item's activation | `onClick` on `Menu.Item` | `@click` on `Menu.Item` | `(click)` on the `[menuItem]` element |

Fragiola's existing mapping of the same contract: `~/organizations/fragiola/dockable/site/docs/concepts/primitive-contract.mdx`
(the "In Vue" and "In Angular" sections), `dockable/packages/vue`, `dockable/packages/angular`
and `splitter/packages/*`.

## Render utilities

The primitive contract's `render` is public in every framework, in its own entry (`/render`,
D8), for an app that writes its own parts with the same contract (Base UI's `useRender` and
`mergeProps`):

- **React**: `useRender({ render, props, state, ref, defaultTagName })` renders `defaultTagName`
  (`"div"`), or the consumer's `render` (an element its props merge into, or a function of the
  props and the state), with `props` merged in and the state's `data-*` attributes (a boolean
  `true` gives an empty attribute, `false` none; a string a value: the rule of "State
  attributes"); `className` and `style` may be functions of the state. `mergeProps(...props)`
  merges props left to right as every part does: event handlers compose (the earlier first),
  `className` joins, `style` merges (the later wins), any other later prop wins (`undefined`
  leaves the earlier).
- **Vue**: `renderPart(tag, { attrs, slots }, as, state, props, children?)` renders a part from a
  component's `setup` render function: the props merged with the attributes (Vue's own
  `mergeProps`), on `tag`, on `as`, or through the `render` scoped slot; `asProp` is the `as` prop
  definition; `stateAttributes(state)` gives the `data-*` attributes.
- **Angular**: a directive sits on the consumer's element, so there is nothing to render:
  `dataValue(value)` and `dataValues(state)` give the `data-*` host binding values (`""`, a string,
  or `null` to remove).

## Server rendering

Every component renders on the server and hydrates with no mismatch, in every framework (Epic #22;
the conformance suite's **ssr** layer renders every scenario below on a server, hydrates it, and
checks that the page ends as the browser alone renders it, keeps the server's ids, and logs no
warning). A part renders on the server what it can know there: no measurement (an overlay renders
closed; a part that follows a measurement renders without it until it is mounted) and nothing a
server does not know about the reader (a calendar's default locale, `calendar.md` "API"). Ids are
the framework's (`useId` in React and Vue, an application's own counter in Angular), never a
counter of the JavaScript realm, which a server shares between pages. A part created outside its
framework's template (Angular's hidden inputs) is added in the browser once the page is hydrated.
Base UI's parts that need a script before hydration: the Tabs Indicator (`renderBeforeHydration`,
`tabs.md`); the Slider thumb needs none (its position is a percentage, `slider.md`).

## Scenarios and fixtures

Every scenario is a page at `/<component>/<scenario>` in every fixture (`fixtures/<framework>`).
The specs fix:

- the content and the **accessible names** (text, `aria-label`, `<label>`), so the behaviour tests
  find elements by role and name and never by implementation detail;
- what the fixture prints outside the component (`data-testid="output"`): the last value, the last
  open state and the last change reason, as `key: value` lines;
- a `data-testid` on an element the behaviour layer must find but that has no role (a popover's
  Arrow), named in the scenario;
- query parameters: `?locale=<tag>` and `?dir=rtl` where a scenario says so; `?locale=none`
  passes no `locale` and leaves the document with no `lang`.

The conformance suite fixes "today" with Playwright's clock: **2026-11-20** (a Friday) in every
calendar scenario.
