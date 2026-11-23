// The components every framework package ships, one entry each (AGENTS.md rule 6, D8): the one
// list the entry plumbing follows. The React and Vue builds (tsdown.config.ts) take their entries
// from it, Angular has one ng-packagr secondary entry point per name (`packages/angular/<name>/`),
// and site/tests/entries.test.ts checks every manifest's `exports`, every root entry and the
// Angular folders against it. A new component is added here first, in alphabetical order (the
// order Biome sorts the root entries' re-exports in).
export const COMPONENTS = [
    "accordion",
    "alert-dialog",
    "avatar",
    "button",
    "calendar",
    "checkbox",
    "checkbox-group",
    "collapsible",
    "combobox",
    "context-menu",
    "date-picker",
    "date-range-picker",
    "dialog",
    "drawer",
    "field",
    "fieldset",
    "form",
    "label",
    "listbox",
    "menu",
    "menubar",
    "meter",
    "navigation-menu",
    "number-field",
    "otp-field",
    "popover",
    "progress",
    "radio",
    "radio-group",
    "range-calendar",
    "select",
    "separator",
    "slider",
    "switch",
    "tabs",
    "toggle",
    "toggle-group",
    "toolbar",
    "tooltip",
] as const;

export type ComponentName = (typeof COMPONENTS)[number];

/**
 * The entries of every framework package that are no component (Epic #26): the global providers
 * and the utilities, each in its own entry (D8: a global provider such as the direction lives in
 * its own entry and references no component). React and Vue keep their sources in
 * `src/<name>/`, Angular in its secondary entry point `packages/angular/<name>/`. The bundle guard
 * reads each alone and fails when it holds any component's code.
 */
export const UTILITIES = ["direction", "render"] as const;

export type UtilityName = (typeof UTILITIES)[number];

/** Every entry of a framework package but its root, in the manifests' order. */
export const ENTRIES: readonly (ComponentName | UtilityName)[] = [
    ...COMPONENTS,
    ...UTILITIES,
];

/** An entry's source in the React and Vue packages, relative to the package. */
export function entrySource(name: ComponentName | UtilityName): string {
    return (UTILITIES as readonly string[]).includes(name)
        ? `src/${name}/index.ts`
        : `src/components/${name}/index.ts`;
}

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
    "image",
    "inert",
    "layers",
    "number",
    "overlay",
    "pointer",
    "positioning",
    "presence",
    "range",
    "scroll-lock",
    "selection",
    "swipe",
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
