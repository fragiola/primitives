# Avatar

## Purpose

An image that represents a person, with a fallback (initials, an icon) while the image loads or
when it fails. The image is shown only once it has loaded, so a broken image never shows and the
layout does not shift between the fallback and the image (the consumer sizes the Root). The ARIA
`img` role of a plain `<img>` with its `alt` is all the accessibility it needs; the APG has no
pattern. A group of avatars and a status badge are Fragiola UI's (markup and CSS, D5).

**Scope: stage 1** (Epic #29). Base UI's `Avatar` (1.9) decides the parts, the loading statuses
and the Fallback's `delay` (D4).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Avatar.Root | `span` | `avatar-root` | holds the image's loading status |
| Avatar.Image | `img` | `avatar-image` | rendered only once its image has loaded |
| Avatar.Fallback | `span` | `avatar-fallback` | rendered while the image is not loaded (after its `delay`) |

## API

**Avatar.Root**: no props.

**Avatar.Image**: `src` (and every `img` attribute: `alt`, `srcset`, `sizes`, `crossorigin`,
`referrerpolicy`, forwarded; `crossorigin` and `referrerpolicy` also apply to the load);
`onLoadingStatusChange(status)`: called with each new status but `idle`.

**Avatar.Fallback**: `delay` (ms, none): the Fallback is rendered only once `delay` has passed
since it mounted, so a fast image never flashes its fallback. Its children are its content.

**The loading status** is the Root's: `idle` (no Image, or not loading yet), `loading`, `loaded`,
`error` (the image failed, or the Image has no `src`). The Image loads its `src` outside the
document (the toolkit's `/image` entry, `watchImageStatus`) and renders its `img` once it has
loaded. **A cached image** is `loaded` at once: the load is complete as soon as it starts, so the
status goes from `idle` to `loaded`, never through `loading`, within the mount (before the
browser paints: React's layout effect, Vue's `onMounted`, Angular's `afterNextRender`), so the
Fallback is never painted.
A new `src` loads again. When the Image unmounts, the status returns to `idle`.

**On a server** the status is `idle`: the Image renders nothing and the Fallback is rendered
(none with a `delay`, which has not passed). The load starts once mounted in the browser.

## State attributes and ARIA

None of their own: the parts carry no status attribute (Base UI). The Image is a plain `img`,
named by its `alt`; the Fallback's content is the consumer's (an `aria-label` or text, or
`aria-hidden` for a decorative one).

## Keyboard

None.

## Focus

None.

## Pointer

None.

## Animation

None of its own: the Image mounts once loaded, so a recipe may fade it in from
`data-starting-style` in a later stage.

## RTL

Nothing changes.

## Scenarios

The fixtures serve the images themselves (`/avatar/ada.svg`, a small SVG, from each fixture's
public folder); `/avatar/missing.svg` does not exist. The behaviour tests slow an image down by
intercepting its request, never through the network.

### `/avatar/basic`

- an Avatar with an Image `src="/avatar/ada.svg"` `alt="Ada Lovelace"` and a Fallback **"AL"**;
- an Avatar with an Image `src="/avatar/missing.svg"` `alt="Grace Hopper"` and a Fallback
  **"GH"**;
- an Avatar with no Image and a Fallback **"KJ"** with `delay` `300`;
- a button **"Show again"** that mounts, once pressed, a fourth Avatar with an Image
  `src="/avatar/ada.svg"` `alt="Ada again"` and a Fallback **"AA"**.

Output: `ada: <the first Image's last status>`, `missing: <the second's>`, `again: <every status
the fourth Image reported, joined with commas>` (`none` before any).

Checks:

1. Once loaded (`ada: loaded`), an `img` named "Ada Lovelace" is shown and "AL" is not.
2. The broken image: `missing: error`, no `img` named "Grace Hopper", "GH" is shown.
3. **A slow image**: with `/avatar/ada.svg` answered after 800 ms, the first Avatar reports
   `ada: loading` and shows "AL" with no `img`; once answered, `ada: loaded`, the image is shown
   and "AL" is gone.
4. **The delay**: with the clock installed before the page loads, "KJ" is not rendered at first,
   and is rendered once 300 ms have run.
5. **A cached image**: once `ada: loaded`, "Show again" mounts the fourth Avatar: `again: loaded`
   (no `loading` before it), the `img` "Ada again" is shown and "AA" is not.
6. Axe finds no violation.

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI's `keepMounted` on the Image, and its enter and exit transitions | out of scope (the Epic's scope: the image only shows once loaded) |
