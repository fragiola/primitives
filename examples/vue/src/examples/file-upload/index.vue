<script setup lang="ts">
import { Field } from "@fragiola/primitives-vue/field";
import {
    FileUpload,
    type FileUploadPickDetails,
} from "@fragiola/primitives-vue/file-upload";
import { ref } from "vue";
import { styles } from "./styles.ts";

const MESSAGES: Record<string, string> = {
    "invalid-type": "not an image or a PDF",
    "too-large": "over 5 MB",
    "too-many": "more than 4 files",
};

const explain = (reasons: readonly string[]) =>
    reasons.map((reason) => MESSAGES[reason] ?? reason).join(", ");

const announce = (details: FileUploadPickDetails) =>
    `${details.value.length} attached, ${details.rejectedFiles.length} rejected`;

const sent = ref<string | null>(null);
const onSubmit = (event: Event) => {
    const files = new FormData(event.currentTarget as HTMLFormElement)
        .getAll("attachments")
        .filter((entry): entry is File => entry instanceof File);
    sent.value = files.map((file) => file.name).join(", ");
};

// A required Field of attachments: drop files on the zone, paste them on it or pick them in the
// dialog; each pick is checked by type, size and count, the accepted files list their name and
// size with a remove button, the rejected ones say why, and a polite region announces the pick.
// The form submits the files through the hidden file input (spec/file-upload.md).
</script>

<template>
    <form :class="styles.form" @submit.prevent="onSubmit">
        <Field.Root name="attachments" :class="styles.field.root">
            <Field.Label :class="styles.field.label">Attachments</Field.Label>
            <FileUpload.Root :max-files="4" :max-file-size="5_000_000" accept="image/*,.pdf" required :announcement="announce" :class="styles.root">
                <template #default="{ value, rejectedFiles }">
                    <FileUpload.Dropzone :class="styles.dropzone">Drop images or PDFs here, or press to choose</FileUpload.Dropzone>
                    <div :class="styles.actions">
                        <FileUpload.Trigger :class="styles.trigger">Choose files</FileUpload.Trigger>
                        <FileUpload.ClearTrigger :class="styles.clearTrigger">Clear all</FileUpload.ClearTrigger>
                    </div>
                    <FileUpload.HiddenInput />
                    <FileUpload.ItemGroup :class="styles.itemGroup">
                        <FileUpload.Item v-for="file in value" :key="file.name" :file="file" :class="styles.item">
                            <div :class="styles.itemText">
                                <FileUpload.ItemName :class="styles.itemName" />
                                <FileUpload.ItemSizeText :class="styles.itemSizeText" />
                            </div>
                            <FileUpload.ItemDeleteTrigger :aria-label="`Remove ${file.name}`" :class="styles.itemDeleteTrigger">×</FileUpload.ItemDeleteTrigger>
                        </FileUpload.Item>
                    </FileUpload.ItemGroup>
                    <FileUpload.ItemGroup :class="styles.itemGroup">
                        <FileUpload.Item v-for="entry in rejectedFiles" :key="entry.file.name" :file="entry.file" :class="styles.item">
                            <div :class="styles.itemText">
                                <FileUpload.ItemName :class="styles.itemName" />
                                <span :class="styles.reasons">{{ explain(entry.reasons) }}</span>
                            </div>
                            <FileUpload.ItemDeleteTrigger :aria-label="`Dismiss ${entry.file.name}`" :class="styles.itemDeleteTrigger">×</FileUpload.ItemDeleteTrigger>
                        </FileUpload.Item>
                    </FileUpload.ItemGroup>
                </template>
            </FileUpload.Root>
            <Field.Description :class="styles.field.description">Up to 4 images or PDFs, 5 MB each.</Field.Description>
            <Field.Error match="valueMissing" :class="styles.field.error">Add at least one file.</Field.Error>
        </Field.Root>
        <button type="submit" :class="styles.submit">Send</button>
        <p role="status" :class="styles.status">{{ sent === null ? "" : `Sent: ${sent}` }}</p>
    </form>
</template>
