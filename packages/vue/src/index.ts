// @fragiola/primitives-vue: the primitives written for Vue 3.5 (spec/, AGENTS.md). The root entry
// only re-exports the components' entries (`@fragiola/primitives-vue/<component>`), so importing
// from it tree-shakes to the same output as importing from the subpath. There is no `app.use()`
// plugin: an app imports the components it uses.

export * from "./components/dialog/index.ts";
export * from "./components/tabs/index.ts";
