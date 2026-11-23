<script setup lang="ts">
import {
    TagsInput,
    type TagsInputInvalidDetails,
} from "@fragiola/primitives-vue/tags-input";
import { ref } from "vue";
import { styles } from "./styles.ts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RECIPIENTS = ["ada@example.com", "grace@example.com"];

// Email recipients: Enter, a comma or a paste turns the typed text into recipients
// (spec/tags-input.md). A text that is no address, or one already there, is refused: it stays in
// the field and the message says why. Backspace at the start reaches the last recipient (a second
// one removes it), a double press edits one, and leaving the field adds what was typed.
const message = ref("");
const validate = (text: string) => EMAIL.test(text);
const explain = (text: string, details: TagsInputInvalidDetails) => {
    message.value =
        details.cause === "duplicate"
            ? `${text} is already a recipient.`
            : `${text} is not an email address.`;
};
</script>

<template>
    <div :class="styles.stack">
        <label for="recipients" :class="styles.label">To</label>
        <TagsInput.Root
            v-slot="{ value }"
            :default-value="RECIPIENTS"
            :validate="validate"
            editable
            blur-behavior="add"
            :class="styles.root"
            @value-change="message = ''"
            @value-invalid="explain"
        >
            <TagsInput.Control :class="styles.control">
                <!-- a tag is its place in the value -->
                <TagsInput.Tag v-for="(email, index) in value" :key="index" :index="index" :class="styles.tag">
                    <TagsInput.TagText :class="styles.tagText">{{ email }}</TagsInput.TagText>
                    <TagsInput.TagInput aria-label="Edit recipient" :class="styles.tagInput" />
                    <TagsInput.TagRemove :aria-label="`Remove ${email}`" :class="styles.tagRemove">×</TagsInput.TagRemove>
                </TagsInput.Tag>
                <TagsInput.Input id="recipients" :class="styles.input" />
            </TagsInput.Control>
            <TagsInput.ClearTrigger aria-label="Clear recipients" :class="styles.clearTrigger">×</TagsInput.ClearTrigger>
        </TagsInput.Root>
        <p role="status" :class="styles.status">{{ message }}</p>
    </div>
</template>
