<script setup lang="ts">
import { Select } from "@fragiola/primitives-vue/select";
import { styles } from "./styles.ts";

const FRUITS = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "blueberry", label: "Blueberry" },
    { value: "cherry", label: "Cherry" },
    { value: "grape", label: "Grape" },
    { value: "mango", label: "Mango" },
    { value: "orange", label: "Orange", disabled: true },
];

// A fruit picker: focus stays on the trigger while the list is open, typing on it opens the list
// on the matching fruit, Enter or Tab chooses, and a disabled fruit cannot be chosen
// (spec/select.md).
</script>

<template>
    <div :class="styles.stack">
        <label for="fruit" :class="styles.label">Fruit</label>
        <Select.Root :items="FRUITS" name="fruit">
            <Select.Trigger id="fruit" :class="styles.trigger"><Select.Value placeholder="Choose a fruit" :class="styles.value" /></Select.Trigger>
            <Select.Portal>
                <Select.Positioner :class="styles.positioner">
                    <Select.Popup :class="styles.popup">
                        <Select.List :class="styles.list">
                            <Select.Item v-for="fruit in FRUITS" :key="fruit.value" :value="fruit.value" :class="styles.item">{{ fruit.label }}<Select.ItemIndicator :class="styles.itemIndicator">✓</Select.ItemIndicator></Select.Item>
                        </Select.List>
                    </Select.Popup>
                </Select.Positioner>
            </Select.Portal>
        </Select.Root>
    </div>
</template>
