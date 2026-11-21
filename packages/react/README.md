# @fragiola/primitives-react

Headless, accessible React 19 primitives of [Fragiola Primitives](https://fragiola.com/primitives):
behaviour, keyboard, focus and ARIA, with no CSS, no icons and no text. You render and style every
part; state comes out as `data-*` and ARIA attributes.

```sh
pnpm add @fragiola/primitives-react
```

**One entry per component**: import from `@fragiola/primitives-react/<component>` (or the root,
which only re-exports them). An app that uses Dialog and Tabs bundles only those two.

```tsx
import { Dialog } from "@fragiola/primitives-react/dialog";

<Dialog.Root>
    <Dialog.Trigger>Edit profile</Dialog.Trigger>
    <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
            <Dialog.Title>Edit profile</Dialog.Title>
            <Dialog.Description>Change your display name.</Dialog.Description>
            <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
    </Dialog.Portal>
</Dialog.Root>;
```

| entry | namespace |
| --- | --- |
| `/dialog` | `Dialog`: `Root`, `Trigger`, `Portal`, `Backdrop`, `Popup`, `Title`, `Description`, `Close` |
| `/tabs` | `Tabs`: `Root`, `List`, `Tab`, `Indicator`, `Panel` |

Every part takes `render` (an element, or `(props, state) => node`), `className` and `style` (a
value or a function of the state) and a `ref`; other props are forwarded, and your handlers run
after the part's own. Every element carries `data-primitives-part="<component>-<part>"`.

Peer dependencies: `react` and `react-dom` 19. ESM only. MIT licence.
