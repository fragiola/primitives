<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/file-upload";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { FileUpload } from "../../kit/ui/file-upload.ts";
import { fileNames } from "./file-upload-output.ts";

// A required FileUpload in a Field of a native form (spec/file-upload.md, `/file-upload/form`).
const submitted = ref<string>();
const value = ref<string>();
const reason = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    const files = new FormData(event.currentTarget as HTMLFormElement)
        .getAll("attachments")
        .filter((entry): entry is File => entry instanceof File)
        .map((file) => `${file.name}:${file.size}`);
    submitted.value = files.length === 0 ? "none" : files.join(", ");
};
const onValueChange = (next: File[], details: ChangeDetails) => {
    value.value = fileNames(next);
    reason.value = details.reason;
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Field.Root name="attachments">
            <Field.Label>Documents</Field.Label>
            <FileUpload.Root :max-files="5" required @value-change="onValueChange">
                <template #default="{ value: files }">
                    <FileUpload.Dropzone>Drop documents</FileUpload.Dropzone>
                    <div class="flex items-center gap-2">
                        <FileUpload.Trigger>Choose documents</FileUpload.Trigger>
                    </div>
                    <FileUpload.HiddenInput />
                    <FileUpload.ItemGroup>
                        <FileUpload.Item v-for="file in files" :key="file.name" :file="file">
                            <FileUpload.ItemName />
                            <FileUpload.ItemDeleteTrigger :aria-label="`Remove ${file.name}`">×</FileUpload.ItemDeleteTrigger>
                        </FileUpload.Item>
                    </FileUpload.ItemGroup>
                </template>
            </FileUpload.Root>
            <Field.Error match="valueMissing">Add at least one document</Field.Error>
        </Field.Root>
        <div class="flex gap-2">
            <button type="submit">Send</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ submitted, value, reason }" />
</template>
