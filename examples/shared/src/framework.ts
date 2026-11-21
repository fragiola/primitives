// Adapted from Tree (fragiola/tree, examples/shared/src/framework.ts), same author and licence.
//
// The frameworks an examples app can be written in. Each one is an app of its own,
// `examples/<framework>` (package `examples-<framework>`), built for `<base>/embed/<framework>/`;
// what they share (the metadata, the themes, the recipes, the embed protocol, the overlay
// promotion, the manifest, the e2e specs) is this package. `site/project.json`'s `frameworks` says
// which ones the site export ships.

export const FRAMEWORKS = ["react", "vue", "angular"] as const;

export type Framework = (typeof FRAMEWORKS)[number];

/** The file an example's folder is found by, and the code panel opens first. */
export const ENTRY_FILES: Record<Framework, string> = {
    react: "index.tsx",
    vue: "index.vue",
    angular: "index.ts",
};

/** The package an example of that framework installs: the framework's primitives. */
export const PRIMITIVES_PACKAGES: Record<Framework, string> = {
    react: "@fragiola/primitives-react",
    vue: "@fragiola/primitives-vue",
    angular: "@fragiola/primitives-angular",
};

export function isFramework(value: unknown): value is Framework {
    return FRAMEWORKS.includes(value as Framework);
}
