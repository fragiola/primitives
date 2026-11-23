<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/steps";
import { steps } from "examples-shared/recipes/steps";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Steps } from "../../kit/ui/steps.ts";

// spec/steps.md, `/steps/linear`
const STEPS = ["Account", "Profile", "Done"];
const accepted = ref(false);
const step = ref<number>();
const reason = ref<string>();
const isStepValid = (index: number) => index !== 0 || accepted.value;
const onStepChange = (next: number, details: ChangeDetails) => {
    step.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <Steps.Root :count="STEPS.length" linear :is-step-valid="isStepValid" @step-change="onStepChange">
        <Steps.List aria-label="Sign up">
            <Steps.Item v-for="(title, index) in STEPS" :key="title" :index="index">
                <Steps.Trigger><Steps.Indicator>{{ index + 1 }}</Steps.Indicator>{{ title }}</Steps.Trigger>
                <Steps.Separator v-if="index < STEPS.length - 1" />
            </Steps.Item>
        </Steps.List>
        <Steps.Content :index="0">
            <label class="inline-flex items-center gap-2"><input v-model="accepted" type="checkbox" />I accept the terms</label>
        </Steps.Content>
        <Steps.Content :index="1">Your profile</Steps.Content>
        <Steps.Content :index="2">All set</Steps.Content>
        <div :class="steps.controls">
            <Steps.PrevTrigger>Back</Steps.PrevTrigger>
            <Steps.NextTrigger>Next</Steps.NextTrigger>
        </div>
    </Steps.Root>
    <Output :values="{ step, reason }" />
</template>
