<script setup lang="ts">
import { Steps } from "@fragiola/primitives-vue/steps";
import { ref } from "vue";
import { styles } from "./styles.ts";

const STEPS = ["Shipping", "Payment", "Review"];

// A linear checkout (spec/steps.md): Continue, and the steps after Shipping, wait until the
// shipping name is filled in (`isStepValid`); the last Continue reaches the completed state.
const name = ref("");
const isStepValid = (index: number) => index !== 0 || name.value.trim() !== "";
</script>

<template>
    <Steps.Root :count="STEPS.length" linear :is-step-valid="isStepValid" :class="styles.root">
        <Steps.List aria-label="Checkout" :class="styles.list">
            <Steps.Item v-for="(title, index) in STEPS" :key="title" :index="index" :class="styles.item">
                <Steps.Trigger :class="styles.trigger">
                    <Steps.Indicator :class="styles.indicator">{{ index + 1 }}</Steps.Indicator>{{ title }}
                </Steps.Trigger>
                <Steps.Separator v-if="index < STEPS.length - 1" :class="styles.separator" />
            </Steps.Item>
        </Steps.List>
        <Steps.Content :index="0" :class="styles.content">
            <label :class="styles.label">
                Full name
                <input v-model="name" autocomplete="name" :class="styles.input" />
            </label>
        </Steps.Content>
        <Steps.Content :index="1" :class="styles.content">
            <p :class="styles.text">Pay by card on delivery.</p>
        </Steps.Content>
        <Steps.Content :index="2" :class="styles.content">
            <p :class="styles.text">Ship to {{ name }}, pay on delivery.</p>
        </Steps.Content>
        <Steps.CompletedContent :class="styles.content">
            <p>Order placed</p>
        </Steps.CompletedContent>
        <div :class="styles.controls">
            <Steps.PrevTrigger :class="styles.control">Back</Steps.PrevTrigger>
            <Steps.NextTrigger :class="styles.control">Continue</Steps.NextTrigger>
        </div>
    </Steps.Root>
</template>
