<script setup lang="ts">
import { Link } from "@fragiola/primitives-vue/link";
import { computed, provide, reactive } from "vue";
import {
    createMemoryHistory,
    createRouter,
    type RouteLocationNormalizedLoaded,
    RouterLink,
    routeLocationKey,
    routerKey,
} from "vue-router";
import { styles } from "./styles.ts";

const PAGES = [
    { path: "/getting-started", title: "Getting started" },
    { path: "/guides", title: "Guides" },
    { path: "/api", title: "API reference" },
];

// The app's router: a memory router here, so the example keeps the page's own address. An app
// does `app.use(router)` in its main.ts; the example gives it to its own subtree instead, under
// vue-router's keys, as its `install` does.
const router = createRouter({
    history: createMemoryHistory(),
    routes: [...PAGES.map((page) => page.path), "/changelog"].map((path) => ({
        path,
        component: { render: () => null },
    })),
});
const current = router.currentRoute;
provide(routerKey, router);
provide(
    routeLocationKey,
    reactive(
        Object.fromEntries(
            Object.keys(current.value).map((key) => [
                key,
                computed(
                    () =>
                        current.value[
                            key as keyof RouteLocationNormalizedLoaded
                        ],
                ),
            ]),
        ),
    ) as unknown as RouteLocationNormalizedLoaded,
);
void router.push("/getting-started");

// A docs sidebar (spec/link.md): each Link renders the router's own link, which navigates; the
// Link adds the current page (`aria-current="page"`) and a disabled page that navigates nowhere.
const pathname = computed(() => current.value.path);
const page = computed(
    () => PAGES.find((entry) => entry.path === pathname.value) ?? PAGES[0],
);
</script>

<template>
    <div :class="styles.layout">
        <nav aria-label="Docs" :class="styles.nav">
            <ul :class="styles.links">
                <li v-for="entry in PAGES" :key="entry.path">
                    <Link :as="RouterLink" :to="entry.path" :current="entry.path === page?.path" :class="styles.root">{{ entry.title }}</Link>
                </li>
                <li>
                    <Link :as="RouterLink" to="/changelog" disabled :class="styles.root">Changelog</Link>
                </li>
            </ul>
        </nav>
        <div :class="styles.page">
            <h2 :class="styles.heading">{{ page?.title }}</h2>
            <p :class="styles.text">The router went to {{ pathname }}.</p>
        </div>
    </div>
</template>
