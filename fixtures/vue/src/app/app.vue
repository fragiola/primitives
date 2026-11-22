<script setup lang="ts">
import { readQuery } from "../kit/query.ts";
import { routes } from "./routes.ts";

// The fixture's page for `path` and `search` (spec/README.md, "Scenarios and fixtures"). It reads
// no `window`: the server renders it too (src/server/entry-server.ts).
const props = defineProps<{ path: string; search: string }>();
const query = readQuery(props.search);
const scenario = routes[props.path];
const paths = Object.keys(routes);
</script>

<template>
    <main v-if="scenario" class="p-6">
        <component :is="scenario" :locale="query.locale" />
    </main>
    <main v-else class="p-6">
        <h1 class="text-lg font-semibold">Vue fixture</h1>
        <ul>
            <li v-for="route in paths" :key="route">
                <a :href="route">{{ route }}</a>
            </li>
        </ul>
    </main>
</template>
