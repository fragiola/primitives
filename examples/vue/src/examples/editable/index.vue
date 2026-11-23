<script setup lang="ts">
import { Editable } from "@fragiola/primitives-vue/editable";
import { ref } from "vue";
import { styles } from "./styles.ts";

const PENCIL = "M4 20h4L19 9l-4-4L4 16v4z";
const CHECK = "M5 12l5 5L20 7";
const CROSS = "M6 6l12 12M18 6L6 18";

// An inline-editable title (spec/editable.md): focusing the title or pressing the pencil turns it
// into a field with the text selected; Enter or the check saves it, Escape or the cross puts it
// back, and the focus returns to the pencil.
const status = ref("");
const saved = (value: string) => {
    status.value = `Saved “${value}”.`;
};
const cancelled = () => {
    status.value = "Edit cancelled.";
};
</script>

<template>
    <div :class="styles.stack">
        <label for="document-title" :class="styles.label">Document title</label>
        <Editable.Root
            id="document-title"
            default-value="Quarterly report"
            placeholder="Untitled document"
            :class="styles.root"
            @value-commit="saved"
            @value-revert="cancelled"
        >
            <Editable.Area :class="styles.area">
                <Editable.Preview :class="styles.preview" />
                <Editable.Input :class="styles.input" />
            </Editable.Area>
            <Editable.EditTrigger aria-label="Rename" :class="styles.editTrigger">
                <svg
                    :class="styles.icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                >
                    <path :d="PENCIL" />
                </svg>
            </Editable.EditTrigger>
            <Editable.SubmitTrigger aria-label="Save" :class="styles.submitTrigger">
                <svg
                    :class="styles.icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                >
                    <path :d="CHECK" />
                </svg>
            </Editable.SubmitTrigger>
            <Editable.CancelTrigger aria-label="Cancel" :class="styles.cancelTrigger">
                <svg
                    :class="styles.icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                >
                    <path :d="CROSS" />
                </svg>
            </Editable.CancelTrigger>
        </Editable.Root>
        <p role="status" :class="styles.status">{{ status }}</p>
    </div>
</template>
