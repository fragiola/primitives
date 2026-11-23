<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Label } from "../../kit/ui/label.ts";
import { NumberField } from "../../kit/ui/number-field.ts";

// spec/number-field.md, `/number-field/format` (`?locale=`, and `?dir=rtl`)
defineProps<{ locale?: string }>();
const EUR = { style: "currency", currency: "EUR" } as const;
const PERCENT = { style: "percent" } as const;
const price = ref<number | null>();
const discount = ref<number | null>();
const onPrice = (value: number | null) => {
    price.value = value;
};
const onDiscount = (value: number | null) => {
    discount.value = value;
};
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <div class="flex flex-col items-start gap-1">
            <Label for="price">Price</Label>
            <NumberField.Root
                id="price"
                :format="EUR"
                :default-value="1234.5"
                :step="0.5"
                :locale="locale"
                @value-change="onPrice"
            >
                <NumberField.Group>
                    <NumberField.Input />
                </NumberField.Group>
            </NumberField.Root>
        </div>
        <div class="flex flex-col items-start gap-1">
            <Label for="discount">Discount</Label>
            <NumberField.Root
                id="discount"
                :format="PERCENT"
                :default-value="0.25"
                :step="0.01"
                :min="0"
                :max="1"
                :locale="locale"
                @value-change="onDiscount"
            >
                <NumberField.Group>
                    <NumberField.Input />
                </NumberField.Group>
            </NumberField.Root>
        </div>
    </div>
    <Output
        :values="{
            price: price === null ? 'null' : price,
            discount: discount === null ? 'null' : discount,
        }"
    />
</template>
