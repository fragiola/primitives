<script setup lang="ts">
import { link } from "examples-shared/recipes/link";
import { provide, ref } from "vue";
import Output from "../../kit/output.vue";
import { Link } from "../../kit/ui/link.ts";
import { NavigateKey, RouterLink } from "./router-link.ts";

// spec/link.md, `/link/router`
const route = ref("/");
provide(NavigateKey, (next: string) => {
    route.value = next;
});
</script>

<template>
    <div :class="link.list">
        <Link :as="RouterLink" to="/settings">Settings</Link>
        <Link :as="RouterLink" to="/billing" disabled>Billing</Link>
    </div>
    <Output :values="{ route }" />
</template>
