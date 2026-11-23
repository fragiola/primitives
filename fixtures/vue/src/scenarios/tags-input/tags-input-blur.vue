<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/tags-input";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { TagsInput } from "../../kit/ui/tags-input.ts";
import { printList } from "./print-list.ts";
import TagsInputTags from "./tags-input-tags.vue";

// The three `blurBehavior`s (spec/tags-input.md, `/tags-input/blur`).
const add = ref<string>();
const addReason = ref<string>();
const clear = ref<string>();
const onAdd = (next: string[], details: ChangeDetails) => {
    add.value = printList(next);
    addReason.value = details.reason;
};
const onClear = (next: string[]) => {
    clear.value = printList(next);
};
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <label for="add-on-blur" class="text-sm font-medium">Add on blur</label>
        <TagsInput.Root blur-behavior="add" @value-change="onAdd">
            <template #default="{ value: tags }">
                <TagsInput.Control>
                    <TagsInputTags :value="tags" />
                    <TagsInput.Input id="add-on-blur" />
                </TagsInput.Control>
            </template>
        </TagsInput.Root>
        <label for="clear-on-blur" class="text-sm font-medium">Clear on blur</label>
        <TagsInput.Root blur-behavior="clear" @value-change="onClear">
            <template #default="{ value: tags }">
                <TagsInput.Control>
                    <TagsInputTags :value="tags" />
                    <TagsInput.Input id="clear-on-blur" />
                </TagsInput.Control>
            </template>
        </TagsInput.Root>
        <label for="keep-on-blur" class="text-sm font-medium">Keep on blur</label>
        <TagsInput.Root>
            <template #default="{ value: tags }">
                <TagsInput.Control>
                    <TagsInputTags :value="tags" />
                    <TagsInput.Input id="keep-on-blur" />
                </TagsInput.Control>
            </template>
        </TagsInput.Root>
        <button type="button">After</button>
    </div>
    <Output :values="{ add, 'add-reason': addReason, clear }" />
</template>
