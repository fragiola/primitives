// Adapted from Tree (fragiola/tree, examples/shared/tests/manifest.test.ts), same author and
// licence.
import {
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
    collectFiles,
    examplesApp,
    fileOf,
    importsOf,
} from "../scripts/examples-lib.ts";
import { loadersSource } from "../scripts/generate.ts";
import { buildManifest } from "../scripts/manifest.ts";
import {
    ENTRY_FILES,
    FRAMEWORKS,
    PRIMITIVES_PACKAGES,
} from "../src/framework.ts";

// A framework's manifest (contract §5.3): every example with its files, entry first, its own
// files then the recipes it imports (shown as `_recipes/`), stored once, verbatim.

/** The recipes an example imports besides its own component's (the picker's calendar). */
const MORE_RECIPES: Record<string, readonly string[]> = {
    // built on Dialog's and Menu's recipes, as the components are on their parts
    "alert-dialog": ["_recipes/dialog.ts"],
    "context-menu": ["_recipes/menu.ts"],
    drawer: ["_recipes/dialog.ts"],
    "drawer-side-panel": ["_recipes/dialog.ts"],
    "navigation-menu": ["_recipes/popover.ts"],
    "date-picker": ["_recipes/calendar.ts", "_recipes/field.ts"],
    // the date and time fields' Field (TimeField's own recipe is DateField's)
    "date-field": ["_recipes/field.ts"],
    "time-field": ["_recipes/field.ts"],
    // the range's Field; the typed picker's segments, popup, calendar and Field (Epic #76)
    "date-range-field": ["_recipes/field.ts"],
    "date-picker-input": [
        "_recipes/calendar.ts",
        "_recipes/date-field.ts",
        "_recipes/field.ts",
    ],
    // the calendar variants (Epic #79): a preset's picker and calendar, a month or year
    // picker's popup, the calendar's root and buttons, its Field
    "calendar-preset": ["_recipes/date-picker.ts"],
    "month-picker": [
        "_recipes/calendar.ts",
        "_recipes/date-picker.ts",
        "_recipes/field.ts",
    ],
    "year-range-picker": ["_recipes/calendar.ts", "_recipes/date-picker.ts"],
    fieldset: ["_recipes/checkbox.ts", "_recipes/field.ts"],
    form: ["_recipes/field.ts"],
    // the toggles of a ToggleGroup, the ToggleGroups of a Toolbar, the menus of a Menubar
    "toggle-group": ["_recipes/toggle.ts"],
    toolbar: ["_recipes/toggle-group.ts", "_recipes/toggle.ts"],
    menubar: ["_recipes/menu.ts"],
    // the Label that names the field (Label has no example of its own: these show it)
    // the transfer list's move buttons
    listbox: ["_recipes/button.ts"],
    "number-field": ["_recipes/label.ts"],
    "otp-field": ["_recipes/label.ts"],
    "radio-group": [
        "_recipes/button.ts",
        "_recipes/field.ts",
        "_recipes/form.ts",
        "_recipes/switch.ts",
    ],
};

/** The examples that show a component under another id (a second Menu example). */
const RECIPE_OF: Record<string, string> = {
    "menu-view-options": "menu",
    "drawer-side-panel": "drawer",
    "toast-promise": "toast",
    // TimeField is built on DateField's parts: DateField's recipe styles it
    "time-field": "date-field",
    // DateRangeField's recipe is in DateField's file; the typed picker's in DatePicker's
    "date-range-field": "date-field",
    "date-picker-input": "date-picker",
    // a MultipleCalendar has the Calendar's parts, a preset's recipe is in the Calendar's file,
    // the month and year pickers' grids are the MonthCalendar's
    "multiple-calendar": "calendar",
    "calendar-preset": "calendar",
    "month-picker": "month-calendar",
    "year-range-picker": "month-calendar",
    // a virtual part is its component's part: its component's recipe styles it
    "select-virtual": "select",
    "combobox-virtual": "combobox",
};

/** The examples whose recipes need none of the recipes' shared pieces (no focusable part). */
const WITHOUT_SHARED: ReadonlySet<string> = new Set([
    "aspect-ratio",
    "avatar",
    "meter",
]);

describe("the manifest", () => {
    for (const framework of FRAMEWORKS) {
        it(`of ${framework} lists every example with the files it is made of`, async () => {
            const app = examplesApp(framework);
            const manifest = await buildManifest(app);
            expect(manifest.examples.map((example) => example.id)).toEqual([
                "dialog",
                "popover",
                "tooltip",
                "menu",
                "alert-dialog",
                "menu-view-options",
                "context-menu",
                "drawer",
                "drawer-side-panel",
                "menubar",
                "hover-card",
                "toast",
                "toast-promise",
                "tabs",
                "navigation-menu",
                "pagination",
                "collapsible",
                "accordion",
                "field",
                "checkbox",
                "slider",
                "select",
                "combobox",
                "autocomplete",
                "listbox",
                "select-virtual",
                "combobox-virtual",
                "fieldset",
                "form",
                "radio-group",
                "switch",
                "button",
                "toggle",
                "toggle-group",
                "toolbar",
                "number-field",
                "otp-field",
                "date-picker",
                "calendar",
                "date-field",
                "time-field",
                "date-range-field",
                "date-picker-input",
                "multiple-calendar",
                "calendar-preset",
                "month-picker",
                "year-range-picker",
                "progress",
                "meter",
                "avatar",
                "separator",
                "scroll-area",
                "aspect-ratio",
            ]);
            for (const example of manifest.examples) {
                const entry = ENTRY_FILES[framework];
                expect(example.files).toEqual([
                    `${example.id}/${entry}`,
                    `${example.id}/styles.ts`,
                    // its component's recipe and the recipes' shared files, in name order
                    ...[
                        `_recipes/${RECIPE_OF[example.id] ?? example.id}.ts`,
                        ...(MORE_RECIPES[example.id] ?? []),
                        "_recipes/recipe.ts",
                        ...(WITHOUT_SHARED.has(example.id)
                            ? []
                            : ["_recipes/shared.ts"]),
                    ].sort(),
                ]);
                expect(example.packages).toEqual([
                    PRIMITIVES_PACKAGES[framework],
                ]);
                expect(example.registry).toEqual([]);
                expect(example.layout).toBe("fill");
                expect(example.height).toBeGreaterThan(0);
                for (const file of example.files) {
                    expect(manifest.files[file]?.content).toBe(
                        readFileSync(fileOf(app, file), "utf-8"),
                    );
                }
            }
            // used by both examples: shared
            expect(manifest.files["_recipes/shared.ts"]?.shared).toBe(true);
            expect(manifest.files["dialog/styles.ts"]?.shared).toBeUndefined();
            expect(
                manifest.files[`dialog/${ENTRY_FILES[framework]}`]?.lang,
            ).toBe(ENTRY_FILES[framework].split(".").pop());
        });
    }

    it("refuses an import that leaves the examples, or does not resolve", () => {
        const root = mkdtempSync(join(tmpdir(), "examples-react-"));
        try {
            const app = examplesApp("react", root);
            mkdirSync(join(app.examplesDir, "leaves"), { recursive: true });
            mkdirSync(join(app.examplesDir, "broken"), { recursive: true });
            writeFileSync(join(app.src, "outside.ts"), "export const x = 1;\n");
            writeFileSync(
                join(app.examplesDir, "leaves", "index.tsx"),
                'import { x } from "../../outside.ts";\n',
            );
            writeFileSync(
                join(app.examplesDir, "broken", "index.tsx"),
                'import { y } from "./nope.ts";\n',
            );
            expect(() => collectFiles(app, "leaves")).toThrow(
                /leaves src\/examples/,
            );
            expect(() => collectFiles(app, "broken")).toThrow(
                /cannot resolve "\.\/nope\.ts"/,
            );
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it("reads static, re-exported and dynamic imports, not strings", () => {
        expect(
            importsOf(
                [
                    'import { a } from "./a.ts";',
                    'export { b } from "./b.ts";',
                    'import type { C } from "c";',
                    'const d = import("./d.ts");',
                    "const text = \"import x from 'nope'\";",
                ].join("\n"),
            ),
        ).toEqual(["./a.ts", "./b.ts", "c", "./d.ts"]);
    });
});

describe("the loaders", () => {
    it("import each example's entry lazily, with its layout", async () => {
        const source = loadersSource("vue", [
            {
                id: "dialog",
                files: [],
                meta: {
                    title: "t",
                    description: "d",
                    category: "overlays",
                    order: 1,
                    features: [],
                },
            },
        ]);
        expect(source).toContain('import type { Component } from "vue";');
        expect(source).toContain(
            'load: () => import("../examples/dialog/index.vue")',
        );
        expect(source).toContain('layout: "fill"');
    });
});
