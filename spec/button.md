# Button

## Purpose

An element the user activates to perform an action (APG `button`): a native `<button>`, or
another element (`render`) that behaves as one, with the keyboard a native button has. It also
offers a disabled button that stays focusable (`focusableWhenDisabled`, Base UI), for a button
that is busy for a moment and must not lose the focus. A toggle button (`aria-pressed`) and a menu
button are out of scope: Toggle is stage 2, the menu button is [Menu](menu.md)'s Trigger.

**Scope: stage 1** (Epic #29). The APG `button` pattern decides the roles and the keys; Base UI's
`Button` (1.9) decides `focusableWhenDisabled` and `nativeButton`, which the APG does not cover
(D4).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Button | `button` | `button-root` | one part; or the consumer's element (`render`) |

## API

**Button**:

- `disabled` (`false`): the button ignores presses and keys.
- `focusableWhenDisabled` (`false`): a disabled button stays in the tab order and focusable; it
  still ignores presses and every key but Tab.
- `nativeButton` (`true`): whether the rendered element is a native `<button>`. Set it to `false`
  when `render` gives another element (a `span`, a `div`): the Button then adds `role="button"`,
  the tab order and the keyboard a native button has.
- `type`: forwarded; a native Button is `type="button"` unless the consumer gives one (a
  `type="submit"` Button submits its form).

Every other attribute and handler is forwarded. The consumer's click handler does not run while
the button is disabled.

## State attributes and ARIA

| case | attributes |
| --- | --- |
| native | `type="button"` (unless given), `data-disabled` while disabled; disabled: `disabled`; disabled and `focusableWhenDisabled`: `aria-disabled="true"` instead of `disabled` |
| not native | `role="button"`, `tabindex="0"`, `data-disabled` while disabled; disabled: `aria-disabled="true"` and `tabindex="-1"`; disabled and `focusableWhenDisabled`: `aria-disabled="true"` and `tabindex="0"` |

Its accessible name is its content, or the consumer's `aria-label`.

## Keyboard

| key | action |
| --- | --- |
| Enter | activates (a click). A non-native Button clicks on key down, as a native button |
| Space | activates (a click). A non-native Button clicks on key up, as a native button; its key down does not scroll the page |
| Tab | moves on. A disabled Button is skipped, unless `focusableWhenDisabled` |

While disabled, every key but Tab does nothing (its default is prevented, so a focusable
disabled submit button does not submit on Enter).

## Focus

A native Button is focusable unless `disabled` without `focusableWhenDisabled`. A non-native one
is in the tab order through `tabindex="0"`, `-1` while disabled without `focusableWhenDisabled`.

## Pointer

A click activates it. While disabled, a click and a pointer down are prevented (the consumer's
handlers do not run); a disabled native Button with `disabled` receives none anyway.

## Animation

None.

## RTL

Nothing changes.

## Scenarios

### `/button/basic`

- a Button **"Save"**;
- a Button **"Delete"**, `disabled`;
- a Button **"Publishing"**, `disabled` and `focusableWhenDisabled`;
- a Button **"Archive"** rendered as a `span` (`nativeButton` `false`);
- a Button **"Locked"** rendered as a `span` (`nativeButton` `false`), `disabled`.

Each one's click handler records it. Output: `pressed: <the name of the last Button whose click
handler ran>` (`none` before any), `count: <how many clicks ran>` (`0` before any).

Checks:

1. Five `button` roles. "Save" and "Archive" are enabled; "Delete" is disabled (`disabled`);
   "Publishing" and "Locked" are `aria-disabled="true"`.
2. A click on "Save" gives `pressed: Save`, `count: 1`; Enter and Space on it each click once
   more (`count: 3`).
3. Tab order: "Save", "Publishing", "Archive" ("Delete" and "Locked" are skipped).
4. "Publishing" is focusable: a click, Enter and Space on it change nothing (`count` stays), and
   Tab moves on to "Archive".
5. "Archive": a click gives `pressed: Archive`; focused, Enter clicks it once, Space clicks it
   once (on key up), and Space does not scroll the page.
6. A click on "Locked" changes nothing.
7. Axe finds no violation.

## Differences from Base UI

None in behaviour. Base UI warns in development when `nativeButton` does not match the rendered
element; the primitives do not (no text, no console output of their own).
