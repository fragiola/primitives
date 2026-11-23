# AspectRatio

## Purpose

Keeps its content at a width-to-height ratio: an image frame, a video embed, a map tile. It has
no behaviour beyond its structural style: no role, no state, no focus, no key.

**Why it is here despite D5.** By itself it is a markup-and-CSS component, which D5 gives to
Fragiola UI. It is in this library because `docs/handoff.md` §5 lists it in Stage 2, the
consensus set (Radix, Bits UI and Spartan ship it as a primitive, shadcn/ui on Radix's), and
Fragiola UI's `primitives` base (D7) needs every primitive the other bases have. It is kept to that: one part, one prop, a structural inline style, no behaviour to grow.

**Scope: stage 2** (Epic #64, Issue #63). The APG has no pattern and Base UI no component: the
CSS `aspect-ratio` property decides it (D4).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| AspectRatio | `div` | `aspect-ratio-root` | one part |

One entry, `/aspect-ratio` (D8), built on no other component and on no toolkit mechanism.

## API

**AspectRatio**:

- `ratio` (`1`): the width over the height (`16 / 9`). A ratio that is not a positive finite
  number is `1`.

Every other attribute and handler is forwarded (AGENTS.md rule 7).

## State attributes and ARIA

None: no role and no state attribute. Structural style: `aspect-ratio: <ratio>` and
`min-height: 0` (the content's size cannot stretch the box: a taller child overflows it, and the
app clips it or fits it with `object-fit`). Its width is the layout's (a block fills its
container); its height follows.

## Keyboard

None.

## Focus

None.

## Pointer

None.

## Animation

None.

## RTL

Nothing changes.

## Scenarios

### `/aspect-ratio/basic`

- A `w-80` frame holding an AspectRatio with `ratio` `16 / 9`, an `<img>` inside it
  (`alt="Mountain lake"`, a 1 × 1 data URL, `size-full object-cover`);
- a `w-40` frame holding an AspectRatio with the default `ratio`, a `div` inside it
  `aria-label="Avatar placeholder"`, `role="img"`;
- a button **"Widen"** that makes the first frame `w-[32rem]`.

Checks:

1. The 16:9 box is 320 px wide and 180 px tall; the image fills it.
2. The square box is 160 px by 160 px.
3. "Widen": the 16:9 box becomes 512 px by 288 px (its height follows the width).
4. Axe finds no violation.

## Differences from Base UI

Base UI has no AspectRatio. Radix's wraps the content in two elements (a `padding-bottom`
spacer and an absolutely placed child): the CSS `aspect-ratio` property needs one.
