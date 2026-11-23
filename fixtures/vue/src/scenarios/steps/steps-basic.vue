<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/steps";
import { steps } from "examples-shared/recipes/steps";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Steps } from "../../kit/ui/steps.ts";

// spec/steps.md, `/steps/basic`
const STEPS = [
    { title: "Shipping", content: "Shipping address" },
    { title: "Payment", content: "Payment method" },
    { title: "Review", content: "Review your order" },
];
const step = ref<number>();
const reason = ref<string>();
const onStepChange = (next: number, details: ChangeDetails) => {
    step.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <Steps.Root :count="STEPS.length" @step-change="onStepChange">
        <Steps.List aria-label="Checkout">
            <Steps.Item v-for="(item, index) in STEPS" :key="item.title" :index="index">
                <Steps.Trigger><Steps.Indicator>{{ index + 1 }}</Steps.Indicator>{{ item.title }}</Steps.Trigger>
                <Steps.Separator v-if="index < STEPS.length - 1" />
            </Steps.Item>
        </Steps.List>
        <Steps.Content v-for="(item, index) in STEPS" :key="item.title" :index="index">{{ item.content }}</Steps.Content>
        <Steps.CompletedContent>Order placed</Steps.CompletedContent>
        <div :class="steps.controls">
            <Steps.PrevTrigger>Back</Steps.PrevTrigger>
            <Steps.NextTrigger>Continue</Steps.NextTrigger>
        </div>
    </Steps.Root>
    <Output :values="{ step, reason }" />
</template>
