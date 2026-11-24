<script setup lang="ts">
import {
    type CascadeItem,
    CascadeSelect,
} from "@fragiola/primitives-vue/cascade-select";
import { Field } from "@fragiola/primitives-vue/field";
import { ref } from "vue";
import { styles } from "./styles.ts";

const city = (label: string): CascadeItem => ({
    value: label.toLowerCase(),
    label,
});

const PLACES: readonly CascadeItem[] = [
    {
        value: "americas",
        label: "Americas",
        children: [
            {
                value: "brazil",
                label: "Brazil",
                children: [city("Recife"), city("Rio")],
            },
            {
                value: "canada",
                label: "Canada",
                children: [city("Ottawa"), city("Toronto")],
            },
        ],
    },
    {
        value: "asia",
        label: "Asia",
        children: [
            {
                value: "japan",
                label: "Japan",
                children: [city("Osaka"), city("Tokyo")],
            },
        ],
    },
    {
        value: "europe",
        label: "Europe",
        children: [
            {
                value: "france",
                label: "France",
                children: [city("Lyon"), city("Paris")],
            },
            {
                value: "portugal",
                label: "Portugal",
                children: [city("Lisbon"), city("Porto")],
            },
        ],
    },
];

const DEPTHS = [0, 1, 2];

const saved = ref<string | null>(null);
const onSubmit = (event: Event) => {
    const data = new FormData(event.currentTarget as HTMLFormElement);
    saved.value = String(data.get("city"));
};

// A city chosen through its region and country: one listbox per open level, Right, Enter or a
// hover opens the next one, Left goes back (mirrored in RTL), typing jumps within a level, and
// Enter on a city chooses it. The Field shows an error when nothing is chosen, and the form
// submits the path of values (spec/cascade-select.md).
</script>

<template>
    <form :class="styles.form" @submit.prevent="onSubmit">
        <Field.Root name="city" :class="styles.field.root">
            <Field.Label :class="styles.field.label">City</Field.Label>
            <CascadeSelect.Root :items="PLACES" required>
                <CascadeSelect.Trigger :class="styles.trigger">
                    <CascadeSelect.Value placeholder="Choose a city" separator=" / " :class="styles.value" />
                </CascadeSelect.Trigger>
                <CascadeSelect.Portal>
                    <CascadeSelect.Positioner :class="styles.positioner">
                        <CascadeSelect.Popup :class="styles.popup">
                            <CascadeSelect.Level v-for="depth in DEPTHS" :key="depth" :depth="depth" v-slot="{ items }" :class="styles.level">
                                <CascadeSelect.Item v-for="item in items" :key="item.value" :value="item.value" :class="styles.item">{{ item.label }}<CascadeSelect.ItemIndicator :class="styles.itemIndicator">✓</CascadeSelect.ItemIndicator></CascadeSelect.Item>
                            </CascadeSelect.Level>
                        </CascadeSelect.Popup>
                    </CascadeSelect.Positioner>
                </CascadeSelect.Portal>
            </CascadeSelect.Root>
            <Field.Description :class="styles.field.description">Region, country, then city.</Field.Description>
            <Field.Error match="valueMissing" :class="styles.field.error">Choose a city.</Field.Error>
        </Field.Root>
        <button type="submit" :class="styles.submit">Save</button>
        <p role="status" :class="styles.status">{{ saved === null ? "" : `Saved: ${saved}` }}</p>
    </form>
</template>
