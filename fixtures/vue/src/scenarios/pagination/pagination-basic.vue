<script setup lang="ts">
import { pagination } from "examples-shared/recipes/pagination";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Pagination } from "../../kit/ui/pagination.ts";

// spec/pagination.md, `/pagination/basic`
const page = ref(5);
const reason = ref<string>();
</script>

<template>
    <Pagination.Root
        aria-label="Results pages"
        :count="10"
        :page="page"
        @page-change="(next: number, details: { reason: string }) => { page = next; reason = details.reason; }"
    >
        <template #default="{ items }">
            <div :class="pagination.list">
                <Pagination.First aria-label="First page">«</Pagination.First>
                <Pagination.Previous aria-label="Previous page">‹</Pagination.Previous>
                <template v-for="item in items" :key="item.type === 'page' ? item.value : item.position">
                    <Pagination.Item v-if="item.type === 'page'" :value="item.value">{{ item.value }}</Pagination.Item>
                    <Pagination.Ellipsis v-else>…</Pagination.Ellipsis>
                </template>
                <Pagination.Next aria-label="Next page">›</Pagination.Next>
                <Pagination.Last aria-label="Last page">»</Pagination.Last>
            </div>
        </template>
    </Pagination.Root>
    <Output :values="{ page, reason }" />
</template>
