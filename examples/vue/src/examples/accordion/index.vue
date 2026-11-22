<script setup lang="ts">
import { Accordion } from "@fragiola/primitives-vue/accordion";
import { styles } from "./styles.ts";

const QUESTIONS = [
    {
        value: "shipping",
        question: "How long does shipping take?",
        answer: "Orders ship within two business days and arrive in three to five.",
    },
    {
        value: "returns",
        question: "Can I return an item?",
        answer: "Returns are free for thirty days, in the original packaging.",
    },
    {
        value: "warranty",
        question: "Is there a warranty?",
        answer: "Every product has a two-year warranty against defects.",
    },
    {
        value: "support",
        question: "How do I reach support?",
        answer: "Write to the support team from your account page, any day.",
    },
];

// Frequently asked questions: one answer open at a time, the arrow keys, Home and End move between
// the questions, and the closed answers are hidden until found, so find-in-page opens the one that
// matches (spec/accordion.md).
</script>

<template>
    <Accordion.Root :default-value="['shipping']" :class="styles.root">
        <Accordion.Item
            v-for="item in QUESTIONS"
            :key="item.value"
            :value="item.value"
            :class="styles.item"
        >
            <Accordion.Header :class="styles.header">
                <Accordion.Trigger :class="styles.trigger">{{ item.question }}</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel hidden-until-found :class="styles.panel">
                <p :class="styles.text">{{ item.answer }}</p>
            </Accordion.Panel>
        </Accordion.Item>
    </Accordion.Root>
</template>
