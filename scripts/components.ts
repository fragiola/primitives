// The components every framework package ships, one entry each (AGENTS.md rule 6, D8): the one
// list the entry plumbing follows. The React and Vue builds (tsdown.config.ts) take their entries
// from it, Angular has one ng-packagr secondary entry point per name (`packages/angular/<name>/`),
// and site/tests/entries.test.ts checks every manifest's `exports`, every root entry and the
// Angular folders against it. A new component is added here first, in alphabetical order (the
// order Biome sorts the root entries' re-exports in).
export const COMPONENTS = [
    "checkbox",
    "checkbox-group",
    "combobox",
    "dialog",
    "field",
    "menu",
    "popover",
    "select",
    "slider",
    "tabs",
    "tooltip",
] as const;

export type ComponentName = (typeof COMPONENTS)[number];

/**
 * The toolkit's mechanisms (`@fragiola/primitives/<mechanism>`), one folder and one entry each
 * (`packages/primitives/tests/guard.test.ts` checks the folders against them).
 */
export const MECHANISMS = [
    "collection",
    "date",
    "direction",
    "focus",
    "form",
    "hover",
    "id",
    "inert",
    "layers",
    "overlay",
    "pointer",
    "positioning",
    "presence",
    "range",
    "scroll-lock",
] as const;

export type MechanismName = (typeof MECHANISMS)[number];

/** The framework packages: `packages/<framework>`, `@fragiola/primitives-<framework>`. */
export const FRAMEWORKS = ["react", "vue", "angular"] as const;

export type FrameworkName = (typeof FRAMEWORKS)[number];

/** The `exports` of a tsdown-built package (the toolkit, React, Vue) for the given entries. */
export function tsdownExports(
    entries: readonly { name: string; source: string }[],
    withSource: boolean,
): Record<string, unknown> {
    const exports: Record<string, unknown> = {};
    for (const { name, source } of [
        { name: "index", source: "./src/index.ts" },
        ...entries,
    ]) {
        exports[name === "index" ? "." : `./${name}`] = {
            ...(withSource ? { "@fragiola/source": source } : {}),
            types: `./dist/${name}.d.ts`,
            import: `./dist/${name}.js`,
            default: `./dist/${name}.js`,
        };
    }
    exports["./package.json"] = "./package.json";
    return exports;
}
