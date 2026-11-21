<script setup lang="ts">
import { Popover } from "@fragiola/primitives-vue/popover";
import { styles } from "./styles.ts";

// A "Notifications" popover: the trigger opens it under itself, focus moves to its first button,
// Tab walks it and leaves it closed, and Escape or a press outside closes it.
</script>

<template>
    <Popover.Root>
        <Popover.Trigger :class="styles.trigger">Notifications</Popover.Trigger>
        <Popover.Portal>
            <Popover.Positioner :side-offset="8" :class="styles.positioner">
                <Popover.Popup :class="styles.popup">
                    <Popover.Arrow :class="styles.arrow" />
                    <Popover.Title :class="styles.title">Notifications</Popover.Title>
                    <Popover.Description :class="styles.description">
                        You have 2 unread messages.
                    </Popover.Description>
                    <div :class="styles.actions">
                        <Popover.Close :class="styles.close">Dismiss</Popover.Close>
                        <Popover.Close :class="styles.close">Mark all as read</Popover.Close>
                    </div>
                </Popover.Popup>
            </Popover.Positioner>
        </Popover.Portal>
    </Popover.Root>
</template>
