<script setup lang="ts">
import { Menu } from "@fragiola/primitives-vue/menu";
import { computed, ref } from "vue";
import { styles } from "./styles.ts";

const SORTS = [
    { value: "name", label: "Name" },
    { value: "date", label: "Date modified" },
    { value: "size", label: "Size" },
];

// A "View" menu of options: Space toggles a checkbox item or checks a radio item and keeps the
// menu open, Enter does it and closes the menu, and a click keeps it open (spec/menu.md).
const toolbar = ref(true);
const statusBar = ref(false);
const sort = ref<string | null>("name");
const sortLabel = computed(
    () => SORTS.find((entry) => entry.value === sort.value)?.label,
);
</script>

<template>
    <div :class="styles.stack">
        <Menu.Root>
            <Menu.Trigger :class="styles.trigger">View</Menu.Trigger>
            <Menu.Portal>
                <Menu.Positioner :side-offset="4" :class="styles.positioner">
                    <Menu.Popup :class="styles.popup">
                        <Menu.CheckboxItem v-model:checked="toolbar" :class="styles.checkboxItem">
                            <Menu.CheckboxItemIndicator :class="styles.checkboxItemIndicator">✓</Menu.CheckboxItemIndicator>
                            Show toolbar
                        </Menu.CheckboxItem>
                        <Menu.CheckboxItem v-model:checked="statusBar" :class="styles.checkboxItem">
                            <Menu.CheckboxItemIndicator :class="styles.checkboxItemIndicator">✓</Menu.CheckboxItemIndicator>
                            Show status bar
                        </Menu.CheckboxItem>
                        <Menu.Separator :class="styles.separator" />
                        <Menu.Group :class="styles.group">
                            <Menu.GroupLabel :class="styles.groupLabel">Sort by</Menu.GroupLabel>
                            <Menu.RadioGroup v-model:value="sort" :class="styles.radioGroup">
                                <Menu.RadioItem
                                    v-for="entry in SORTS"
                                    :key="entry.value"
                                    :value="entry.value"
                                    :class="styles.radioItem"
                                >
                                    <Menu.RadioItemIndicator :class="styles.radioItemIndicator">•</Menu.RadioItemIndicator>
                                    {{ entry.label }}
                                </Menu.RadioItem>
                            </Menu.RadioGroup>
                        </Menu.Group>
                    </Menu.Popup>
                </Menu.Positioner>
            </Menu.Portal>
        </Menu.Root>
        <dl :class="styles.summary">
            <dt>Toolbar</dt>
            <dd>{{ toolbar ? "shown" : "hidden" }}</dd>
            <dt>Status bar</dt>
            <dd>{{ statusBar ? "shown" : "hidden" }}</dd>
            <dt>Sorted by</dt>
            <dd>{{ sortLabel }}</dd>
        </dl>
    </div>
</template>
