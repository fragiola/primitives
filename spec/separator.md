# Separator

## Purpose

A divider between sections of content or groups of controls (the ARIA `separator` role, not
focusable: a static structure, not the APG's window splitter, which is
[`@fragiola/splitter`](https://fragiola.com/splitter)'s, D5). A decorative divider that means
nothing to assistive technologies is offered too (`decorative`).

**Scope: stage 1** (Epic #29). Base UI's `Separator` (1.9) decides the part and `orientation`
(D4); `decorative` is the Epic's scope (Base UI has no such prop: Radix's name).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Separator | `div` | `separator-root` | one part |

## API

**Separator**:

- `orientation` (`"horizontal"`): `"horizontal"` or `"vertical"`.
- `decorative` (`false`): when `true`, the separator is hidden from assistive technologies
  (`role="none"`, no `aria-orientation`).

## State attributes and ARIA

| case | attributes |
| --- | --- |
| semantic | `role="separator"`, `aria-orientation` (`"horizontal"` or `"vertical"`), `data-orientation` |
| decorative | `role="none"`, `data-orientation` |

## Keyboard

None: a static separator is not focusable.

## Focus

None.

## Pointer

None.

## Animation

None.

## RTL

Nothing changes.

## Scenarios

### `/separator/basic`

- a paragraph **"Account settings"**, a Separator, a paragraph **"Danger zone"**;
- a row of two links, **"Docs"** and **"Blog"** (`href="#"`), with a Separator
  `orientation="vertical"` between them;
- a Separator `decorative` under the row.

Checks:

1. Exactly two `separator` roles: the first `aria-orientation="horizontal"`, the second
   `"vertical"` (the decorative one is not in the tree).
2. The decorative one has `role="none"` and no `aria-orientation`.
3. The vertical separator is taller than it is wide, the horizontal one wider than it is tall
   (the recipe draws each along its orientation).
4. Axe finds no violation.

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI has no decorative separator | `decorative` (the Epic's scope): `role="none"`, as Radix |
