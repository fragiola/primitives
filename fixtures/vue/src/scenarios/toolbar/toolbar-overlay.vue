<script setup lang="ts">
import { Popover } from "@fragiola/primitives-vue/popover";
import { popover } from "examples-shared/recipes/popover";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Toggle } from "../../kit/ui/toggle.ts";
import { ToggleGroup } from "../../kit/ui/toggle-group.ts";
import { Toolbar } from "../../kit/ui/toolbar.ts";

// spec/toolbar.md, `/toolbar/overlay`
const align = ref<string[]>();
</script>

<template>
    <div class="flex flex-wrap items-center gap-2">
        <Toolbar.Root aria-label="Formatting">
            <Toolbar.Button>Undo</Toolbar.Button>
            <Popover.Root>
                <Popover.Trigger :as="Toolbar.Button">More</Popover.Trigger>
                <Popover.Portal>
                    <Popover.Positioner :side-offset="4" :class="popover.positioner">
                        <Popover.Popup :class="popover.popup">
                            <ToggleGroup aria-label="Alignment" @value-change="(next: string[]) => (align = next)">
                                <Toggle value="left">Left</Toggle>
                                <Toggle value="center">Center</Toggle>
                            </ToggleGroup>
                            <Toggle>Wrap</Toggle>
                        </Popover.Popup>
                    </Popover.Positioner>
                </Popover.Portal>
            </Popover.Root>
        </Toolbar.Root>
        <button type="button">After</button>
    </div>
    <Output :values="{ align: align?.join(',') }" />
</template>
