<script setup lang="ts">
import { Pagination } from "@fragiola/primitives-vue/pagination";
import { computed, ref } from "vue";
import { styles } from "./styles.ts";

const PAGE_SIZE = 5;
const ORDERS = Array.from({ length: 42 }, (_, index) => ({
    id: 1001 + index,
    total: ((index * 37) % 90) + 10,
}));

// A results table shown five rows at a time, and its pager (spec/pagination.md): the app holds
// the page and renders that page's rows; the Pagination renders the range.
const page = ref(1);
const rows = computed(() =>
    ORDERS.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
);
</script>

<template>
    <div :class="styles.stack">
        <table :class="styles.table">
            <thead>
                <tr>
                    <th :class="styles.cell">Order</th>
                    <th :class="styles.number">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="order in rows" :key="order.id">
                    <td :class="styles.cell">#{{ order.id }}</td>
                    <td :class="styles.number">${{ order.total }}.00</td>
                </tr>
            </tbody>
        </table>
        <Pagination.Root
            v-model:page="page"
            aria-label="Orders pages"
            :total="ORDERS.length"
            :page-size="PAGE_SIZE"
            :class="styles.root"
        >
            <template #default="{ items }">
                <div :class="styles.list">
                    <Pagination.Previous aria-label="Previous page" :class="styles.control">‹</Pagination.Previous>
                    <template v-for="item in items" :key="item.type === 'page' ? item.value : item.position">
                        <Pagination.Item v-if="item.type === 'page'" :value="item.value" :class="styles.item">{{ item.value }}</Pagination.Item>
                        <Pagination.Ellipsis v-else :class="styles.ellipsis">…</Pagination.Ellipsis>
                    </template>
                    <Pagination.Next aria-label="Next page" :class="styles.control">›</Pagination.Next>
                </div>
            </template>
        </Pagination.Root>
    </div>
</template>
