<script setup lang="ts">
import type {
    ChangeDetails,
    FileUploadPickDetails,
} from "@fragiola/primitives-vue/file-upload";
import { ref, shallowRef } from "vue";
import Output from "../../kit/output.vue";
import { FileUpload } from "../../kit/ui/file-upload.ts";
import { fileNames, rejections } from "./file-upload-output.ts";

// The attachments uploader of `/file-upload/basic` and `/file-upload/disabled`
// (spec/file-upload.md); its output inside the Root, which holds the rejected list.
withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false });
const value = shallowRef<File[]>([]);
const reason = ref<string>();
const validate = (file: File) =>
    file.name.includes(" ") ? ["name-has-spaces"] : null;
const announcement = (details: FileUploadPickDetails) =>
    `${details.value.length} files, ${details.rejectedFiles.length} rejected`;
const onValueChange = (next: File[], details: ChangeDetails) => {
    value.value = next;
    reason.value = details.reason;
};
const onFileReject = (_rejected: unknown, details: ChangeDetails) => {
    reason.value = details.reason;
};
</script>

<template>
    <FileUpload.Root :max-files="3" accept="image/*,.pdf" :max-file-size="1_000_000" :min-file-size="1" :validate="validate" locale="en-US" :disabled="disabled" :value="value" :announcement="announcement" @value-change="onValueChange" @file-reject="onFileReject">
        <template #default="{ value: files, rejectedFiles }">
            <FileUpload.Label>Attachments</FileUpload.Label>
            <FileUpload.Dropzone>Drop files here</FileUpload.Dropzone>
            <div class="flex items-center gap-2">
                <FileUpload.Trigger>Choose files</FileUpload.Trigger>
                <FileUpload.ClearTrigger>Clear all</FileUpload.ClearTrigger>
            </div>
            <FileUpload.HiddenInput />
            <FileUpload.ItemGroup data-testid="accepted">
                <FileUpload.Item v-for="file in files" :key="file.name" :file="file">
                    <FileUpload.ItemPreview>
                        <FileUpload.ItemPreviewImage alt="" />
                    </FileUpload.ItemPreview>
                    <div class="flex min-w-0 flex-1 flex-col">
                        <FileUpload.ItemName />
                        <FileUpload.ItemSizeText />
                    </div>
                    <FileUpload.ItemDeleteTrigger :aria-label="`Remove ${file.name}`">×</FileUpload.ItemDeleteTrigger>
                </FileUpload.Item>
            </FileUpload.ItemGroup>
            <FileUpload.ItemGroup data-testid="rejected">
                <FileUpload.Item v-for="entry in rejectedFiles" :key="entry.file.name" :file="entry.file">
                    <div class="flex min-w-0 flex-1 flex-col">
                        <FileUpload.ItemName />
                        <span class="text-xs">{{ entry.reasons.join(", ") }}</span>
                    </div>
                    <FileUpload.ItemDeleteTrigger :aria-label="`Dismiss ${entry.file.name}`">×</FileUpload.ItemDeleteTrigger>
                </FileUpload.Item>
            </FileUpload.ItemGroup>
            <Output :values="{ value: fileNames(files), rejected: rejections(rejectedFiles), reason }" />
        </template>
    </FileUpload.Root>
</template>
