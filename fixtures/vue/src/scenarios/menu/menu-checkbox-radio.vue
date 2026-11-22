<script setup lang="ts">
import type { OpenChangeDetails } from "@fragiola/primitives-vue/menu";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Menu } from "../../kit/ui/menu.ts";

// spec/menu.md: a view-options menu with checkbox and radio items.
const open = ref(false);
const reason = ref<string>();
const toolbar = ref(true);
const statusBar = ref(false);
const sort = ref<string | null>("name");
const onOpenChange = (next: boolean, details: OpenChangeDetails) => {
    open.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <Menu.Root @open-change="onOpenChange">
        <Menu.Trigger>View</Menu.Trigger>
        <Menu.Portal>
            <Menu.Positioner :side-offset="4">
                <Menu.Popup>
                    <Menu.CheckboxItem default-checked @checked-change="(checked: boolean) => (toolbar = checked)"><Menu.CheckboxItemIndicator>✓</Menu.CheckboxItemIndicator>Show toolbar</Menu.CheckboxItem>
                    <Menu.CheckboxItem @checked-change="(checked: boolean) => (statusBar = checked)"><Menu.CheckboxItemIndicator>✓</Menu.CheckboxItemIndicator>Show status bar</Menu.CheckboxItem>
                    <Menu.Separator />
                    <Menu.Group>
                        <Menu.GroupLabel>Sort by</Menu.GroupLabel>
                        <Menu.RadioGroup default-value="name" @value-change="(value: string | null) => (sort = value)">
                            <Menu.RadioItem value="name"><Menu.RadioItemIndicator>•</Menu.RadioItemIndicator>Name</Menu.RadioItem>
                            <Menu.RadioItem value="date"><Menu.RadioItemIndicator>•</Menu.RadioItemIndicator>Date</Menu.RadioItem>
                            <Menu.RadioItem value="size" disabled><Menu.RadioItemIndicator>•</Menu.RadioItemIndicator>Size</Menu.RadioItem>
                        </Menu.RadioGroup>
                    </Menu.Group>
                </Menu.Popup>
            </Menu.Positioner>
        </Menu.Portal>
    </Menu.Root>
    <Output :values="{ open, reason, toolbar, 'status bar': statusBar, sort }" />
</template>
