<script setup lang="ts">
import { Breadcrumbs } from "@fragiola/primitives-vue/breadcrumbs";
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

const TITLES: Record<string, string> = {
    "/": "Home",
    "/docs": "Docs",
    "/docs/components": "Components",
    "/docs/components/breadcrumbs": "Breadcrumbs",
};

/** The pages from the root to `pathname`: `/`, `/docs`, `/docs/components`, ... */
function trailOf(pathname: string): string[] {
    const segments = pathname.split("/").filter(Boolean);
    return [
        "/",
        ...segments.map(
            (_, index) => `/${segments.slice(0, index + 1).join("/")}`,
        ),
    ];
}

// The app's router: a memory router here, so the example keeps the page's own address. An app
// does `app.use(router)` in its main.ts; the example gives it to its own subtree instead, under
// vue-router's keys, as its `install` does.
const router = createRouter({
    history: createMemoryHistory(),
    routes: Object.keys(TITLES).map((path) => ({
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
void router.push("/docs/components/breadcrumbs");

// A trail built from the router's path (spec/breadcrumbs.md): each parent page a Link rendered
// through the router, the current page a Current; the slashes are hidden list items.
const pathname = computed(() => current.value.path);
const trail = computed(() => trailOf(pathname.value));
const children = computed(() =>
    Object.keys(TITLES).filter(
        (path) =>
            path !== pathname.value &&
            trailOf(path).length === trail.value.length + 1 &&
            path.startsWith(pathname.value),
    ),
);
</script>

<template>
    <div :class="styles.stack">
        <Breadcrumbs.Root aria-label="Breadcrumb" :class="styles.root">
            <Breadcrumbs.List :class="styles.list">
                <template v-for="(path, index) in trail" :key="path">
                    <Breadcrumbs.Separator v-if="index > 0" :class="styles.separator">/</Breadcrumbs.Separator>
                    <Breadcrumbs.Item :class="styles.item">
                        <Breadcrumbs.Current v-if="path === pathname" :class="styles.current">{{ TITLES[path] }}</Breadcrumbs.Current>
                        <Breadcrumbs.Link v-else :as="RouterLink" :to="path" :class="styles.link">{{ TITLES[path] }}</Breadcrumbs.Link>
                    </Breadcrumbs.Item>
                </template>
            </Breadcrumbs.List>
        </Breadcrumbs.Root>
        <h2 :class="styles.heading">{{ TITLES[pathname] }}</h2>
        <ul aria-label="Child pages" :class="styles.children">
            <li v-for="path in children" :key="path">
                <RouterLink :to="path" :class="styles.child">{{ TITLES[path] }}</RouterLink>
            </li>
        </ul>
    </div>
</template>
