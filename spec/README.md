# Specs

The source of truth for every component. Each framework implementation, each style recipe
(`examples/shared/src/recipes/`) and each conformance test (`conformance/`) follows these pages. A
behaviour change starts here (with its reason), then the tests, then the implementations
(AGENTS.md rule 5). Moved from the POC (`maurodesouza/poc-cross-framework-primitives`, `spec/`) and
updated for this library's decisions (`docs/handoff.md` §3, `docs/decisions.md`).

| spec | components |
| --- | --- |
| [dialog.md](dialog.md) | Dialog |
| [alert-dialog.md](alert-dialog.md) | AlertDialog (on Dialog's parts) |
| [drawer.md](drawer.md) | Drawer (on Dialog's parts, with the swipe and snap points) |
| [tabs.md](tabs.md) | Tabs |
| [collapsible.md](collapsible.md) | Collapsible |
| [accordion.md](accordion.md) | Accordion |
| [popover.md](popover.md) | Popover |
| [tooltip.md](tooltip.md) | Tooltip |
| [menu.md](menu.md) | Menu (with submenus, checkbox and radio items) |
| [context-menu.md](context-menu.md) | ContextMenu (on Menu's parts) |
| [navigation-menu.md](navigation-menu.md) | NavigationMenu |
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
| [autocomplete.md](autocomplete.md) | Autocomplete (the value is the text; the APG's four autocomplete behaviours) |
| [listbox.md](listbox.md) | Listbox (on the toolkit's collections mechanism, `/selection`) |
| [virtual-lists.md](virtual-lists.md) | ListboxVirtual, SelectVirtual, ComboboxVirtual and AutocompleteVirtual (the opt-in virtual and async lists, on the toolkit's `/virtual` and `/async-list`), and each framework's `useAsyncList` |
| [calendar.md](calendar.md) | Calendar, RangeCalendar, DatePicker and DateRangePicker, the pickers' opt-in typed input (DatePickerInput, DateRangePickerInput), MultipleCalendar and CalendarPreset |
| [month-calendar.md](month-calendar.md) | MonthCalendar, YearCalendar and their range variants, their pickers (MonthPicker, MonthRangePicker, YearPicker, YearRangePicker) and a calendar's views (CalendarView), on the toolkit's `/month-year` |
| [date-field.md](date-field.md) | DateField and TimeField (typed in segments, each an APG spinbutton; on the toolkit's `/segments` and `/time`) |
| [date-range-field.md](date-range-field.md) | DateRangeField and TimeRangeField (two ends typed in segments, on DateField's segments) |
| [progress.md](progress.md) | Progress |
| [avatar.md](avatar.md) | Avatar |
| [separator.md](separator.md) | Separator |
| [toggle.md](toggle.md) | Toggle |
| [toggle-group.md](toggle-group.md) | ToggleGroup (on Toggle) |
| [toolbar.md](toolbar.md) | Toolbar (with nested composites in its roving focus) |
| [menubar.md](menubar.md) | Menubar (a bar of Menu triggers, on Menu) |
| [label.md](label.md) | Label (a standalone `<label>` for a control outside a Field) |
| [number-field.md](number-field.md) | NumberField (a spinbutton with localized text, auto repeat and scrub) |
| [meter.md](meter.md) | Meter |
| [otp-field.md](otp-field.md) | OTPField (a one-time code, one input per slot) |
| [toast.md](toast.md) | Toast (on the toolkit's toast queue) |
| [hover-card.md](hover-card.md) | HoverCard |
| [scroll-area.md](scroll-area.md) | ScrollArea (native scrolling, custom scrollbars, on the toolkit's `/scroll-area`) |
| [pagination.md](pagination.md) | Pagination (no APG pattern and no Base UI component: the APG-closest behaviour, decided there; the range is the toolkit's `/pagination`) |
| [tag-group.md](tag-group.md) | TagGroup (no APG pattern and no Base UI component: React Aria's grid of tags, decided there; its selection on the toolkit's `/selection`) |
| [tags-input.md](tags-input.md) | TagsInput (no APG pattern and no Base UI component: Zag/Ark's and Reka UI's, decided there; a form control, one hidden input per tag) |
| [aspect-ratio.md](aspect-ratio.md) | AspectRatio (one structural style; why it is here despite D5) |
| [direction.md](direction.md) | DirectionProvider and reading the direction (a global provider, no component) |

The render utilities (React `useRender` and `mergeProps`, and the Vue and Angular equivalents)
have no spec of their own: they are the primitive contract's `render`, made public
([below](#render-utilities)).

Every spec of the POC is here: stage 0 (`docs/handoff.md` §5) is ported, with §3's changes applied.
Stage 1 adds the Field layer (Epic #26: Field to production, Fieldset, Form, every form control in
a Field, Slider's Label and Value, the pickers' form support) and the direction provider; then
the controls and display components (Epic #29: Button, RadioGroup and Radio, Switch, Progress,
Avatar, Separator); then disclosure (Epic #32: Collapsible, Accordion, and Tabs' activation
direction, panel enter and exit states and physical Indicator variables); then the overlay
mechanisms (Epic #35, Issue #33: the nested overlay tree, detached triggers, the open change
details, the lifecycle controls and Dialog's Viewport and nested dialogs, [below](#overlays);
Issue #34: AlertDialog, ContextMenu, Menu's checkbox and radio items, and Select's groups,
separators, item text and optional `items`); then Drawer and NavigationMenu (Epic #38: Issue #36,
the toolkit's swipe mechanism and Drawer; Issue #37, NavigationMenu), which complete stage 1.
Stage 2 starts with the toggles and bars (Epic #49, Issue #47: Toggle, ToggleGroup and Toolbar,
on the toolkit's roving focus, with the rule of [nested composites](toolbar.md#nested-composites);
Issue #48: Menubar, a bar of Menu triggers on the same roving focus, with the contract of a parent
bar that Menu reads, [menu.md](menu.md#in-a-menubar)); then the inputs (Epic #52, Issue #50: Label,
NumberField and Meter, on the toolkit's new `/number` mechanism for localized number text, stepping,
auto repeat and scrub; Issue #51: OTPField, whose input model [otp-field.md](otp-field.md) decides);
then the collections (Epic #55, Issue #53: the toolkit's collections mechanism, `/selection`, and
Listbox on it; Issue #54: Autocomplete, sharing Combobox's behaviour through each framework's
shared code); then the virtual lists (Epic #58), Toast and HoverCard (Epic #61); then ScrollArea,
Pagination and AspectRatio (Epic #64, Issue #62: ScrollArea, on the toolkit's `/scroll-area`;
Issue #63: Pagination, on the toolkit's `/pagination`, and AspectRatio), which complete stage 2.
Stage 3 starts with the segmented fields (Epic #73, Issue #71: the toolkit's segment editing,
`/segments`, and time values, `/time`, and DateField; Issue #72: TimeField and DateField's time
granularities, [date-field.md](date-field.md)), then the range fields and the pickers' typed input
(Epic #76, Issue #74: DateRangeField and TimeRangeField, [date-range-field.md](date-range-field.md);
Issue #75: DatePickerInput and DateRangePickerInput, [calendar.md](calendar.md)), then the calendar
variants (Epic #79, Issue #77: MultipleCalendar and CalendarPreset, [calendar.md](calendar.md);
Issue #78: the month and year calendars and pickers and CalendarView, on the toolkit's
`/month-year`, [month-calendar.md](month-calendar.md)).
Stage 4 starts with the tags and choices (Epic #91, Issue #89: TagGroup and TagsInput,
[tag-group.md](tag-group.md), [tags-input.md](tags-input.md), with their keys in the toolkit's
`/collection` and the rules that add and edit a tag in `/form`).

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
| `data-open` | an overlay while open; an open Collapsible, Accordion item and their panels |
| `data-closed` | a closed Collapsible, Accordion item and their panels; an overlay part that carries `data-open` (popup, positioner, backdrop, viewport, arrow) while it is rendered and not open: its exit animation runs, or it is kept mounted (with `data-open`: exactly one is present; Base UI). Triggers keep `data-popup-open` only |
| `data-panel-open` | a Collapsible's or an Accordion's Trigger while its panel is open (Base UI's name) |
| `data-popup-open` | a trigger while its overlay is open (Base UI's name, D4 §3 "Naming"): a Menu, Popover, Select or picker trigger, a Combobox's or an Autocomplete's Input, InputGroup and Trigger |
| `data-starting-style` | an element that just mounted, for one frame, so a CSS transition starts from it |
| `data-ending-style` | an element whose exit animation is running; it unmounts when its animations finish |
| `data-disabled` | the part is disabled |
| `data-highlighted` | the item that keyboard or pointer navigation points at (menu item, checkbox and radio item, combobox and autocomplete item, select item); a Listbox's focused option while the focus is in the list |
| `data-selected` | a selected tab, combobox item, listbox option or calendar date |
| `data-pressed` | a pressed Toggle (spec/toggle.md) |
| `data-orientation` | `horizontal` or `vertical` (a value, not a boolean) |
| `data-multiple` | a ToggleGroup or a Listbox with `multiple` |
| `data-activation` | `automatic` or `manual` on Tabs (a value) |
| `data-activation-direction` | where the newly selected tab sits from the previous one: `left`, `right`, `up`, `down` or `none` (a physical value, [tabs.md](tabs.md#state-attributes-and-aria)) |
| `data-side` | the side an overlay ended up on (a value: `top`, `bottom`, the logical `inline-start` / `inline-end`, or the physical `left` / `right`, named as the overlay asked for it; Base UI's names, D4 §3 "Naming", [popover.md](popover.md#positioning)) |
| `data-align` | `start`, `center` or `end` (a value) |
| `data-today` | the calendar cell of today |
| `data-outside-month` | a calendar cell of the previous or next month |
| `data-unavailable` | a calendar date the app marked unavailable |
| `data-readonly` | a read-only calendar or switch |
| `data-range-start`, `data-range-end`, `data-in-range` | the range of a RangeCalendar |
| `data-range-preview` | a cell inside the range being chosen (between the start and the hovered or focused date) |
| `data-empty` | a combobox's or an autocomplete's list with no item; a TagGroup's Root and List with no tag (once mounted); a TagsInput's Root and Control with no tag |
| `data-editing` | a TagsInput's Tag while its TagInput edits it |
| `data-nested` | a submenu's positioner and popup; a nested dialog's popup, backdrop and viewport ([dialog.md](dialog.md#nested-dialogs)) |
| `data-nested-dialog-open` | a dialog's popup, backdrop and viewport while a dialog nested in it is open |
| `data-checked`, `data-unchecked`, `data-indeterminate` | a checkbox's state (exactly one is present); a switch's, a radio's and a menu checkbox or radio item's (and their indicators') `data-checked` / `data-unchecked`; an indeterminate Progress |
| `data-progressing`, `data-complete` | a Progress's status (with `data-indeterminate`: exactly one is present); `data-complete` also on every part of an OTPField whose code is `length` long |
| `data-scrubbing` | every part of a NumberField while its ScrubArea scrubs |
| `data-required` | a required form control |
| `data-readonly` (inputs) | a read-only NumberField's, OTPField's, DateField's or TimeField's parts |
| `data-placeholder` | a Select showing its placeholder; a DateField's or TimeField's segment with no value |
| `data-type` | a DateField's or TimeField's segment: its type (a value: `year`, `month`, `day`, `hour`, `minute`, `second`, `dayPeriod`, `literal`) |
| `data-instant` | a tooltip that opened with no delay |
| `data-dragging` | a slider while a pointer drags a thumb |
| `data-current` | a Pagination Item of the current page (with `aria-current="page"`) |
| `data-scrolling` | a ScrollArea's parts while the user scrolls it (a Scrollbar and a Thumb: their own axis) |
| `data-hovering` | a ScrollArea's Scrollbars while a mouse or pen is over its Root |
| `data-has-overflow-x`, `data-has-overflow-y` | a ScrollArea whose content is wider (taller) than its viewport |
| `data-overflow-x-start`, `data-overflow-x-end`, `data-overflow-y-start`, `data-overflow-y-end` | a ScrollArea scrolled away from that edge (the x edges logical) |
| `data-index` | a slider thumb's value index; an OTPField slot's index (a value) |
| `data-invalid`, `data-valid` | a field that shows an error, or that validated and is valid (neither before its first validation); `data-invalid` also on every part of a DateField or TimeField whose value is out of range or unavailable |
| `data-dirty`, `data-touched`, `data-filled`, `data-focused` | a field whose value changed, whose control lost focus once, whose value is not empty, whose control has focus; `data-filled` also on an OTPField slot that holds a character |

### No text, and the one exception

Primitives render only their children: no UI copy and no accessible name of their own. The
fixtures give every name (`aria-label`, `<label>`, text children). **The exception is locale data**
in the calendar family (and the date and time fields' segments: their texts, values and names,
[date-field.md](date-field.md#api)): the month heading, the weekday names, the day numbers and each cell's full
date name come from `Intl` for the given locale. They are data, not copy, and no app could provide
them cell by cell; the consumer can still replace each one ([calendar.md](calendar.md#api)).

### Change details

Every `on<Value>Change` receives the new value and a details object: `{ reason, event }`, the
reason below and the DOM event that caused the change (`undefined` when it was programmatic or is
not known). An overlay's `onOpenChange` receives richer details ([Overlays](#open-change-details)).
The reasons are shared:

| reason | when |
| --- | --- |
| `trigger-press` | the trigger toggled the overlay (a ContextMenu: a right-click or a long press on its area) |
| `close-press` | a `Close` part was pressed |
| `escape-key` | Escape dismissed the overlay |
| `outside-press` | a press outside the overlay (and its child layers) dismissed it |
| `focus-out` | focus left a non-modal overlay |
| `item-press` | a menu, combobox or autocomplete item was chosen (an autocomplete's by Enter too); a menu checkbox or radio item changed; a press changed a Listbox's or a TagGroup's selection; a Pagination Item's press changed its page |
| `list-navigation` | the keyboard opened a menu or combobox (a ContextMenu: its `ContextMenu` key or Shift+F10), or a navigation menu's Content (its open key); a menubar's keys moved from one of its menus to another, closing one and opening the next (spec/menubar.md) |
| `input-change` | typing opened or changed a combobox, or an autocomplete's text; typed (or pasted) text changed a NumberField's value, or an OTPField's (or autofill did); a typed digit or letter, or an erased digit, changed a DateField's or TimeField's value; typing changed a TagsInput's text, or a typed delimiter added its tags |
| `input-press` | a press on a combobox's input (or its input group, its chips) opened it |
| `input-clear` | a combobox's text was cleared: a choice with `multiple`, or a close that reset it to empty; an autocomplete's list closed as its text became empty; a NumberField's text was emptied; Backspace or Delete made a DateField's or TimeField's value `null`; an OTPField slot's character was deleted by the input itself |
| `input-blur` | a NumberField's blur clamped its typed value (spec/number-field.md); leaving an autocomplete's input accepted its inline completion (spec/autocomplete.md); leaving a TagsInput added or cleared its text (`blurBehavior`), or ended a tag's edit (spec/tags-input.md) |
| `input-paste` | a paste filled an OTPField's slots (spec/otp-field.md), or added a TagsInput's tags (spec/tags-input.md) |
| `clear-press` | a combobox's or an autocomplete's Clear, or a TagsInput's ClearTrigger, was pressed |
| `chip-remove-press` | a combobox chip's remove button, a TagGroup's RemoveButton or a TagsInput's TagRemove was pressed |
| `trigger-hover` | the pointer entered or left a tooltip's trigger (or its popup), or a navigation menu's; the pointer entered a menubar's item while another of its menus was open (spec/menubar.md) |
| `trigger-focus` | keyboard focus entered or left a tooltip's trigger |
| `keyboard` | a key changed a slider's value, stepped a NumberField's or a DateField's or TimeField's segment, removed an OTPField's characters (Backspace, Delete), or changed a Listbox's or a TagGroup's selection; Delete or Backspace removed a tag (TagGroup, TagsInput); Enter added a TagsInput's tags or ended a tag's edit |
| `increment-press`, `decrement-press` | a NumberField's Increment or Decrement stepped its value (a press, each repeat of a held press, or a click) |
| `wheel` | the mouse wheel stepped a NumberField's value (`allowWheelScrub`) |
| `scrub` | a NumberField's ScrubArea stepped its value |
| `track-press` | a press on a slider's control moved a thumb |
| `drag` | a pointer drag moved a slider's thumb |
| `swipe` | a swipe dismissed a drawer, or settled it on another snap point (spec/drawer.md) |
| `previous-press`, `next-press`, `first-press`, `last-press` | a Pagination's Previous, Next, First or Last changed its page (an Item's press is `item-press`) |
| `imperative-action` | a handle's `open`, `openWithPayload` or `close`, or the actions' `close()` ([Overlays](#overlays)); its focus return is the one of `none` in every overlay (Base UI's reason) |
| `none` | anything else (a programmatic change; an overlay closed because the overlay it was opened from closed) |

### Normalized API names

| concept | name |
| --- | --- |
| open state | `open`, `defaultOpen`, `onOpenChange(open, details)` |
| pressed state | `pressed`, `defaultPressed`, `onPressedChange(pressed, details)` (Toggle) |
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
DateRangePicker, NumberField, OTPField, Listbox, DateField, TimeField, TagsInput) take `name` and render a **hidden input** that
carries their value, so a native `<form>` submits them (`FormData`), resets them (`reset` returns
an uncontrolled control to its default) and, where `required` applies, validates them as the
native control would. A hidden input is never in the accessibility tree nor in the tab order
(`aria-hidden="true"`, `tabindex="-1"`, or `type="hidden"`): users meet the primitive's own role
only. Each hidden input carries the component's part attribute with the value `input` (Combobox:
`hidden-input`, since its `input` is the visible Input; NumberField, OTPField, DateField, TimeField and TagsInput: `hidden-input` too); Autocomplete has none: its visible Input carries `name` and is the form control, as a text
input is).
Outside a Field, a control is named by a [Label](label.md) (`for`, or wrapping it), or by the
consumer's `aria-label` / `aria-labelledby`.

When the browser validates a native form and a control's hidden input is the form's first
invalid control, focus goes to the primitive (its trigger or button) and the browser neither
shows its bubble on the hidden input nor moves the focus on to a later invalid native control:
the toolkit's form bridge cancels the later controls' `invalid` events of that validation (Epic
#49). The submission stays blocked, and the later controls are reached by the next submission.

**The Field layer** ([field.md](field.md)) sits above the controls. A `Field.Root` around a
`Field.Control` (a native input), a Checkbox, a CheckboxGroup, a Switch, a RadioGroup, a Select, a Slider, a Combobox, a
DatePicker, a DateRangePicker, a NumberField, an OTPField, a Listbox, an Autocomplete, a DateField, a TimeField, a TagGroup or a TagsInput gives the control:

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

## Overlays

Every overlay (Dialog, AlertDialog, Drawer, Popover, Tooltip, HoverCard, Menu and its submenus,
ContextMenu, Select, Combobox, DatePicker, DateRangePicker) shares the mechanisms of this section (Epic #35,
Issues #33 and #34). Each spec says what it adds. NavigationMenu's popup is a layer of the nested
overlay tree too, with a value change and no lifecycle controls (spec/navigation-menu.md).

### The nested overlay tree

The open overlays of a document form a **tree** of layers (`@fragiola/primitives/layers`, used
through `@fragiola/primitives/overlay`), not a stack. An overlay's **parent** is decided when it
opens: the newest open overlay that contains one of its triggers (its owner elements), else the
newest open overlay that contains the focused element, else none. A trigger inside a portaled
popup therefore makes its overlay a child of that popup's overlay, wherever the child's own portal
sits in the DOM: a Popover in a Dialog, a Menu in that Popover, a submenu of that Menu are a
chain of four ([`/dialog/nested-tree`](dialog.md#dialognested-tree)).

- **Escape** closes the newest open overlay only (the deepest of its branch); the next Escape the
  next one.
- **An outside press**: the deepest overlay that contains the press (its own elements, or its
  triggers, which toggle it themselves) stays open with its ancestors; every other open overlay is
  dismissed (reason `outside-press`), newest first. A press outside every overlay dismisses all of
  them. A press on a dialog's Backdrop or Viewport is outside that dialog and inside its parent.
  A Dialog or AlertDialog is a **modal** overlay (the page under it is inert): while one is open, a
  press outside the newest one and its descendants counts as a press inside the overlay it was
  opened from, which stays open with its ancestors ([dialog.md](dialog.md#dismissal-and-layering)).
- **Focus**: a modal Dialog's focus trap and a non-modal overlay's focus-out watch accept focus
  in their **descendants** only (the overlays opened from them).
- **Closing an overlay closes the overlays opened from it** (reason `none`), newest first.

### Open change details

`onOpenChange(open, details)`: `details` is an `OpenChangeDetails` (Base UI's):

| member | what |
| --- | --- |
| `reason` | the reason (table above) |
| `event` | the DOM event that caused the change (a `KeyboardEvent`, `PointerEvent`, `MouseEvent`, `FocusEvent`), `undefined` when programmatic |
| `trigger` | the trigger element the change is associated with: the pressed one for `trigger-press`, else the active trigger; `undefined` when there is none |
| `cancel()` | called inside `onOpenChange`: the change does not happen |
| `isCanceled` | whether `cancel()` was called |
| `preventUnmountOnClose()` | called on a close: the popup stays mounted, with `data-ending-style`, until the actions' `unmount()` is called |

The root calls `onOpenChange` **before** it changes its own state. A canceled change leaves `open`
as it was, controlled or not, and the overlay keeps working exactly as a controlled `open` the
consumer kept (`/dialog/rejected-close`): focus stays, the layer works, a modal's outside stays
inert. Value changes (`onValueChange`) keep `{ reason, event }`: they cannot be canceled (out of
scope).

### Lifecycle

- **`onOpenChangeComplete(open)`**: `true` once an opening's `data-starting-style` frame has
  ended and every animation on the popup has finished; `false` once the exit's animations have
  finished (the popup is unmounted, or hidden when kept mounted). It is not called on the first
  render, nor for an exit a reopening interrupted.
- **Actions** (Base UI's `actionsRef`): `close()` closes the overlay (reason `imperative-action`);
  `unmount()` ends a running exit at once, or the exit held by `preventUnmountOnClose()`.
- **`keepMounted`** on every overlay's **Portal** (Base UI's place): the portal's content stays
  rendered while the overlay is closed, before its first opening and after an exit ends. A kept
  mounted, closed overlay carries `hidden` on its outermost portaled parts (the Positioner, or a
  Dialog's Backdrop, Viewport and Popup) and `data-closed`; it has no layer, no positioning
  updates and no focus effects; reopening shows **the same element**. A server render renders no
  portal content: it appears once the page is hydrated.

### Detached triggers

Dialog, AlertDialog, Drawer, Popover, Menu and Tooltip (Base UI's detached triggers; a ContextMenu
has one Trigger area and no handle):

- A **handle** connects a Root and its Triggers: `createDialogHandle<Payload>()` (and
  `createAlertDialogHandle`, `createDrawerHandle`, `createPopoverHandle`, `createMenuHandle`, `createTooltipHandle`), with `open(triggerId)`,
  `openWithPayload(payload)`, `close()` (reason `imperative-action`) and the getter `isOpen`. A
  call while no Root is attached does nothing (no console output). The Roots attached to one
  handle form a stack: the newest mounted serves it, and when it unmounts the previous one serves
  it again. The handle belongs to one framework: the open state and the payload stay in its Root.
- **Trigger**: `handle`, `payload`, `id` (generated when not given). A Trigger with a `handle` may
  sit anywhere, outside the Root; a Trigger inside the Root needs none; a Root may have several
  Triggers. **Root**: `handle`, `triggerId` / `defaultTriggerId` (the active trigger's id,
  controlled together with `open`: the consumer sets it from `details.trigger`). The active
  trigger's `payload` reaches the Root's content (mapping below).
- **The active trigger** is the one that opened the overlay (or `triggerId`; else the first
  Trigger). Only it carries `data-popup-open`, `aria-expanded="true"` and `aria-controls`; the
  others have `aria-expanded="false"`. A positioned overlay anchors to it, focus returns to it,
  a Menu's popup is labelled by it. A press on **another** Trigger of the same open overlay moves
  the overlay to it: it stays open, takes that Trigger's payload, and `onOpenChange(true,
  details)` is called with `reason: "trigger-press"` and the new `trigger` (not deduplicated).
  The handle's `open(id)` moves it the same way (`imperative-action`); for a Trigger not rendered
  yet, `details.trigger` is `undefined` and the overlay moves to it once it renders. A new
  `payload` of the active Trigger reaches the content at once.
  Hovering another Trigger of an open Tooltip moves it there at once (a Trigger removed while
  hovered no longer counts: the tooltip closes as the pointer left). Every Trigger of an
  overlay is part of its layer (a press on one is not an outside press).

### The lifecycle scenarios

Every overlay has a `/<component>/lifecycle` scenario of one shape (its spec gives the content):

- the overlay's Portal has `keepMounted`; its popup has the recipes' enter and exit transition
  (opacity and scale over `--pr-motion`, which the tests lengthen with `slowMotion`);
- the fixture prints `open: <true|false>` (the open state it was told about and that happened),
  `reason: <the last reason>`, `complete: <true|false|none>` (the last value
  `onOpenChangeComplete` received, `none` before any) and `canceled: <reason|none>` (the reason of
  the last change it canceled);
- with `?cancel` in the URL, its `onOpenChange` calls `details.cancel()` for every close, and
  prints its reason as `canceled`; the overlay is uncontrolled (no `open` prop), so the cancel
  alone keeps it open;
- Dialog, AlertDialog, Drawer and Popover also render a button **"Close with actions"** inside the popup,
  which calls the actions' `close()`.

The common checks (`conformance/tests/lifecycle`), for each overlay:

1. Before the first opening, the kept-mounted part is in the document with `hidden` and
   `data-closed` and without `data-open`; the accessibility tree has no popup of its role.
2. Opening shows that very element (the same node); `complete` stays `none` while the enter
   transition runs, then becomes `true`.
3. Escape closes it (`open: false`, `reason: escape-key`); `complete` stays `true` while the exit
   transition runs (`data-ending-style`), then becomes `false`; the element is still in the
   document, `hidden`, `data-closed`, the same node.
4. With `?cancel`: Escape and an outside press each report `canceled: <reason>` and leave it open
   and working (`open: true`, still visible, the next Escape canceled again). A Tooltip, which is
   no layer, reports the pointer leaving instead of the outside press; an AlertDialog, which an
   outside press never dismisses, reports nothing for it.
5. Dialog, AlertDialog, Drawer and Popover: "Close with actions" closes it with `reason:
   imperative-action`.
6. Axe finds no violation, closed (kept mounted) and open.

## API mapping by framework

The specs describe one API. Each framework expresses it with its own means, never as a foreign API:

| concept | React | Vue | Angular |
| --- | --- | --- | --- |
| namespace | `Dialog.Popup` (object of components) | `Dialog.Popup` (object of components) | one standalone directive per part, selector `[dialogPopup]`, class `DialogPopup` |
| element override (`render`) | `render={<section />}` or `render={(props, state) => ...}` | `as="section"`, or the `#render="{ props, state, children }"` scoped slot | the directive sits on the consumer's own element (Angular's `render`) |
| portal | `<Dialog.Portal>` (`createPortal` into `body`) | `<Dialog.Portal>` (`Teleport`) | the structural `*dialogPortal` on an `<ng-container>`: its view moves to `body`, in the declaration's injectors and change detection |
| controlled state | `open` + `onOpenChange` | `v-model:open` (`open` prop + `update:open` emit) | `open = input<boolean>()` + `openChange = output<boolean>()` (two-way `[(open)]` or one-way `[open]`; not `model()`, which writes its own value) |
| uncontrolled seed | `defaultOpen` | `default-open` | `defaultOpen = input()` |
| change details | `onOpenChange(open, details)` (called before the state changes; `details.cancel()` stops it) | `@open-change="(open, details) => ..."`, emitted first; `update:open` follows only when not canceled | `openChangeDetails = output<{ open, details }>()`, emitted first; `(openChange)` (the value alone) follows only when not canceled |
| open change complete | `onOpenChangeComplete={(open) => ...}` | `@open-change-complete="(open) => ..."` | `(openChangeComplete)="..."` (an output of the root directive) |
| actions (`close`, `unmount`) | `actionsRef={ref}` on the Root (`ref.current = { close, unmount }`) | the Root component exposes `close()` and `unmount()` (a template ref, `expose`) | public `close()` and `unmount()` methods of the root directive (`#menu="menuRoot"`, `menu.close()`) |
| keep the portal's content mounted | `<Dialog.Portal keepMounted>` | `<Dialog.Portal keep-mounted>` | `*dialogPortal="{ keepMounted: true }"` (the option object of the structural portal; `*dialogPortal` alone still works) |
| a handle (detached triggers) | `Dialog.createHandle<Payload>()` (on the namespace object; also exported as `createDialogHandle`) | `Dialog.createHandle<Payload>()` (also `createDialogHandle`) | `createDialogHandle<Payload>()` |
| a detached Trigger | `<Dialog.Trigger handle={handle} payload={row} id="edit-ada">` | `<Dialog.Trigger :handle="handle" :payload="row" id="edit-ada">` | `<button dialogTrigger [handle]="handle" [payload]="row" id="edit-ada">` |
| the Root's handle and active trigger | `<Dialog.Root handle={handle} triggerId={id}>` (`defaultTriggerId`) | `<Dialog.Root :handle="handle" :trigger-id="id">` (`default-trigger-id`) | `[dialogRoot] [handle]="handle" [triggerId]="id"` (`defaultTriggerId`) |
| the active trigger's payload in the content | the Root's `children` as a function, `({ payload }) => ReactNode` | the Root's default scoped slot, `v-slot="{ payload }"` | the root directive's `payload()` signal, through `exportAs` (`#dialog="dialogRoot"`, `dialog.payload()`) |
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
| a handle of a component built on another's parts | `AlertDialog.createHandle<Payload>()` (also `createAlertDialogHandle`) | the same | `createAlertDialogHandle<Payload>()` |
| a menu item's activation | `onClick` on `Menu.Item` | `@click` on `Menu.Item` | `(click)` on the `[menuItem]` element |
| a menu checkbox item's state | `checked` + `onCheckedChange(checked, details)` (`defaultChecked`) on `Menu.CheckboxItem` | `v-model:checked` (`default-checked`, `@checked-change="(checked, details) => ..."`) | `[(checked)]` on `[menuCheckboxItem]` (`defaultChecked`; `checkedChangeDetails` output `{ value, details }`, as Checkbox and Switch) |
| a menu radio group's value | `value` + `onValueChange(value, details)` (`defaultValue`) on `Menu.RadioGroup` | `v-model:value` (`default-value`, `@value-change`) | `[(value)]` on `[menuRadioGroup]` (`defaultValue`; `valueChangeDetails` output) |
| a part rendered only while checked (menu indicators) | rendered by the part (`keepMounted` keeps it) | rendered by the part (`keep-mounted`) | structural: `*menuCheckboxItemIndicator`, `*menuRadioItemIndicator` (`*menuCheckboxItemIndicator="{ keepMounted: true }"`) |
| parts shared by two entries (AlertDialog on Dialog's, ContextMenu on Menu's) | `AlertDialog.Popup` is Dialog's Popup, its part attribute named by the enclosing `AlertDialog.Root` | the same (`AlertDialog.Popup`) | the entry's own selectors on the same directives' behaviour: `[alertDialogRoot]`, `[alertDialogTrigger]`, `*alertDialogPortal`, `[alertDialogBackdrop]`, `[alertDialogViewport]`, `[alertDialogPopup]`, `[alertDialogTitle]`, `[alertDialogDescription]`, `[alertDialogClose]`; `[contextMenuRoot]`, `[contextMenuTrigger]`, `*contextMenuPortal`, `[contextMenuPositioner]`, `[contextMenuPopup]`, `[contextMenuItem]`, `[contextMenuCheckboxItem]`, `[contextMenuRadioGroup]`, `[contextMenuRadioItem]`, `[contextMenuSeparator]`, `[contextMenuGroup]`, `[contextMenuGroupLabel]`, `[contextMenuSubmenuRoot]`, `[contextMenuSubmenuTrigger]`, `*contextMenuCheckboxItemIndicator`, `*contextMenuRadioItemIndicator` (each the same behaviour as Menu's directive, its part attribute `context-menu-*`) |
| a Toggle's state | `pressed` + `onPressedChange(pressed, details)` (`defaultPressed`) | `v-model:pressed` (`default-pressed`, `@pressed-change="(pressed, details) => ..."`) | `[(pressed)]` on `button[toggle]` (`defaultPressed`; `pressedChangeDetails` output `{ value, details }`, as Switch's `checkedChangeDetails`) |
| a ToggleGroup's value (an array of strings) | `value` + `onValueChange(value, details)` (`defaultValue`) on `ToggleGroup` | `v-model:value` (`default-value`, `@value-change`) | `[(value)]` on `[toggleGroup]` (`defaultValue`; `valueChangeDetails` output), as Accordion's |
| Toolbar's parts | `Toolbar.Root`, `Toolbar.Button`, `Toolbar.Link`, `Toolbar.Input`, `Toolbar.Group`, `Toolbar.Separator` | the same | `[toolbarRoot]`, `button[toolbarButton]`, `a[toolbarLink]`, `input[toolbarInput]`, `[toolbarGroup]`, `[toolbarSeparator]` |
| the roving focus a composite provides (spec/toolbar.md, "Nested composites") | a context in the package's shared code (`utils/`, `hooks/`), provided by a Toolbar.Root or a ToggleGroup with none around it | `provide` / `inject` of a key in `utils/` or `composables/` | an `InjectionToken` in `/internal`, provided by `[toolbarRoot]` or a `[toggleGroup]` with none around it |
| Menubar | `<Menubar>` around `Menu.Root`s (one component, as ToggleGroup) | `<Menubar>` around `Menu.Root`s | `[menubar]` (class `Menubar`) around `[menuRoot]`s; the inputs `orientation`, `loopFocus`, `modal`, `disabled` |
| the parent-bar contract Menu reads (spec/menu.md, "In a Menubar") | a context in `components/menu/menu-bar-context.ts`, provided by `Menubar` | `provide` / `inject` of a key in `components/menu/menu-bar-context.ts` | an `InjectionToken` in `packages/angular/menu/utils/menu-bar.ts`, provided by `[menubar]` |
| Select's new parts | `Select.Group`, `Select.GroupLabel`, `Select.Separator`, `Select.ItemText` | the same | `[selectGroup]`, `[selectGroupLabel]`, `[selectSeparator]`, `[selectItemText]` |
| Label | `<Label htmlFor="email">` (one component, as Toggle) | `<Label for="email">` | `<label label for="email">` (selector `label[label]`, class `Label`) |
| NumberField's value (a number or `null`) | `value` + `onValueChange(value, details)` (`defaultValue`) on `NumberField.Root` | `v-model:value` (`default-value`, `@value-change="(value, details) => ..."`) | `[(value)]` on `[numberFieldRoot]` (`defaultValue`; `valueChangeDetails` output `{ value, details }`) |
| NumberField's parts | `NumberField.Root`, `.Group`, `.Input`, `.Increment`, `.Decrement`, `.ScrubArea`, `.ScrubAreaCursor` | the same | `[numberFieldRoot]`, `[numberFieldGroup]`, `input[numberFieldInput]`, `button[numberFieldIncrement]`, `button[numberFieldDecrement]`, `[numberFieldScrubArea]`, structural `*numberFieldScrubAreaCursor` (rendered only while a locked scrub runs, its view moved to `body`) |
| Meter's parts | `Meter.Root`, `.Label`, `.Value`, `.Track`, `.Indicator` | the same | `[meterRoot]`, `[meterLabel]`, `[meterValue]` (`formattedValue()`, `value()` through `exportAs`), `[meterTrack]`, `[meterIndicator]` |
| OTPField's value (a string) and events | `value` + `onValueChange(value, details)` (`defaultValue`), `onValueComplete`, `onValueInvalid` on `OTPField.Root` | `v-model:value` (`default-value`, `@value-change`, `@value-complete`, `@value-invalid`) | `[(value)]` on `[otpFieldRoot]` (`defaultValue`; `valueChangeDetails`, `valueComplete` and `valueInvalid` outputs, each `{ value, details }`) |
| OTPField's parts | `OTPField.Root`, `OTPField.Input` | the same | `[otpFieldRoot]`, `input[otpFieldInput]` |
| DateField's and TimeField's value | `value` + `onValueChange(value, details)` (`defaultValue`) on `DateField.Root` / `TimeField.Root` | `v-model:value` (`default-value`, `@value-change`) | `[(value)]` on `[dateFieldRoot]` / `[timeFieldRoot]` (`defaultValue`; `valueChangeDetails` output `{ value, details }`) |
| DateField's and TimeField's parts (TimeField on DateField's Input and Segment) | `DateField.Root`, `.Input` (children `(segment) => ...`, else every segment), `.Segment` (`segment`); `TimeField.Root`, `.Input`, `.Segment` | the same (the Input's default scoped slot `v-slot="{ segment }"`) | `[dateFieldRoot]`, `[timeFieldRoot]`, `[dateFieldInput]` (`segments()` through `exportAs`), `[dateFieldSegment]="segment"`; a directive has no template, so the consumer always writes `@for (segment of input.segments(); track segment.index) { <span [dateFieldSegment]="segment">{{ segment.text }}</span> }`; `/time-field` re-exports the Input and Segment directives |
| Listbox's value (a string or `null`, or an array of strings) | `value` + `onValueChange(value, details)` (`defaultValue`) on `Listbox.Root` | `v-model:value` (`default-value`, `@value-change`) | `[(value)]` on `[listboxRoot]` (`defaultValue`; `valueChangeDetails` output `{ value, details }`) |
| Listbox's parts | `Listbox.Root`, `.Item`, `.ItemIndicator`, `.Group`, `.GroupLabel`, `.Separator` | the same | `[listboxRoot]`, `[listboxItem]`, structural `*listboxItemIndicator`, `[listboxGroup]`, `[listboxGroupLabel]`, `[listboxSeparator]` |
| Autocomplete's value (the text) | `value` + `onValueChange(value, details)` (`defaultValue`) on `Autocomplete.Root` | `v-model:value` (`default-value`, `@value-change`) | `[(value)]` on `[autocompleteRoot]` (`valueChangeDetails`); the Root's `value()` signal instead of a Value directive |
| Autocomplete's parts | `Autocomplete.Root`, `.InputGroup`, `.Input`, `.Trigger`, `.Clear`, `.Value`, `.Status`, `.Portal`, `.Positioner`, `.Popup`, `.Empty`, `.List`, `.Group`, `.GroupLabel`, `.Separator`, `.Item` | the same | `[autocompleteRoot]`, `[autocompleteInputGroup]`, `input[autocompleteInput]`, `[autocompleteTrigger]`, structural `*autocompleteClear`, `[autocompleteStatus]`, `*autocompletePortal`, `[autocompletePositioner]`, `[autocompletePopup]`, `[autocompleteEmpty]`, `[autocompleteList]` (`entries()`), `[autocompleteGroup]`, `[autocompleteGroupLabel]`, `[autocompleteSeparator]`, `[autocompleteItem]`; `injectAutocomplete()` |
| ScrollArea's parts | `ScrollArea.Root`, `.Viewport`, `.Content`, `.Scrollbar` (`orientation`, `keepMounted`), `.Thumb`, `.Corner` | the same (`orientation`, `keep-mounted`) | `[scrollAreaRoot]`, `[scrollAreaViewport]`, `[scrollAreaContent]`, structural `*scrollAreaScrollbar` (`*scrollAreaScrollbar="'horizontal'"`, `*scrollAreaScrollbar="{ orientation: 'horizontal', keepMounted: true }"`: rendered only while its axis overflows), `[scrollAreaThumb]`, structural `*scrollAreaCorner` |
| Pagination's page | `page` + `onPageChange(page, details)` (`defaultPage`) on `Pagination.Root` | `v-model:page` (`default-page`, `@page-change="(page, details) => ..."`) | `[(page)]` on `nav[paginationRoot]` (`defaultPage`; `pageChangeDetails` output `{ value, details }`) |
| Pagination's parts and range | `Pagination.Root` (children `({ items, page, count }) => ...`), `.Item`, `.Ellipsis`, `.Previous`, `.Next`, `.First`, `.Last` | the same (the Root's default scoped slot `v-slot="{ items, page, count }"`) | `nav[paginationRoot]` (`items()`, `currentPage()`, `pageCount()` through `exportAs`: `page` and `count` are its inputs), `[paginationItem]` (`[value]`), `[paginationEllipsis]`, `[paginationPrevious]`, `[paginationNext]`, `[paginationFirst]`, `[paginationLast]` |
| AspectRatio | `<AspectRatio ratio={16 / 9}>` (one component, as Label) | `<AspectRatio :ratio="16 / 9">` | `<div aspectRatio [ratio]="16 / 9">` (selector `[aspectRatio]`, class `AspectRatio`) |
| TagGroup's selection (an array of strings) and removal | `value` + `onValueChange(value, details)` (`defaultValue`), `onRemove(value, details)`, `disabledKeys` on `TagGroup.Root` | `v-model:value` (`default-value`, `@value-change`, `@remove="(value, details) => ..."`, `:disabled-keys`) | `[(value)]` on `[tagGroupRoot]` (`defaultValue`, `[disabledKeys]`; `valueChangeDetails` output `{ value, details }`; `remove` output `{ value, details }`) |
| TagGroup's parts | `TagGroup.Root`, `.Label`, `.List`, `.Tag` (`value`), `.TagCell`, `.RemoveButton` | the same | `[tagGroupRoot]`, `[tagGroupLabel]`, `[tagGroupList]`, `[tagGroupTag]` (`[value]`), `[tagGroupTagCell]`, `button[tagGroupRemoveButton]` |
| TagsInput's tags, text and refusals | `value` + `onValueChange(value, details)` (`defaultValue`), `inputValue` + `onInputValueChange(text, details)` (`defaultInputValue`), `onValueInvalid(text, details)` on `TagsInput.Root` | `v-model:value`, `v-model:input-value` (`default-value`, `default-input-value`, `@value-change`, `@input-value-change`, `@value-invalid`) | `[(value)]`, `[(inputValue)]` on `[tagsInputRoot]` (`defaultValue`, `defaultInputValue`; `valueChangeDetails`, `inputValueChangeDetails` and `valueInvalid` outputs, each `{ value, details }`) |
| TagsInput's parts and its tags | `TagsInput.Root` (children `({ value }) => ...`), `.Control`, `.Input`, `.Tag` (`index`), `.TagText`, `.TagRemove`, `.TagInput`, `.ClearTrigger` | the same (the Root's default scoped slot `v-slot="{ value }"`) | `[tagsInputRoot]` (`tags()` through `exportAs`, `#tags="tagsInputRoot"`: `value` is its input), `[tagsInputControl]`, `input[tagsInputInput]`, `[tagsInputTag]` (`[index]`), `[tagsInputTagText]`, `button[tagsInputTagRemove]`, `input[tagsInputTagInput]`, `button[tagsInputClearTrigger]` |

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
  passes no `locale` and leaves the document with no `lang`; `?cancel` in the lifecycle
  scenarios ([above](#the-lifecycle-scenarios)).

The conformance suite fixes "today" with Playwright's clock: **2026-11-20** (a Friday) in every
calendar scenario.
