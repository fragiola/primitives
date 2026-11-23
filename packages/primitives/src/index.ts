// @fragiola/primitives: the framework-free DOM toolkit (AGENTS.md rule 2). The root entry only
// re-exports the mechanisms' entries (`@fragiola/primitives/<mechanism>`), so importing from it
// tree-shakes to the same output as importing from the subpath (tests/tree-shaking.test.ts).

export * from "./async-list/index.ts";
export * from "./collection/index.ts";
export * from "./date/index.ts";
export * from "./direction/index.ts";
export * from "./focus/index.ts";
export * from "./form/index.ts";
export * from "./hover/index.ts";
export * from "./id/index.ts";
export * from "./image/index.ts";
export * from "./inert/index.ts";
export * from "./layers/index.ts";
export * from "./number/index.ts";
export * from "./overlay/index.ts";
export * from "./pointer/index.ts";
export * from "./positioning/index.ts";
export * from "./presence/index.ts";
export * from "./range/index.ts";
export * from "./scroll-lock/index.ts";
export * from "./selection/index.ts";
export * from "./swipe/index.ts";
export * from "./toast/index.ts";
export * from "./virtual/index.ts";
