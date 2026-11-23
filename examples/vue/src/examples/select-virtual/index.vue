<script setup lang="ts">
import { Select, SelectVirtual } from "@fragiola/primitives-vue/select-virtual";
import { styles } from "./styles.ts";

// 5 000 made-up countries, the same on every load: a start, a vowel and an ending ("Aldabria" …
// "Zanuzia"), in alphabetical order.
const STARTS =
    "Ald Bar Cor Dun Elm Fen Gal Har Isk Jor Kel Lor Mar Nor Orl Pel Qir Ros Sar Tel Ulm Val Wen Yar Zan";
const ENDINGS =
    "bria burg dale dor dova fell gal gard goria heim holm kesh land lia lis lor mark mere mont nar nesia nia nora pura quay ra ria rin ros sha sia stan thal tia tor va vel via wick zia";
const COUNTRIES = STARTS.split(" ")
    .flatMap((start) =>
        [..."aeiou"].flatMap((vowel) =>
            ENDINGS.split(" ").map((ending) => start + vowel + ending),
        ),
    )
    .sort()
    .map((name) => ({ value: name.toLowerCase(), label: name }));

// A country list of thousands: the list renders only the countries in view, yet the arrows, Home
// and End and the typeahead reach every one of them, and each option keeps its place in the set
// (spec/virtual-lists.md).
</script>

<template>
    <div :class="styles.stack">
        <label for="country" :class="styles.label">Country</label>
        <Select.Root :items="COUNTRIES" name="country">
            <Select.Trigger id="country" :class="styles.trigger"><Select.Value placeholder="Choose a country" :class="styles.value" /></Select.Trigger>
            <Select.Portal>
                <Select.Positioner :class="styles.positioner">
                    <Select.Popup :class="styles.popup">
                        <SelectVirtual.List v-slot="{ item: country }" :class="styles.list">
                            <Select.Item :value="country.value" :class="styles.item">{{ country.label }}<Select.ItemIndicator :class="styles.itemIndicator">✓</Select.ItemIndicator></Select.Item>
                        </SelectVirtual.List>
                    </Select.Popup>
                </Select.Positioner>
            </Select.Portal>
        </Select.Root>
    </div>
</template>
