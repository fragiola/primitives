<script setup lang="ts">
import { Command } from "@fragiola/primitives-vue/command";
import { Dialog } from "@fragiola/primitives-vue/dialog";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { styles } from "./styles.ts";

const THEMES = ["Light", "Dark", "System"];

const open = ref(false);
const pages = ref<string[]>([]);
const ran = ref<string | null>(null);
const page = computed(() => pages.value[pages.value.length - 1]);
watch(open, (next) => {
    if (!next) pages.value = [];
});
const toggle = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        open.value = !open.value;
    }
};
onMounted(() => document.addEventListener("keydown", toggle));
onBeforeUnmount(() => document.removeEventListener("keydown", toggle));
const run = (value: string) => {
    ran.value = value;
    open.value = false;
};

// An app's command menu: a Command inside a modal Dialog that Ctrl+K (⌘K) toggles, the app's own
// shortcut (spec/command.md, "The Command dialog"). Typing filters the commands by their names
// and keywords, the arrows move the highlight while focus stays in the input, Enter runs one,
// "Change theme…" opens a nested page that Backspace on the empty input leaves.
</script>

<template>
    <div :class="styles.stack">
        <Dialog.Root v-model:open="open">
            <Dialog.Trigger :class="styles.trigger">Open command menu</Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Backdrop :class="styles.backdrop" />
                <Dialog.Popup aria-label="Command menu" :class="styles.popup">
                    <Command.Root v-model:pages="pages" :class="styles.root">
                        <Command.Input aria-label="Command" placeholder="Type a command or search…" :class="styles.input" />
                        <Command.Empty :class="styles.empty">No results.</Command.Empty>
                        <Command.List :class="styles.list">
                            <template v-if="page === undefined">
                                <Command.Group :class="styles.group">
                                    <Command.GroupLabel :class="styles.groupLabel">Navigation</Command.GroupLabel>
                                    <Command.Item value="Home" :class="styles.item" @select="run">Home</Command.Item>
                                    <Command.Item value="Settings" :keywords="['preferences']" :class="styles.item" @select="run">Settings</Command.Item>
                                    <Command.Item value="Profile" :keywords="['account']" :class="styles.item" @select="run">Profile</Command.Item>
                                </Command.Group>
                                <Command.Separator :class="styles.separator" />
                                <Command.Group :class="styles.group">
                                    <Command.GroupLabel :class="styles.groupLabel">Actions</Command.GroupLabel>
                                    <Command.Item value="Change theme…" :class="styles.item" @select="pages = ['theme']">Change theme…</Command.Item>
                                    <Command.Item value="Copy link" :keywords="['share', 'url']" :class="styles.item" @select="run">Copy link</Command.Item>
                                    <Command.Item value="Delete project" disabled :class="styles.item" @select="run">Delete project</Command.Item>
                                </Command.Group>
                            </template>
                            <template v-if="page === 'theme'">
                                <Command.Item v-for="theme in THEMES" :key="theme" :value="theme" :class="styles.item" @select="run">{{ theme }}</Command.Item>
                            </template>
                        </Command.List>
                    </Command.Root>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
        <p :class="styles.shortcut">Or press Ctrl K (⌘K on a Mac).</p>
        <p role="status" :class="styles.status">{{ ran === null ? "" : `Ran: ${ran}` }}</p>
    </div>
</template>
