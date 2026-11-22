<script setup lang="ts">
import type { OpenChangeDetails } from "@fragiola/primitives-vue/context-menu";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { ContextMenu } from "../../kit/ui/context-menu.ts";

// spec/context-menu.md: a file area's menu, at the pointer or from the keyboard.
const open = ref(false);
const reason = ref<string>();
const action = ref<string>();
const select = (label: string) => () => {
    action.value = label;
};
const onOpenChange = (next: boolean, details: OpenChangeDetails) => {
    open.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <ContextMenu.Root @open-change="onOpenChange">
        <ContextMenu.Trigger class="h-48 w-96">
            <span>Files</span>
            <div class="flex gap-2">
                <button type="button">report.pdf</button>
                <button type="button">notes.txt</button>
            </div>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
            <ContextMenu.Positioner>
                <ContextMenu.Popup aria-label="File actions">
                    <ContextMenu.Item @click="select('Open')()">Open</ContextMenu.Item>
                    <ContextMenu.Item @click="select('Rename')()">Rename</ContextMenu.Item>
                    <ContextMenu.Separator />
                    <ContextMenu.Item @click="select('Delete')()">Delete</ContextMenu.Item>
                    <ContextMenu.SubmenuRoot>
                        <ContextMenu.SubmenuTrigger>Share</ContextMenu.SubmenuTrigger>
                        <ContextMenu.Portal>
                            <ContextMenu.Positioner>
                                <ContextMenu.Popup>
                                    <ContextMenu.Item @click="select('Email')()">Email</ContextMenu.Item>
                                    <ContextMenu.Item @click="select('Link')()">Link</ContextMenu.Item>
                                </ContextMenu.Popup>
                            </ContextMenu.Positioner>
                        </ContextMenu.Portal>
                    </ContextMenu.SubmenuRoot>
                </ContextMenu.Popup>
            </ContextMenu.Positioner>
        </ContextMenu.Portal>
    </ContextMenu.Root>
    <button type="button" class="mt-2">After area</button>
    <Output :values="{ open, reason, action }" />
</template>
