<script setup lang="ts">
import { AlertDialog } from "@fragiola/primitives-vue/alert-dialog";
import { ref } from "vue";
import { styles } from "./styles.ts";

// A draft with a "Discard draft" button: the alert dialog asks first, focus starts on "Keep
// editing" (the least destructive answer), a press outside does nothing, and "Discard" clears the
// draft and closes it (spec/alert-dialog.md).
const open = ref(false);
const draft = ref("Dear Ada, the engine is ready.");
const discard = () => {
    draft.value = "";
    open.value = false;
};
</script>

<template>
    <div :class="styles.stack">
        <label :class="styles.field">
            Draft
            <textarea v-model="draft" :class="styles.textarea" />
        </label>
        <AlertDialog.Root v-model:open="open">
            <AlertDialog.Trigger :class="styles.trigger" :disabled="draft === ''">
                Discard draft
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
                <AlertDialog.Backdrop :class="styles.backdrop" />
                <AlertDialog.Popup :class="styles.popup">
                    <AlertDialog.Title :class="styles.title">Discard draft?</AlertDialog.Title>
                    <AlertDialog.Description :class="styles.description">
                        Your draft will be deleted. This cannot be undone.
                    </AlertDialog.Description>
                    <div :class="styles.actions">
                        <AlertDialog.Close :class="styles.close">Keep editing</AlertDialog.Close>
                        <button type="button" :class="styles.action" @click="discard">Discard</button>
                    </div>
                </AlertDialog.Popup>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    </div>
</template>
