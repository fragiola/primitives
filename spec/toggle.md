# Toggle

## Purpose

A two-state button the user presses on and off (APG `button`, its toggle button variant): a
native `<button>` with `aria-pressed`, or another element (`render`) that behaves as one, with
the keys a native button has. Inside a [ToggleGroup](toggle-group.md) it is one of the group's
values; inside a [Toolbar](toolbar.md) it is one of the toolbar's items. A switch (an on/off
setting, `role="switch"`) is [Switch](switch.md); a checkbox is [Checkbox](checkbox.md). A
toggle with a mixed state (`aria-pressed="mixed"`) and form participation are out of scope.

**Scope: stage 2** (Epic #49, Issue #47). The APG `button` pattern decides the role, the state and
the keys; Base UI's `Toggle` (1.9) decides the props, the group value and `nativeButton` (D4). It
is built on [Button](button.md)'s behaviour (each framework shares it through its own code, not
through the `/button` entry).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Toggle | `button` | `toggle-root` | one part; or the consumer's element (`render`) |

One entry, `/toggle` (D8). The group's context lives in it, so a Toggle alone ships no
ToggleGroup code (`ENTRY_DEPENDENCIES`: `toggle-group` is built on `toggle`).

## API

**Toggle**:

- `pressed`, `defaultPressed` (`false`), `onPressedChange(pressed, details)`: whether it is
  pressed. A press reports the new state with reason `none` (spec/README.md, "Change details";
  Base UI's reason). Inside a ToggleGroup, `pressed` and `defaultPressed` are ignored: the Toggle
  is pressed while the group's value holds its `value`, and a press changes the group's value;
  `onPressedChange` still reports it, before the group's `onValueChange`.
- `value` (a string): its value in a ToggleGroup; required there, unused outside one.
- `disabled` (`false`): it ignores presses and keys. Inside a disabled ToggleGroup, a disabled
  Toolbar or a disabled Toolbar.Group, it is disabled too.
- `nativeButton` (`true`): as [Button's](button.md#api): `false` when `render` gives another
  element, which then gets `role="button"`, the tab order and the keys of a native button.

A Toggle is always `type="button"` (it never submits a form). Every other attribute and handler
is forwarded; handlers compose internal first, then the consumer's (AGENTS.md rule 7): the
Toggle's own click handler toggles, then the consumer's runs. While disabled, the consumer's
click handler does not run (as Button's).

## State attributes and ARIA

| case | attributes |
| --- | --- |
| native | `type="button"`, `aria-pressed` (`"true"` or `"false"`), `data-pressed` while pressed, `data-disabled` and `disabled` while disabled |
| not native | `role="button"`, `aria-pressed`, `data-pressed`, `tabindex="0"` (`-1` while disabled), `data-disabled` and `aria-disabled="true"` while disabled |
| in a composite (a ToggleGroup, a Toolbar) | the same, and a roving `tabindex`: `"0"` on the composite's tab stop, `"-1"` on every other item ([Toolbar, "Focus"](toolbar.md#focus)) |

Its accessible name is its content, or the consumer's `aria-label`; the name never changes with
the state (APG: a toggle button's label stays the same, `aria-pressed` tells the state).

## Keyboard

| key | action |
| --- | --- |
| Enter | toggles (a click). A non-native Toggle clicks on key down, as a native button |
| Space | toggles (a click). A non-native Toggle clicks on key up; its key down does not scroll |
| Tab | moves on; a disabled Toggle is skipped. Inside a composite, Tab leaves the composite ([toggle-group.md](toggle-group.md#keyboard)) |

## Focus

A Toggle alone is a tab stop (a native button; a non-native one through `tabindex="0"`). Inside a
ToggleGroup or a Toolbar, the composite's roving tab stop decides its `tabindex`. A disabled
Toggle is not focusable (Base UI: a toggle has no `focusableWhenDisabled`).

## Pointer

A click toggles it. While disabled, a click and a pointer down do nothing.

## Animation

None.

## RTL

Nothing changes.

## Scenarios

### `/toggle/basic`

- a Toggle **"Bold"**, with no default;
- a Toggle **"Italic"**, `defaultPressed`;
- a Toggle **"Underline"**, `disabled`;
- a Toggle **"Strike"** rendered as a `span` (`nativeButton` `false`).

Output: `toggle: <the name of the last Toggle whose onPressedChange ran>` (`none` before any),
`pressed: <the pressed state it reported>` (`none` before any), `reason: <its reason>` (`none`
before any).

Checks:

1. Four `button` roles: "Bold" `aria-pressed="false"`, "Italic" `aria-pressed="true"`,
   "Underline" `aria-pressed="false"` and disabled, "Strike" `aria-pressed="false"`.
2. A click on "Bold" presses it (`aria-pressed="true"`; `toggle: Bold`, `pressed: true`,
   `reason: none`); a second click releases it (`pressed: false`).
3. Focused on "Bold", Enter presses it and Space releases it.
4. Tab order: "Bold", "Italic", "Strike" ("Underline" is skipped).
5. "Strike": Enter presses it (on key down), Space releases it (on key up), and Space does not
   scroll the page.
6. A click on "Underline" (forced) changes nothing (`toggle: none`).
7. Axe finds no violation, at rest and with "Bold" pressed.

### `/toggle/controlled`

A Toggle **"Mute"** whose `pressed` the fixture holds, starting at `true`, and a native checkbox
**"Locked"** (unchecked). The fixture records every `onPressedChange` (`requested: <pressed>`) and
applies it only while "Locked" is unchecked (spec/README.md, "A controlled value the consumer
rejects"). Output: `pressed: <the fixture's value>`, `requested: <the last reported state>`
(`none` before any).

Checks:

1. "Mute" is pressed (`aria-pressed="true"`, `data-pressed`).
2. A click on "Mute" reports `requested: false` and releases it (`pressed: false`,
   `aria-pressed="false"`, no `data-pressed`).
3. With "Locked" checked, a click on "Mute" reports `requested: true` and it stays released
   (`pressed: false`, `aria-pressed="false"`).

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI's `onPressedChange` details can be canceled (`details.cancel()`) | not offered: value changes are not cancelable (spec/README.md, "Open change details") |
| Base UI gives a Toggle with no `value` inside a group a generated one | `value` is required inside a group (the group's value is the app's to read), as an Accordion item's |
