<script setup lang="ts">
import { ContextMenu } from "@fragiola/primitives-vue/context-menu";
import { ref } from "vue";
import { styles } from "./styles.ts";

const FILES = ["report.pdf", "notes.txt", "photo.png"];

// A file manager: right-click a file (or long-press it, or focus it and press Shift+F10) to open
// its menu at the pointer; "Share" opens a submenu, and the last action shows below
// (spec/context-menu.md).
const file = ref("report.pdf");
const status = ref("Right-click a file");
const act = (action: string) => {
    status.value = `${action}: ${file.value}`;
};
</script>

<template>
    <div :class="styles.stack">
        <ContextMenu.Root>
            <ContextMenu.Trigger :class="styles.trigger">
                <span :class="styles.heading">Documents</span>
                <ul :class="styles.files">
                    <li v-for="name in FILES" :key="name">
                        <button
                            type="button"
                            :class="styles.file"
                            @focus="file = name"
                            @pointerdown="file = name"
                        >
                            {{ name }}
                        </button>
                    </li>
                </ul>
            </ContextMenu.Trigger>
            <ContextMenu.Portal>
                <ContextMenu.Positioner :class="styles.positioner">
                    <ContextMenu.Popup aria-label="File actions" :class="styles.popup">
                        <ContextMenu.Item :class="styles.item" @click="act('Opened')">Open</ContextMenu.Item>
                        <ContextMenu.Item :class="styles.item" @click="act('Renamed')">Rename</ContextMenu.Item>
                        <ContextMenu.SubmenuRoot>
                            <ContextMenu.SubmenuTrigger :class="styles.submenuTrigger">Share</ContextMenu.SubmenuTrigger>
                            <ContextMenu.Portal>
                                <ContextMenu.Positioner :class="styles.positioner">
                                    <ContextMenu.Popup :class="styles.popup">
                                        <ContextMenu.Item :class="styles.item" @click="act('Emailed')">Email</ContextMenu.Item>
                                        <ContextMenu.Item :class="styles.item" @click="act('Link copied')">Copy link</ContextMenu.Item>
                                    </ContextMenu.Popup>
                                </ContextMenu.Positioner>
                            </ContextMenu.Portal>
                        </ContextMenu.SubmenuRoot>
                        <ContextMenu.Separator :class="styles.separator" />
                        <ContextMenu.Item :class="styles.item" @click="act('Deleted')">Delete</ContextMenu.Item>
                    </ContextMenu.Popup>
                </ContextMenu.Positioner>
            </ContextMenu.Portal>
        </ContextMenu.Root>
        <p :class="styles.status">{{ status }}</p>
    </div>
</template>
