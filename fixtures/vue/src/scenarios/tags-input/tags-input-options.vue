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

// `delimiter`, `max` and `validate` (spec/tags-input.md, `/tags-input/options`).
const value = ref<string>();
const reason = ref<string>();
const invalid = ref<string>();
const validate = (tag: string) => tag.includes("@");
const onValueChange = (next: string[], details: ChangeDetails) => {
    value.value = printList(next);
    reason.value = details.reason;
};
const onValueInvalid = (text: string, details: TagsInputInvalidDetails) => {
    invalid.value = `${details.cause} ${text}`;
};
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <label for="emails" class="text-sm font-medium">Emails</label>
        <TagsInput.Root delimiter=";" :max="3" :validate="validate" @value-change="onValueChange" @value-invalid="onValueInvalid">
            <template #default="{ value: tags }">
                <TagsInput.Control>
                    <TagsInputTags :value="tags" />
                    <TagsInput.Input id="emails" />
                </TagsInput.Control>
            </template>
        </TagsInput.Root>
    </div>
    <Output :values="{ value, reason, invalid }" />
</template>
