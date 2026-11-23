<script setup lang="ts">
import { Menu } from "@fragiola/primitives-vue/menu";
import { Menubar } from "@fragiola/primitives-vue/menubar";
import { ref } from "vue";
import { styles } from "./styles.ts";

const RECENT = ["notes.md", "budget.csv", "plan.txt"];

const ZOOMS = [
    { value: "75", label: "75%" },
    { value: "100", label: "100%" },
    { value: "150", label: "150%" },
];

// An app menu bar: File, Edit and View are Menus whose Triggers are the bar's items, one tab
// stop. The arrow keys move between them, ArrowDown opens a menu, and while one is open the
// arrows and the pointer move from menu to menu; "Open recent" is a submenu, and View holds
// checkbox and radio items (spec/menubar.md).
const last = ref("none");
const ruler = ref(true);
const wrap = ref(false);
const zoom = ref<string | null>("100");
const run = (command: string) => {
    last.value = command;
};
</script>

<template>
    <div :class="styles.stack">
        <Menubar aria-label="Application" :class="styles.bar">
            <Menu.Root>
                <Menu.Trigger :class="styles.trigger">File</Menu.Trigger>
                <Menu.Portal>
                    <Menu.Positioner :side-offset="4" :class="styles.positioner">
                        <Menu.Popup :class="styles.popup">
                            <Menu.Item :class="styles.item" @click="run('New file')">New file</Menu.Item>
                            <Menu.SubmenuRoot>
                                <Menu.SubmenuTrigger :class="styles.submenuTrigger">Open recent</Menu.SubmenuTrigger>
                                <Menu.Portal>
                                    <Menu.Positioner :class="styles.positioner">
                                        <Menu.Popup :class="styles.popup">
                                            <Menu.Item
                                                v-for="file in RECENT"
                                                :key="file"
                                                :class="styles.item"
                                                @click="run(`Open ${file}`)"
                                            >
                                                {{ file }}
                                            </Menu.Item>
                                        </Menu.Popup>
                                    </Menu.Positioner>
                                </Menu.Portal>
                            </Menu.SubmenuRoot>
                            <Menu.Separator :class="styles.separator" />
                            <Menu.Item :class="styles.item" @click="run('Save')">Save</Menu.Item>
                            <Menu.Item disabled :class="styles.item">Export</Menu.Item>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            <Menu.Root>
                <Menu.Trigger :class="styles.trigger">Edit</Menu.Trigger>
                <Menu.Portal>
                    <Menu.Positioner :side-offset="4" :class="styles.positioner">
                        <Menu.Popup :class="styles.popup">
                            <Menu.Item :class="styles.item" @click="run('Undo')">Undo</Menu.Item>
                            <Menu.Item :class="styles.item" @click="run('Redo')">Redo</Menu.Item>
                            <Menu.Separator :class="styles.separator" />
                            <Menu.Item :class="styles.item" @click="run('Cut')">Cut</Menu.Item>
                            <Menu.Item :class="styles.item" @click="run('Copy')">Copy</Menu.Item>
                            <Menu.Item :class="styles.item" @click="run('Paste')">Paste</Menu.Item>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            <Menu.Root>
                <Menu.Trigger :class="styles.trigger">View</Menu.Trigger>
                <Menu.Portal>
                    <Menu.Positioner :side-offset="4" :class="styles.positioner">
                        <Menu.Popup :class="styles.popup">
                            <Menu.CheckboxItem v-model:checked="ruler" :class="styles.checkboxItem">
                                <Menu.CheckboxItemIndicator :class="styles.checkboxItemIndicator">✓</Menu.CheckboxItemIndicator>
                                Show ruler
                            </Menu.CheckboxItem>
                            <Menu.CheckboxItem v-model:checked="wrap" :class="styles.checkboxItem">
                                <Menu.CheckboxItemIndicator :class="styles.checkboxItemIndicator">✓</Menu.CheckboxItemIndicator>
                                Word wrap
                            </Menu.CheckboxItem>
                            <Menu.Separator :class="styles.separator" />
                            <Menu.Group :class="styles.group">
                                <Menu.GroupLabel :class="styles.groupLabel">Zoom</Menu.GroupLabel>
                                <Menu.RadioGroup v-model:value="zoom" :class="styles.radioGroup">
                                    <Menu.RadioItem
                                        v-for="entry in ZOOMS"
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
        </Menubar>
        <dl :class="styles.summary">
            <dt>Last command</dt>
            <dd>{{ last }}</dd>
            <dt>Ruler</dt>
            <dd>{{ ruler ? "shown" : "hidden" }}</dd>
            <dt>Word wrap</dt>
            <dd>{{ wrap ? "on" : "off" }}</dd>
            <dt>Zoom</dt>
            <dd>{{ zoom }}%</dd>
        </dl>
    </div>
</template>
