<script setup lang="ts">
import { pagination } from "examples-shared/recipes/pagination";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Pagination } from "../../kit/ui/pagination.ts";

// spec/pagination.md, `/pagination/links`
const page = ref<number>();
</script>

<template>
    <Pagination.Root
        aria-label="Archive pages"
        :total="95"
        :page-size="10"
        :sibling-count="2"
        :boundary-count="0"
        @page-change="(next: number) => { page = next; }"
    >
        <template #default="{ items }">
            <div :class="pagination.list">
                <Pagination.Previous aria-label="Previous page" :native-button="false" as="a" href="#previous">‹</Pagination.Previous>
                <template v-for="item in items" :key="item.type === 'page' ? item.value : item.position">
                    <Pagination.Item v-if="item.type === 'page'" :value="item.value" :native-button="false" as="a" :href="`#page-${item.value}`">{{ item.value }}</Pagination.Item>
                    <Pagination.Ellipsis v-else>…</Pagination.Ellipsis>
                </template>
                <Pagination.Next aria-label="Next page" :native-button="false" as="a" href="#next">›</Pagination.Next>
            </div>
        </template>
    </Pagination.Root>
    <Output :values="{ page }" />
</template>
