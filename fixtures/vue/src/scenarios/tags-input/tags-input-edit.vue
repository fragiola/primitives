<script setup lang="ts">
import type {
    ChangeDetails,
    TagsInputInvalidDetails,
} from "@fragiola/primitives-vue/tags-input";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { TagsInput } from "../../kit/ui/tags-input.ts";
import { printList } from "./print-list.ts";
import TagsInputTags from "./tags-input-tags.vue";

// Tags edited in place (spec/tags-input.md, `/tags-input/edit`).
const value = ref<string>();
const reason = ref<string>();
const invalid = ref<string>();
const onValueChange = (next: string[], details: ChangeDetails) => {
    value.value = printList(next);
    reason.value = details.reason;
};
const onValueInvalid = (_: string, details: TagsInputInvalidDetails) => {
    invalid.value = details.cause;
};
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <label for="edit-tags" class="text-sm font-medium">Tags</label>
        <TagsInput.Root editable :default-value="['one', 'two', 'three']" @value-change="onValueChange" @value-invalid="onValueInvalid">
            <template #default="{ value: tags }">
                <TagsInput.Control>
                    <TagsInputTags :value="tags" editable />
                    <TagsInput.Input id="edit-tags" />
                </TagsInput.Control>
            </template>
        </TagsInput.Root>
        <button type="button">After</button>
    </div>
    <Output :values="{ value, reason, invalid }" />
</template>
