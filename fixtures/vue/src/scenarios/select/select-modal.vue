<script setup lang="ts">
// spec/select.md, `/select/modal`: scroll lock and a blocked outside pointer while open.
import { ref } from "vue";
import Output from "../../kit/output.vue";
import FruitSelect from "./fruit-select.vue";

const value = ref<string | null>(null);
const open = ref(false);
const reason = ref<string>();
const outside = ref<string>();
const onValue = (next: string | null) => {
    value.value = next;
};
const onOpen = (next: boolean, why: string) => {
    open.value = next;
    reason.value = why;
};
</script>

<template>
    <div class="h-[200vh]">
        <div class="flex items-end gap-2">
            <div class="flex flex-col items-start gap-2">
                <label for="fruit" class="text-sm font-medium">Fruit</label>
                <FruitSelect id="fruit" modal @value-change="onValue" @open-change="onOpen" />
            </div>
            <button type="button" @click="outside = 'pressed'">Outside button</button>
        </div>
        <Output :values="{ value, open, reason, outside }" />
    </div>
</template>
