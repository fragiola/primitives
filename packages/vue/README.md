# @fragiola/primitives-vue

Headless, accessible Vue 3.5 primitives of [Fragiola Primitives](https://fragiola.com/primitives):
behaviour, keyboard, focus and ARIA, with no CSS, no icons and no text. You render and style every
part; state comes out as `data-*` and ARIA attributes.

```sh
pnpm add @fragiola/primitives-vue
```

**One entry per component**: import from `@fragiola/primitives-vue/<component>` (or the root,
which only re-exports them). There is no `app.use()` plugin: an app imports what it uses.

```vue
<script setup lang="ts">
import { Dialog } from "@fragiola/primitives-vue/dialog";
</script>

<template>
    <Dialog.Root>
        <Dialog.Trigger>Edit profile</Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup>
                <Dialog.Title>Edit profile</Dialog.Title>
                <Dialog.Close>Close</Dialog.Close>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>
</template>
```

| entry | namespace |
| --- | --- |
| `/dialog` | `Dialog`: `Root`, `Trigger`, `Portal`, `Backdrop`, `Popup`, `Title`, `Description`, `Close` |
| `/tabs` | `Tabs`: `Root`, `List`, `Tab`, `Indicator`, `Panel` |

Controlled state with `v-model:open` / `v-model:value`; another element with `as`, or the
`#render="{ props, state, children }"` scoped slot. Every element carries
`data-primitives-part="<component>-<part>"`.

Peer dependency: `vue` 3.5. ESM only. MIT licence.
