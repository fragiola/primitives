// The components every framework package ships, one entry each (AGENTS.md rule 6, D8): the one
// list the entry plumbing follows. The React and Vue builds (tsdown.config.ts) take their entries
// from it, Angular has one ng-packagr secondary entry point per name (`packages/angular/<name>/`),
// and site/tests/entries.test.ts checks every manifest's `exports`, every root entry and the
// Angular folders against it. A new component is added here first, in alphabetical order (the
// order Biome sorts the root entries' re-exports in).
export const COMPONENTS = [
    "accordion",
    "alert-dialog",
    "aspect-ratio",
    "autocomplete",
    "autocomplete-virtual",
    "avatar",
    "button",
    "calendar",
    "calendar-preset",
    "calendar-view",
    "checkbox",
    "checkbox-group",
    "collapsible",
    "combobox",
    "combobox-virtual",
    "context-menu",
    "date-field",
    "date-picker",
    "date-picker-input",
    "date-range-field",
    "date-range-picker",
    "date-range-picker-input",
    "dialog",
    "drawer",
    "field",
    "fieldset",
    "form",
    "hover-card",
    "label",
    "listbox",
    "listbox-virtual",
    "menu",
    "menubar",
    "meter",
    "month-calendar",
    "month-picker",
    "month-range-calendar",
    "month-range-picker",
    "multiple-calendar",
    "navigation-menu",
    "number-field",
    "otp-field",
    "pagination",
    "popover",
    "progress",
    "radio",
    "radio-group",
    "range-calendar",
    "rating",
    "scroll-area",
    "segmented-control",
    "select",
    "select-virtual",
    "separator",
    "slider",
    "switch",
    "tabs",
    "tag-group",
    "tags-input",
    "time-field",
    "time-range-field",
    "toast",
    "toggle",
    "toggle-group",
    "toolbar",
    "tooltip",
    "year-calendar",
    "year-picker",
    "year-range-calendar",
    "year-range-picker",
] as const;

export type ComponentName = (typeof COMPONENTS)[number];

/**
 * The entries of every framework package that are no component (Epic #26): the global providers
 * and the utilities, each in its own entry (D8: a global provider such as the direction lives in
 * its own entry and references no component). React and Vue keep their sources in
 * `src/<name>/`, Angular in its secondary entry point `packages/angular/<name>/`. The bundle guard
 * reads each alone and fails when it holds any component's code.
 */
export const UTILITIES = ["async-list", "direction", "render"] as const;

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
    "async-list",
    "calendar-systems",
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
    "month-year",
    "number",
    "overlay",
    "pagination",
    "pointer",
    "positioning",
    "presence",
    "range",
    "scroll-area",
    "scroll-lock",
    "segments",
    "selection",
    "swipe",
    "time",
    "time-zone",
    "toast",
    "virtual",
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
