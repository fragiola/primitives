<script setup lang="ts">
import { Listbox } from "@fragiola/primitives-vue/listbox";
import { computed, ref } from "vue";
import { styles } from "./styles.ts";

const TOPPINGS = [
    { value: "cheese", label: "Cheese" },
    { value: "mushrooms", label: "Mushrooms" },
    { value: "olives", label: "Olives" },
    { value: "onions", label: "Onions" },
    { value: "peppers", label: "Peppers" },
    { value: "pineapple", label: "Pineapple" },
    { value: "spinach", label: "Spinach" },
];

// A transfer list: select toppings in one list (Space toggles, Shift with the arrows or a press
// selects a range, Ctrl+A selects them all) and move them to the other (spec/listbox.md).
const chosen = ref<string[]>(["cheese"]);
const toAdd = ref<string[]>([]);
const toRemove = ref<string[]>([]);
const available = computed(() =>
    TOPPINGS.filter((item) => !chosen.value.includes(item.value)),
);
const picked = computed(() =>
    TOPPINGS.filter((item) => chosen.value.includes(item.value)),
);
function add() {
    chosen.value = [...chosen.value, ...toAdd.value];
    toAdd.value = [];
}
function remove() {
    chosen.value = chosen.value.filter(
        (value) => !toRemove.value.includes(value),
    );
    toRemove.value = [];
}
</script>

<template>
    <div :class="styles.row">
        <div :class="styles.column">
            <span id="available" :class="styles.heading">Available</span>
            <Listbox.Root v-model:value="toAdd" aria-labelledby="available" multiple :class="styles.list">
                <Listbox.Item v-for="item in available" :key="item.value" :value="item.value" :class="styles.item">{{ item.label }}<Listbox.ItemIndicator :class="styles.itemIndicator">✓</Listbox.ItemIndicator></Listbox.Item>
            </Listbox.Root>
        </div>
        <div :class="styles.buttons">
            <button type="button" :class="styles.button" :disabled="toAdd.length === 0" @click="add">Add</button>
            <button type="button" :class="styles.button" :disabled="toRemove.length === 0" @click="remove">Remove</button>
        </div>
        <div :class="styles.column">
            <span id="chosen" :class="styles.heading">Chosen</span>
            <Listbox.Root v-model:value="toRemove" aria-labelledby="chosen" multiple name="toppings" :class="styles.list">
                <Listbox.Item v-for="item in picked" :key="item.value" :value="item.value" :class="styles.item">{{ item.label }}<Listbox.ItemIndicator :class="styles.itemIndicator">✓</Listbox.ItemIndicator></Listbox.Item>
            </Listbox.Root>
        </div>
    </div>
</template>
