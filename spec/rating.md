# Rating

## Purpose

A row of stars (or any marks) that shows and chooses a score from 1 to `count`, in whole or half
steps: a product rating, a satisfaction score. The marks are the consumer's (an icon, a glyph);
the primitive gives each one its state (checked, highlighted, half) and the keys, the pointer
preview and the form value.

It is not a slider over an arbitrary range (that is [Slider](slider.md)), nor a meter that shows a
score nobody chooses (a [Meter](meter.md); a read-only Rating shows one too, but stays focusable).

**Scope: stage 4** (Epic #91, Issue #90). Base UI has no Rating. The APG has a **"Rating Radio
Group" example** (`patterns/radio/examples/radio-rating`), which this spec follows (D4): the
Root is a `radiogroup` and each star a `radio` named by the consumer ("1 star", "2 stars", ...),
with the radio group's roving `tabindex` and its arrows, which move the focus and the check
together. The APG's other rating example, a `slider` (`patterns/slider/examples/slider-rating`),
is not taken: the Issue's parts are one Item per star, and a radio per star lets a screen reader
user hear each choice by its name. Where the APG example says nothing (half steps, the pointer
preview, Home and End, clearing, a read-only score), the APG-closest option is decided here and
recorded in `docs/decisions.md` ("Tags and choices"), from the behaviour references (Zag/Ark's
RatingGroup, Reka UI's Rating; read, never copied).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `rating-root` | the `radiogroup`; holds the value |
| Item | `button` | `rating-item` | one star: a `radio` |
| HiddenInput | `input` | `rating-hidden-input` | what the form submits; inside the Root; optional (without it the Root has no form value and no native validation) |

One entry, `/rating` (D8), built on no other component; a Field control (`ENTRY_DEPENDENCIES`:
`field`). Its value math (the keys' steps, the value under the pointer, a star's state) is the
toolkit's `/range` (`ratingKeyTarget`, `ratingValueAt`, `ratingItemState`), beside the slider's;
it shares nothing with RadioGroup's entries but the form bridge (`/form`).

The consumer renders one Item per star, `index` 1 to `count`, usually from the Root's children
function (`({ items }) => items.map(...)`, "API"). An Item renders the consumer's mark: its
children, or its children function of the Item's state, so a mark can be drawn whole, half or
empty (`highlighted`, `half`).

## API

**Root**:

- `value`, `defaultValue` (`0`), `onValueChange(value, details)`: the score, a number from `0`
  (no rating) to `count`, in steps of 1, or of 0.5 with `allowHalf`. Reasons: `item-press` (a
  press on an Item), `keyboard` (an arrow, Home, End, Space), `none` (a form reset).
- `count` (`5`): the number of stars.
- `allowHalf` (`false`): half steps: the arrows step by 0.5, and a press on the inline-start half
  of a star (its left half, its right half in RTL) chooses the half value (`index - 0.5`).
- `allowClear` (`false`): a press that chooses the current value again clears it (the value
  becomes `0`). Off by default: a radio, once checked, is not unchecked by choosing it again (the
  APG; a native radio set).
- `readOnly` (`false`): the score is shown and focusable, and nothing changes it (no key, no
  press, no preview).
- `disabled` (`false`): every star is disabled: not focusable, nothing changes it.
- `required` (`false`): the form's validation fails while the value is `0`.
- `name`: the HiddenInput's name.
- `loopFocus` (`true`): the arrows wrap from `count` to the first step and back (the APG example
  wraps).
- `children`: nodes, or a function `({ items, value }) => ...` of the star indexes
  (`[1, 2, ..., count]`) and the value (Vue: the default scoped slot; Angular: `items()` and
  `value()` through `exportAs`, `#rating="ratingRoot"`).

**Item**:

- `index` (required): the star's number, 1 to `count`; its whole value.
- `children`: nodes, or a function of the Item's state (below) (Vue: the default scoped slot;
  Angular: `state()` through `exportAs`, `#star="ratingItem"`).

The Item's state (its `render` and `className` functions, its children function):

| member | what |
| --- | --- |
| `index` | the star's number |
| `checked` | the star holds the value: `index` is the value rounded up (`2.5` checks star 3) |
| `highlighted` | the star is drawn filled, whole or half: `index` is at most the displayed value rounded up, the displayed value being the hovered one during a preview, else the value |
| `half` | the star is drawn half filled: the displayed value is `index - 0.5` |
| `disabled`, `readOnly` | the Root's |

**HiddenInput**: nothing of its own.

**Inside a [Field](field.md)** (its integration contract), as RadioGroup: the Root is the field's
control (`aria-labelledby` from the Field's Label, `aria-describedby`, `aria-invalid`, the
field's state attributes on the Root); `validate` gets the value (a number, `0` for none); the
Root takes the field's `name` and `disabled`; focus and blur are the focus entering and leaving
the Root; the validated element is the HiddenInput (none without it); focus target: the tab stop
(none when the Root, or the field, is disabled: "Focus").

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `role="radiogroup"`, `aria-readonly="true"` and `data-readonly` when read-only, `aria-disabled="true"` and `data-disabled` when disabled, `aria-required="true"` and `data-required` when required; inside a Field, `aria-labelledby`, `aria-describedby`, `aria-invalid` and the field's state attributes. Its accessible name comes from the consumer (`aria-labelledby`, `aria-label`) or the Field's Label |
| Item | `role="radio"`, `type="button"`, `aria-checked` (`"true"` on the checked star, `"false"` on the others), `tabindex` (`0` on the tab stop, `-1` on the others), `disabled` and `data-disabled` when disabled, `data-readonly`, `data-checked` / `data-unchecked` (exactly one), `data-highlighted`, `data-half` |
| HiddenInput | `name` (while the value is not `0`), `value` (the value as text, `"2.5"`; `""` for `0`), `required`, `disabled`, `aria-hidden="true"`, `tabindex="-1"`, structural inline style (visually hidden; not `type="hidden"`, so the browser validates it) |

`data-highlighted` here is the star's fill (the displayed value), not a navigation highlight: it
is the name the Issue and Zag/Ark give it, and a star the pointer is over is highlighted with
every star before it.

**Names.** Every Item's accessible name is the consumer's (`aria-label`, or a label in its
content): the primitive has no text (rule 7). **A half value** checks the star that holds it (the
value rounded up: `2.5` checks star 3, focused and the tab stop); a radio has no value text of its
own, so the consumer names the checked star by the value (the fixtures: "2.5 stars" for star 3
while the value is `2.5`, "3 stars" otherwise), from the value it holds or the Item's state
(`checked`, `half` while no preview runs).

## Keyboard

The APG radio group's keys, over the value's steps (the toolkit's `ratingKeyTarget`); the step is
1, or 0.5 with `allowHalf`:

| key | action |
| --- | --- |
| Tab | enters the Root at the checked star, else at the first star; Tab again leaves it (one tab stop) |
| ArrowRight, ArrowDown | the value one step up (from `0`, the first step: 1, or 0.5); from `count`, to the first step (`loopFocus`) |
| ArrowLeft, ArrowUp | the value one step down; from the first step (or from `0`), to `count` (`loopFocus`) |
| Home | the first step (1, or 0.5) |
| End | `count` |
| Space | checks the focused star (its whole value), when it is not checked; a checked star (half or whole) stays |
| Enter | does nothing (a native radio) |

After a key changes the value, the focus moves to the star that holds it (reason `keyboard`).
**RTL** swaps ArrowRight and ArrowLeft (the next step is on the left); ArrowDown and ArrowUp do
not change. The direction is the [DirectionProvider](direction.md)'s, else the Root's computed
`direction`. With `loopFocus` `false`, an arrow at an end does nothing; no arrow reaches `0` (a
radio is not unchecked by the keys: `allowClear` is a press). A read-only or disabled Root ignores
every key but Tab.

## Focus

The tab stop is the checked star (the value rounded up), else the first star: it has
`tabindex="0"`, the others `-1` (also when read-only). A disabled Root has no tab stop. A press
focuses the pressed star. When the browser's validation finds the HiddenInput invalid, focus goes
to the tab stop.

## Pointer

- **Preview.** While a mouse or a pen moves over a star (not touch; not read-only, not disabled),
  the displayed value is that star's value under the pointer: `index`, or `index - 0.5` over its
  inline-start half with `allowHalf` (`ratingValueAt`): the stars' `highlighted` and `half`
  follow the pointer. When it leaves the Root, they follow the value again. The value does not
  change.
- **A press** on a star chooses the value under the pointer (as the preview) and focuses the star
  (reason `item-press`); the same value again clears it with `allowClear` (the focus stays on the
  pressed star), else changes nothing. A keyboard's click on the star (Space) is the key above.

## Forms

The HiddenInput, inside the Root (spec/README.md, "Forms"): the `name` (only while the value is
not `0`: no rating submits nothing, as a radio set), the value as text, `required`, `disabled`,
`aria-hidden="true"`, `tabindex="-1"`. A form reset returns an uncontrolled Root to its
`defaultValue`; a controlled one reports the default through `onValueChange` (reason `none`).

## Animation

None of its own.

## RTL

The arrow keys, above; a star's half is its inline-start half (its right half), so a press on its
right side chooses `index - 0.5`.

## Scenarios

The form scenarios print `form: ...` as in [checkbox.md](checkbox.md#scenarios). Every Root has
`count` 5, rendered from its children function; every Item is named by its `aria-label`, **"1
star"**, **"2 stars"**, ... **"5 stars"** (the checked star of a half value: **"2.5 stars"**,
...), and holds the recipe's star mark (`aria-hidden`), filled by `data-highlighted` and half
filled from its inline-start edge by `data-half`. "The start half" of a star is a point at a
quarter of its width from its inline-start edge, "the end half" at three quarters, both at its
vertical middle.

### `/rating/basic`

A `<form>` with a heading **"Rating"** that labels the Root (`aria-labelledby`), `name="rating"`,
no default, and its HiddenInput; buttons **"Submit"** (`type="submit"`) and **"Reset"**
(`type="reset"`). Output: `value: ...` (the last `onValueChange`, `none` before any),
`reason: ...`, `form: ...`.

Checks:

1. A `radiogroup` named "Rating"; five `radio`s "1 star" to "5 stars" (the HiddenInput is not in
   the tree), none checked, none highlighted.
2. Tab from the page start focuses "1 star"; Space checks it (`value: 1`, `reason: keyboard`).
3. ArrowRight checks and focuses "2 stars" (`value: 2`); End "5 stars"; ArrowRight wraps to "1
   star"; ArrowLeft wraps to "5 stars"; Home "1 star"; ArrowDown "2 stars"; ArrowUp "1 star".
   Each move leaves exactly one radio checked. Enter changes nothing.
4. A click on "4 stars" checks and focuses it (`value: 4`, `reason: item-press`): stars 1 to 4
   have `data-highlighted`, star 5 none.
5. The mouse over "2 stars" highlights stars 1 and 2 only; "4 stars" stays checked; the mouse off
   the Root highlights stars 1 to 4 again.
6. A click on "4 stars" again changes nothing (`allowClear` off).
7. "Submit" submits `form: rating=4`; "Reset" returns it to no star checked (`value: 0`,
   `reason: none`), and "Submit" then submits `form: empty`.
8. Axe finds no violation.

### `/rating/half`

A Root labelled by a heading **"Half rating"**, `allowHalf`, `allowClear`, whose `value` the
fixture holds, starting at `2.5`. Output: `value: ...`, `reason: ...`.

Checks:

1. "2.5 stars" (star 3) is checked, the tab stop, with `data-half` and `data-highlighted`; stars
   1 and 2 are highlighted without `data-half`; stars 4 and 5 are not highlighted.
2. Focused on "2.5 stars", ArrowRight checks "3 stars" (`value: 3`, no `data-half`); ArrowLeft
   checks "2.5 stars" again; ArrowLeft checks "2 stars" (star 2, focused); Home checks "0.5
   stars" (star 1, half); ArrowLeft wraps to "5 stars"; End stays on "5 stars".
3. A click on the start half of star 2 checks "1.5 stars" (`value: 1.5`,
   `reason: item-press`); a click at the same point clears it (`value: 0`): no radio checked, no
   star highlighted, the pressed star still focused; a click on the end half of star 2 checks "2
   stars".
4. The mouse over the end half of star 4 highlights stars 1 to 4, none half; over its start half,
   star 4 has `data-half`; the value stays `2`.

### `/rating/half?dir=rtl`

The same page right to left. Checks: focused on "2.5 stars", ArrowLeft checks "3 stars" and
ArrowRight "2.5 stars"; a click on the start half (the right side) of star 4 checks "3.5 stars";
the mouse over the end half (the left side) of star 2 highlights stars 1 and 2, none half.

### `/rating/read-only`

Two Roots: one labelled by a heading **"Quality"**, `readOnly`, `defaultValue` `3`; one labelled
by a heading **"Service"**, `disabled`, `defaultValue` `2`; a button **"After"** after them.
Output: `value: ...` (either's last change, `none` before any).

Checks:

1. "Quality" has `aria-readonly="true"`; "3 stars" is checked, highlighted with stars 1 and 2, and
   the tab stop. Tab from the page start focuses it; ArrowRight, Home, End and Space change
   nothing (`value: none`); a click on "5 stars" changes nothing and the mouse over it highlights
   nothing more (stars 1 to 3 only).
2. "Service" has `aria-disabled="true"`; its five `radio`s are disabled and none is in the tab
   order (Tab from "Quality" focuses "After"); stars 1 and 2 are highlighted; a click on
   "4 stars" (forced) changes nothing.
3. Every Item of "Quality" has `data-readonly`, every Item of "Service" `data-disabled`.
4. Axe finds no violation.

### `/rating/field`

A `<form>` with a `Field.Root`: a `Field.Label` **"Satisfaction"**, a Root `required`,
`name="satisfaction"` with its HiddenInput, a `Field.Description` **"How was your stay?"**, a
`Field.Error` **"Choose a rating."**; buttons **"Submit"** and **"Reset"**. Output: `form: ...`.

Checks:

1. A `radiogroup` named "Satisfaction", described by "How was your stay?",
   `aria-required="true"`, not `aria-invalid`.
2. "Submit" submits nothing (`form: none`), focuses "1 star", makes the `radiogroup`
   `aria-invalid="true"` and shows "Choose a rating.".
3. A click on "4 stars" hides the error; "Submit" submits `form: satisfaction=4`.
4. "Reset" returns it to no star checked; "Submit" submits nothing again.
5. Axe finds no violation, before and after the failed submission.

## Differences from Base UI and the references

Base UI has no Rating. The decisions where the APG example is silent:

| topic | decision | reason |
| --- | --- | --- |
| Roles | a `radiogroup` with a `radio` per star, named by the consumer | the APG's rating radio group example (its slider example is the other option: one element, no star to name) |
| Half values | one radio per star; a half value checks the star that holds it (rounded up), which carries `data-half`; the consumer names it by the value | Zag/Ark's model (Reka UI renders a radio per step: two per star, twice the stops to name); a radio has no value text, so the name says it |
| The arrows | step the value (1, or 0.5), from `0` to the first step, wrapping (`loopFocus`, `true`), never to `0` | the APG radios' next and previous, over the value's steps so half steps work; the APG example wraps (Zag clamps) |
| Home and End | the first step and `count` | the APG radio group has none; a scale has ends (Zag's) |
| Space | checks the focused star's whole value when it is not checked | the APG ("if not checked, checks"); a checked half star stays half |
| `allowClear` | off by default; a press on the current value clears it; no key clears | a radio is not unchecked by choosing it again (the APG); a key that clears would leave the focus on no checked star |
| The preview | the stars follow a mouse or pen over the Root (`highlighted`, `half`), not touch; the value does not change until a press | Zag/Ark's hover; a touch has no hover |
| `data-highlighted` | the star's fill | the Issue's and Zag/Ark's name for it |
| Read-only | focusable, the tab stop on the checked star, nothing changes it, `aria-readonly` | `aria-readonly` is a `radiogroup` attribute; a score a keyboard user cannot reach is not read |
| The HiddenInput | a part the consumer renders (Zag/Ark's), its `name` only while the value is not `0` | the Issue's parts; no rating submits nothing, as a radio set |
| The value | a number, `0` for none | a score is a number; `0` stars is no rating (Zag uses `-1`) |
