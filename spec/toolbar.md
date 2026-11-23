# Toolbar

## Purpose

A container for a set of controls (buttons, toggles, links, a text input) that is **one tab
stop**, with the arrow keys moving between its controls (APG `toolbar`). The controls of a
[ToggleGroup](toggle-group.md) inside it, and a [Toggle](toggle.md) placed in it directly, are
the toolbar's own items: the whole toolbar stays one tab stop (Base UI's Toolbar; "Nested
composites"). A menu bar is Menubar (Issue #48), which reuses the same roving focus.

**Scope: stage 2** (Epic #49, Issue #47). The APG `toolbar` pattern decides the role, the keys,
the roving tab stop and the disabled controls; Base UI's `Toolbar` (1.9) decides the parts, the
nested composites, `loopFocus` and the text input's keys, which the APG leaves open (D4).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Toolbar.Root | `div` | `toolbar-root` | the `toolbar`; holds the roving tab stop |
| Toolbar.Button | `button` | `toolbar-button` | an item; built on [Button](button.md)'s behaviour (`render`, `nativeButton`) |
| Toolbar.Link | `a` | `toolbar-link` | an item |
| Toolbar.Input | `input` | `toolbar-input` | an item; keeps its text caret keys ("Keyboard") |
| Toolbar.Group | `div` | `toolbar-group` | a `group` of items (no focus of its own) |
| Toolbar.Separator | `div` | `toolbar-separator` | a `separator` across the toolbar's orientation (not focusable) |

One entry, `/toolbar` (D8). It holds no Toggle or ToggleGroup code and they hold none of it: the
nested composites meet through each framework's own roving-focus code ("Nested composites").

## API

**Toolbar.Root**:

- `orientation` (`"horizontal"`): `"horizontal"` or `"vertical"`; the arrow keys
  ("Keyboard"), `aria-orientation` and `data-orientation`.
- `loopFocus` (`true`): the arrows wrap from the last item to the first and back.
- `disabled` (`false`): every Button, Input, Toggle and ToggleGroup in it is disabled (a Link
  cannot be).

**Toolbar.Button**: `disabled` (`false`), `focusableWhenDisabled` (`false`): a disabled item that
stays reachable with the arrows ("Disabled items"), `nativeButton` (`true`) and `type`, as
[Button's](button.md#api). Every other attribute and handler is forwarded; the consumer's click
handler does not run while disabled.

**Toolbar.Link**: no props of its own (`href` and every attribute forwarded).

**Toolbar.Input**: `disabled` (`false`), `focusableWhenDisabled` (`false`); every other attribute
(`value`, `defaultValue`, `aria-label`, `type`) forwarded.

**Toolbar.Group**: `disabled` (`false`): every item in it is disabled.

**Toolbar.Separator**: no props; its orientation is across the toolbar's.

### Disabled items

The APG: "typically, disabled elements are not focusable when navigating with a keyboard"; it
allows focusable ones where discoverability matters. So, by default, a disabled Toolbar.Button or
Toolbar.Input is natively disabled: the arrows skip it and it never holds the tab stop (Base UI's
default is the other one, `focusableWhenDisabled` `true`; "Differences from Base UI"). With
`focusableWhenDisabled`, it is `aria-disabled="true"` instead: the arrows reach it, it may hold
the tab stop, and it ignores presses and every key but Tab and the toolbar's own keys (a Button
as Button's `focusableWhenDisabled`; an Input is also `readonly`). A disabled Toggle is always
natively disabled (Toggle has no `focusableWhenDisabled`, as Base UI).

### Nested composites

The rule every composite of this library follows inside a Toolbar (the Epic's risk, decided
before the implementations):

1. **One roving focus per toolbar.** A Toolbar.Root provides a roving-focus scope (each
   framework's own context: React's context, Vue's `provide`, Angular's injection token, in the
   package's shared code, not in a component's entry). Every item inside it, at any depth,
   registers with the **nearest** scope: Toolbar.Button, Toolbar.Link, Toolbar.Input, a Toggle.
2. **A composite inside a toolbar opens no scope of its own.** A ToggleGroup provides a scope
   only when it finds none around it; inside a Toolbar it renders its `group` with no roving
   focus and no key handling of its own, and its Toggles register with the toolbar's scope.
   Its own `orientation` and `loopFocus` are ignored there, and its `data-orientation` is the
   toolbar's. A Toolbar.Group opens no scope either (it passes its `disabled` on).
3. **The items are ordered by the document.** The arrows, Home and End move through every
   registered item of the scope in document order, whatever element holds it (a Toggle in a
   ToggleGroup in a Toolbar.Group is one item among the others). Exactly one item of the whole
   toolbar has `tabindex="0"`; every other item has `tabindex="-1"`. The toolbar is one tab stop.
4. **The keys are handled once, by the scope's root.** The Toolbar.Root's key handler acts on a
   key whose target is one of its items, unless a handler before it prevented the key's default
   (an item's own keys, a trigger that opens a menu with ArrowDown). A key from inside an item
   that is not one (a menu's popup rendered from a toolbar button) is not the toolbar's.
5. **A disabled scope disables its items.** A disabled Toolbar.Root or Toolbar.Group disables the
   items registered inside it, a ToggleGroup's Toggles included.

Another composite of this library (Menubar, Issue #48) follows the same rule: its items register
with the nearest scope, and it opens a scope only when none is around it.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `role="toolbar"`, `aria-orientation` (`"horizontal"` or `"vertical"`), `data-orientation`, `data-disabled` while disabled. Its accessible name comes from the consumer (`aria-label`, `aria-labelledby`, APG) |
| Button | Button's attributes ([button.md](button.md#state-attributes-and-aria): `type="button"`, `disabled` or `aria-disabled="true"`), the roving `tabindex` (`"0"` or `"-1"`), `data-orientation` (the toolbar's), `data-disabled` while disabled |
| Link | the roving `tabindex`, `data-orientation` |
| Input | the roving `tabindex`, `data-orientation`, `data-disabled` while disabled; disabled: `disabled`; disabled and `focusableWhenDisabled`: `aria-disabled="true"` and `readonly` instead |
| Group | `role="group"`, `data-orientation`, `data-disabled` while disabled. Named by the consumer |
| Separator | `role="separator"`, `aria-orientation` and `data-orientation` across the toolbar's (`"vertical"` in a horizontal toolbar) |
| a Toggle, a ToggleGroup inside | their own attributes ([toggle.md](toggle.md#state-attributes-and-aria), [toggle-group.md](toggle-group.md#state-attributes-and-aria)), with the toolbar's roving `tabindex` and `data-orientation` |

## Keyboard

| key | horizontal | vertical |
| --- | --- | --- |
| Tab, Shift+Tab | move focus into and out of the toolbar (one tab stop) | same |
| next item | ArrowRight (ArrowLeft in RTL) | ArrowDown |
| previous item | ArrowLeft (ArrowRight in RTL) | ArrowUp |
| Home / End | the first / last item that can take focus | same |
| Enter, Space | the item's own (a button's click, a link's Enter, a toggle) | same |

The arrows skip the items that cannot take focus (disabled without `focusableWhenDisabled`) and
wrap with `loopFocus`; without it, an arrow at an end keeps the focus. The keys of the other
orientation do nothing (the APG reserves them for the controls). An arrow, Home or End with Alt,
Control, Meta or Shift is left to the item. The direction is the
[DirectionProvider](direction.md)'s, else the toolbar's computed `direction`.

**A Toolbar.Input keeps its text keys** (Base UI; the APG recommends a text input as the last
item). While it is enabled and its text selection is collapsed:

- the "next" arrow (ArrowRight, ArrowLeft in RTL; ArrowDown in a vertical toolbar) moves its
  caret, and moves the focus to the next item only when the caret is at the end of the text;
- the "previous" arrow moves its caret, and moves the focus only when the caret is at the start;
- Home and End move its caret, and are the toolbar's only while its text is empty.

While text is selected in it, every one of these keys is the input's (it collapses the
selection). When the toolbar's keys move the focus to an Input, its whole text is selected (Base
UI). Any other key (typing) is the input's.

## Focus

A roving tab stop (APG toolbar): exactly one item has `tabindex="0"`. Focus enters the toolbar
on its first item that can take focus; once an item had focus (an arrow, a click, a script), it
keeps the tab stop, and Tab back into the toolbar returns to it (the APG's option). An item that
can no longer take focus (disabled, removed) gives the tab stop back to the first one that can.
On a server render, before the items are known, every item has `tabindex="-1"`; once mounted the
first item that can take focus holds the tab stop (Tabs' rule, spec/tabs.md). Pressing an item
never moves focus.

## Pointer

A click on an item does what the item does, and focuses it when it is focusable (it becomes the
tab stop).

## Animation

None.

## RTL

In a horizontal toolbar, ArrowLeft moves to the next item and ArrowRight to the previous one (and
an Input's "next" arrow is ArrowLeft). Home, End and a vertical toolbar do not change.

## Scenarios

### `/toolbar/basic`

A button **"Before"**; a Toolbar labelled **"Formatting"** (`aria-label`) holding, in order:

- a ToggleGroup labelled **"Text style"**, `multiple`, with the Toggles **"Bold"** (`bold`) and
  **"Italic"** (`italic`);
- a Toolbar.Separator;
- a Toolbar.Group labelled **"History"** with the Toolbar.Buttons **"Undo"** and **"Redo"**
  (`disabled`);
- a Toolbar.Separator;
- a Toolbar.Button **"Share"**, `disabled` and `focusableWhenDisabled`;
- a Toolbar.Link **"Help"** (`href="#help"`);
- a Toolbar.Input labelled **"Search"** (`aria-label`), `defaultValue="draft"`;

then a button **"After"**. Output: `style: <the ToggleGroup's last onValueChange, joined by ",">`
(`none` before any), `pressed: <the name of the last Toolbar.Button whose click handler ran>`
(`none` before any).

Checks:

1. A `toolbar` named "Formatting" with `aria-orientation="horizontal"`; the groups "Text style"
   and "History"; two `separator`s with `aria-orientation="vertical"`; "Redo" is disabled and
   "Share" is `aria-disabled="true"`.
2. One tab stop for the whole toolbar, the ToggleGroup included: Tab from "Before" focuses
   "Bold"; Tab again focuses "After"; Shift+Tab comes back to "Bold". Exactly one element inside
   the toolbar has `tabindex="0"`.
3. Focused on "Bold", ArrowRight moves through "Italic", "Undo", "Share" ("Redo" skipped,
   "Share" reachable), "Help" and "Search", whose text "draft" is then all selected.
4. In "Search": ArrowRight collapses the selection to the end and keeps the focus; ArrowRight
   again wraps to "Bold". ArrowLeft from "Bold" wraps to "Search" (all selected); ArrowLeft
   collapses the selection to the start and keeps the focus; ArrowLeft again moves to "Help".
5. Home → "Bold"; End → "Search"; with the caret in "draft", Home and End move the caret and keep
   the focus. ArrowDown and ArrowUp on "Bold" do nothing.
6. The item that last had focus keeps the tab stop: focused on "Undo", Tab goes to "After",
   Shift+Tab comes back to "Undo".
7. Space on "Bold" presses it (`style: bold`); a click on "Italic" presses it too
   (`style: bold,italic`); a click on "Undo" gives `pressed: Undo`; a click, Enter and Space on
   "Share" change nothing (`pressed: Undo`).
8. Axe finds no violation.

### `/toolbar/basic?dir=rtl`

The same page right to left. Checks: focused on "Bold", ArrowLeft → "Italic", ArrowRight →
"Bold", ArrowRight wraps to "Search"; Home → "Bold", End → "Search".

### `/toolbar/vertical`

A Toolbar labelled **"Tools"**, `orientation="vertical"`, `loopFocus` `false`, holding the
Toolbar.Buttons **"Select"** and **"Draw"**, a Toolbar.Separator, a Toggle **"Snap"** placed
directly in the toolbar, and a ToggleGroup labelled **"Zoom"** (single, its own `orientation`
left at `"horizontal"`) with the Toggles **"Fit"** (`fit`) and **"Fill"** (`fill`); then a button
**"After"**. Output: `snap: <the Toggle's last onPressedChange>` (`none` before any), `zoom:
<the ToggleGroup's last onValueChange, joined by ",">` (`none` before any).

Checks:

1. A `toolbar` named "Tools" with `aria-orientation="vertical"`; its `separator` has
   `aria-orientation="horizontal"`; the ToggleGroup "Zoom" has `data-orientation="vertical"` (the
   toolbar's).
2. Tab from the page start focuses "Select"; Tab again focuses "After" (the Toggle and the group
   add no tab stop).
3. Focused on "Select": ArrowDown → "Draw"; ArrowDown → "Snap"; ArrowDown → "Fit"; ArrowDown →
   "Fill"; ArrowDown stays on "Fill" (no loop); ArrowUp → "Fit"; ArrowRight and ArrowLeft do
   nothing (the group's own horizontal keys are not used); Home → "Select"; End → "Fill".
4. Space on "Snap" presses it (`snap: true`); Enter on "Fit" presses it (`zoom: fit`).
5. Axe finds no violation.

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI's Toolbar.Button and Toolbar.Input are focusable when disabled by default (`focusableWhenDisabled` `true`) | `false` by default (the APG's "typically not focusable"); `focusableWhenDisabled` opts in |
| Base UI's disabled Toolbar.Input is never natively disabled (`aria-disabled` only) | natively `disabled` unless `focusableWhenDisabled`, then `aria-disabled="true"` and `readonly` |
| Base UI selects an Input's text on every focus | only when the toolbar's keys move the focus to it: a click places the caret where it lands |
| Base UI's Toolbar.Separator takes an `orientation` | always across the toolbar's |
| Base UI marks a focusable item with `data-focusable` | not offered (`aria-disabled` and `data-disabled` tell it) |
