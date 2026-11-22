<script setup lang="ts">
import { Combobox } from "@fragiola/primitives-vue/combobox";
import { styles } from "./styles.ts";

interface Fruit {
    value: string;
    label: string;
}

const FRUITS: Fruit[] = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "blueberry", label: "Blueberry" },
    { value: "cherry", label: "Cherry" },
    { value: "grape", label: "Grape" },
    { value: "mango", label: "Mango" },
];

// Fruit tags: typing filters the list, Enter adds the highlighted fruit as a chip, Backspace in
// the empty input removes the last one, and Escape resets the text (spec/combobox.md, D10).
</script>

<template>
    <div :class="styles.stack">
        <label for="fruits" :class="styles.label">Fruits</label>
        <Combobox.Root multiple :items="FRUITS" :default-value="[FRUITS[0]]" name="fruits">
            <Combobox.Chips :class="styles.chips">
                <Combobox.Value v-slot="{ value }">
                    <Combobox.Chip v-for="fruit in (value as Fruit[])" :key="fruit.value" :class="styles.chip">{{ fruit.label }}<Combobox.ChipRemove :aria-label="`Remove ${fruit.label}`" :class="styles.chipRemove">×</Combobox.ChipRemove></Combobox.Chip>
                    <Combobox.Input id="fruits" :class="styles.input" />
                </Combobox.Value>
            </Combobox.Chips>
            <Combobox.Portal>
                <Combobox.Positioner :side-offset="4" :class="styles.positioner">
                    <Combobox.Popup :class="styles.popup">
                        <Combobox.Empty :class="styles.empty">No fruit found.</Combobox.Empty>
                        <Combobox.List v-slot="{ entry }" :class="styles.list">
                            <Combobox.Item :key="(entry as Fruit).value" :value="entry" :class="styles.item">{{ (entry as Fruit).label }}<Combobox.ItemIndicator :class="styles.itemIndicator">✓</Combobox.ItemIndicator></Combobox.Item>
                        </Combobox.List>
                    </Combobox.Popup>
                </Combobox.Positioner>
            </Combobox.Portal>
        </Combobox.Root>
    </div>
</template>
