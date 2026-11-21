<script setup lang="ts">
import { Dialog } from "@fragiola/primitives-vue/dialog";
import { styles } from "./styles.ts";

// An "Edit profile" dialog: the trigger opens it, focus moves to the first field, Tab stays
// inside, and Escape, a press outside or either button closes it, focus back on the trigger.
</script>

<template>
    <Dialog.Root>
        <Dialog.Trigger :class="styles.trigger">Edit profile</Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Backdrop :class="styles.backdrop" />
            <Dialog.Popup :class="styles.popup">
                <Dialog.Title :class="styles.title">Edit profile</Dialog.Title>
                <Dialog.Description :class="styles.description">
                    Change how others see you. Save when you are done.
                </Dialog.Description>
                <div :class="styles.form">
                    <label :class="styles.field">
                        Name
                        <input :class="styles.input" value="Ada Lovelace" />
                    </label>
                    <label :class="styles.field">
                        Username
                        <input :class="styles.input" value="ada" />
                    </label>
                </div>
                <div :class="styles.actions">
                    <Dialog.Close :class="styles.close">Cancel</Dialog.Close>
                    <Dialog.Close :class="styles.close">Save</Dialog.Close>
                </div>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>
</template>
