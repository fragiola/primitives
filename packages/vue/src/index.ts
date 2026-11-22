// @fragiola/primitives-vue: the primitives written for Vue 3.5 (spec/, AGENTS.md). The root entry
// only re-exports the components' entries (`@fragiola/primitives-vue/<component>`), so importing
// from it tree-shakes to the same output as importing from the subpath. There is no `app.use()`
// plugin: an app imports the components it uses.

export * from "./components/calendar/index.ts";
export * from "./components/checkbox/index.ts";
export * from "./components/checkbox-group/index.ts";
export * from "./components/combobox/index.ts";
export * from "./components/date-picker/index.ts";
export * from "./components/date-range-picker/index.ts";
export * from "./components/dialog/index.ts";
export * from "./components/field/index.ts";
export * from "./components/menu/index.ts";
export * from "./components/popover/index.ts";
export * from "./components/range-calendar/index.ts";
export * from "./components/select/index.ts";
export * from "./components/slider/index.ts";
export * from "./components/tabs/index.ts";
export * from "./components/tooltip/index.ts";
