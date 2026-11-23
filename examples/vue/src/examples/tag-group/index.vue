<script setup lang="ts">
import { TagGroup } from "@fragiola/primitives-vue/tag-group";
import { computed, ref } from "vue";
import { styles } from "./styles.ts";

const TOPICS = [
    { value: "design", label: "Design" },
    { value: "engineering", label: "Engineering" },
    { value: "research", label: "Research" },
    { value: "writing", label: "Writing" },
];

const ARTICLES = [
    { title: "Color systems that scale", topic: "design" },
    { title: "Profiling a slow render", topic: "engineering" },
    { title: "Interviewing fifty users", topic: "research" },
    { title: "Type for the screen", topic: "design" },
    { title: "A token pipeline", topic: "engineering" },
    { title: "Release notes people read", topic: "writing" },
];

// Filter tags: the topics are a TagGroup that selects several (spec/tag-group.md). Selected
// topics narrow the articles to theirs; with none selected, every topic's articles show. Removing
// a topic (Delete, Backspace, its remove button) drops it and its articles: the app owns the tags,
// so `remove` removes the entry, and the selection with it.
const topics = ref(TOPICS);
const selected = ref<string[]>([]);
const shown = computed(() =>
    ARTICLES.filter(
        (article) =>
            topics.value.some((topic) => topic.value === article.topic) &&
            (selected.value.length === 0 ||
                selected.value.includes(article.topic)),
    ),
);
const labelOf = (value: string) =>
    TOPICS.find((topic) => topic.value === value)?.label ?? value;
const onRemove = (value: string) => {
    topics.value = topics.value.filter((topic) => topic.value !== value);
    selected.value = selected.value.filter((each) => each !== value);
};
</script>

<template>
    <div :class="styles.stack">
        <TagGroup.Root v-model:value="selected" selection-mode="multiple" :class="styles.root" @remove="onRemove">
            <TagGroup.Label :class="styles.label">Topics</TagGroup.Label>
            <TagGroup.List :class="styles.list">
                <TagGroup.Tag v-for="topic in topics" :key="topic.value" :value="topic.value" :class="styles.tag">
                    <TagGroup.TagCell :class="styles.tagCell">{{ topic.label }}<TagGroup.RemoveButton :aria-label="`Remove ${topic.label}`" :class="styles.removeButton">×</TagGroup.RemoveButton></TagGroup.TagCell>
                </TagGroup.Tag>
            </TagGroup.List>
            <p v-if="topics.length === 0" :class="styles.empty">No topics left.</p>
        </TagGroup.Root>
        <ul aria-label="Articles" :class="styles.articles">
            <li v-for="article in shown" :key="article.title" :class="styles.article">{{ article.title }}<span :class="styles.topic">{{ labelOf(article.topic) }}</span></li>
        </ul>
        <p role="status" :class="styles.status">{{ `Showing ${shown.length} of ${ARTICLES.length} articles.` }}</p>
    </div>
</template>
