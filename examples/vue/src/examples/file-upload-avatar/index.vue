<script setup lang="ts">
import { FileUpload } from "@fragiola/primitives-vue/file-upload";
import { styles } from "./styles.ts";

// One profile photo: an image dropped on the round zone or picked in the dialog replaces the
// current one (a single file input's behaviour), its preview an object URL the primitive revokes
// when the photo is replaced or removed (spec/file-upload.md).
</script>

<template>
    <FileUpload.Root accept="image/*" :class="styles.root">
        <template #default="{ value }">
            <FileUpload.Label :class="styles.label">Profile photo</FileUpload.Label>
            <div :class="styles.row">
                <FileUpload.Dropzone :class="styles.dropzone">Drop a photo</FileUpload.Dropzone>
                <FileUpload.ItemGroup :class="styles.itemGroup">
                    <FileUpload.Item v-for="file in value" :key="file.name" :file="file" :class="styles.item">
                        <FileUpload.ItemPreview :class="styles.preview">
                            <FileUpload.ItemPreviewImage alt="Profile photo preview" :class="styles.image" />
                        </FileUpload.ItemPreview>
                        <FileUpload.ItemDeleteTrigger :class="styles.itemDeleteTrigger">Remove photo</FileUpload.ItemDeleteTrigger>
                    </FileUpload.Item>
                </FileUpload.ItemGroup>
            </div>
            <FileUpload.Trigger :class="styles.trigger">Choose photo</FileUpload.Trigger>
            <FileUpload.HiddenInput />
        </template>
    </FileUpload.Root>
</template>
