<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/file-upload";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { FileUpload } from "../../kit/ui/file-upload.ts";
import { fileNames, rejections } from "./file-upload-output.ts";

// An avatar uploader (spec/file-upload.md, `/file-upload/single`).
const reason = ref<string>();
const onChange = (_value: unknown, details: ChangeDetails) => {
    reason.value = details.reason;
};
</script>

<template>
    <FileUpload.Root accept="image/*" @value-change="onChange" @file-reject="onChange">
        <template #default="{ value, rejectedFiles }">
            <FileUpload.Label>Avatar</FileUpload.Label>
            <FileUpload.Dropzone>Drop an image</FileUpload.Dropzone>
            <div class="flex items-center gap-2">
                <FileUpload.Trigger>Choose image</FileUpload.Trigger>
            </div>
            <FileUpload.HiddenInput />
            <FileUpload.ItemGroup>
                <FileUpload.Item v-for="file in value" :key="file.name" :file="file">
                    <FileUpload.ItemPreview>
                        <FileUpload.ItemPreviewImage alt="Avatar preview" />
                    </FileUpload.ItemPreview>
                    <FileUpload.ItemName />
                </FileUpload.Item>
            </FileUpload.ItemGroup>
            <Output :values="{ value: fileNames(value), rejected: rejections(rejectedFiles), reason }" />
        </template>
    </FileUpload.Root>
</template>
