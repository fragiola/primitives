<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Toggle } from "../../kit/ui/toggle.ts";
import { ToggleGroup } from "../../kit/ui/toggle-group.ts";
import { Toolbar } from "../../kit/ui/toolbar.ts";

// spec/toolbar.md, `/toolbar/basic` (and `?dir=rtl`)
const style = ref<string[]>();
const pressed = ref<string>();
// the input's text, as React's `defaultValue`: a re-render never resets what was typed
const search = ref("draft");
const onSearch = (event: Event) => {
    search.value = (event.target as HTMLInputElement).value;
};
</script>

<template>
    <div class="flex flex-wrap items-center gap-2">
        <button type="button">Before</button>
        <Toolbar.Root aria-label="Formatting">
            <ToggleGroup aria-label="Text style" multiple @value-change="(next: string[]) => (style = next)">
                <Toggle value="bold">Bold</Toggle>
                <Toggle value="italic">Italic</Toggle>
            </ToggleGroup>
            <Toolbar.Separator />
            <Toolbar.Group aria-label="History">
                <Toolbar.Button @click="pressed = 'Undo'">Undo</Toolbar.Button>
                <Toolbar.Button disabled @click="pressed = 'Redo'">Redo</Toolbar.Button>
            </Toolbar.Group>
            <Toolbar.Separator />
            <Toolbar.Button disabled focusable-when-disabled @click="pressed = 'Share'">Share</Toolbar.Button>
            <Toolbar.Link href="#help">Help</Toolbar.Link>
            <Toolbar.Input aria-label="Search" :value="search" @input="onSearch" />
        </Toolbar.Root>
        <button type="button">After</button>
    </div>
    <Output :values="{ style: style?.join(','), pressed }" />
</template>
