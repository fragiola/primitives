// Adapted from Tree (fragiola/tree, site/tests/frameworks.test.ts), same author and licence.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
    examplesApp,
    listExampleIds,
} from "../../examples/shared/scripts/examples-lib.ts";
import {
    FRAMEWORKS,
    PRIMITIVES_PACKAGES,
    ROUTER_PACKAGES,
    TOOLKIT_PACKAGE,
} from "../../examples/shared/src/framework.ts";
import { FRAMEWORKS as PACKAGE_FRAMEWORKS } from "../../scripts/components.ts";
import {
    buildManifests,
    embedBuilds,
    frameworksOf,
    normalizeBase,
    readProject,
} from "../sources.ts";

// The export ships one embed per framework of project.json, each from its own app
// (examples/<framework>, package examples-<framework>), with the same examples in all three.

const ROOT = join(import.meta.dirname, "../..");
const manifestOf = (framework: string) =>
    JSON.parse(
        readFileSync(join(ROOT, "examples", framework, "package.json"), "utf8"),
    ) as {
        name: string;
        private?: boolean;
        scripts: Record<string, string>;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
    };

describe("the frameworks of project.json", () => {
    it("are the framework packages', in the same order; an unknown one throws", () => {
        expect(frameworksOf(readProject())).toEqual([...FRAMEWORKS]);
        expect([...FRAMEWORKS]).toEqual([...PACKAGE_FRAMEWORKS]);
        expect(() => frameworksOf({ frameworks: ["svelte"] })).toThrow(
            /svelte/,
        );
    });

    it("each have an examples app that builds, serves and tests its embed", () => {
        for (const framework of FRAMEWORKS) {
            const manifest = manifestOf(framework);
            expect(manifest.name).toBe(`examples-${framework}`);
            expect(manifest.private).toBe(true);
            for (const script of ["build", "dev", "typecheck", "e2e"]) {
                expect(
                    manifest.scripts[script],
                    `${framework} ${script}`,
                ).toBeTruthy();
            }
            expect(manifest.scripts.e2e).toBe("playwright test");
            expect(
                existsSync(
                    join(ROOT, "examples", framework, "playwright.config.ts"),
                ),
            ).toBe(true);
            expect(
                manifest.dependencies?.[PRIMITIVES_PACKAGES[framework]],
            ).toBe("workspace:*");
            // the calendar systems and time zones an example injects (Epic #82)
            expect(manifest.dependencies?.[TOOLKIT_PACKAGE]).toBe(
                "workspace:*",
            );
            // exact versions only
            for (const [name, version] of Object.entries({
                ...manifest.dependencies,
                ...manifest.devDependencies,
            })) {
                expect(version, `${framework}: ${name}`).toMatch(
                    /^(workspace:\*|\d+\.\d+\.\d+)$/,
                );
            }
            const index = readFileSync(
                join(ROOT, "examples", framework, "index.html"),
                "utf8",
            );
            expect(index).toContain('<meta name="robots" content="noindex" />');
            expect(index).toContain("data-embed-stage");
        }
    });

    it("pin the TypeScript their compiler supports", () => {
        expect(manifestOf("react").devDependencies?.typescript).toBe("7.0.2");
        expect(manifestOf("vue").devDependencies?.typescript).toBe("6.0.3");
        expect(manifestOf("angular").devDependencies?.typescript).toBe("6.0.3");
    });
});

/** The examples that import a toolkit entry themselves (a calendar system, a time zone, the color model). */
const TOOLKIT_EXAMPLES = [
    "calendar-system",
    "date-field-time-zone",
    "color-editor",
    "color-picker",
];

/** The examples that render their links through the framework's router: it is installed too. */
const ROUTER_EXAMPLES = ["link", "breadcrumbs"];

describe("the embeds", () => {
    it("are built under <base>/embed/<framework>/", () => {
        expect(normalizeBase("/primitives")).toBe("/primitives");
        expect(normalizeBase("primitives/")).toBe("/primitives");
        expect(normalizeBase("/")).toBe("");
        expect(
            embedBuilds(["react", "vue", "angular"], "/primitives", "/out"),
        ).toEqual(
            FRAMEWORKS.map((framework) => ({
                framework,
                package: `examples-${framework}`,
                base: `/primitives/embed/${framework}/`,
                dir: `/out/embed/${framework}`,
            })),
        );
    });

    it("show the same examples in every framework", async () => {
        const ids = FRAMEWORKS.map((framework) =>
            listExampleIds(examplesApp(framework)),
        );
        expect(ids[0]).toEqual([
            "accordion",
            "alert-dialog",
            "aspect-ratio",
            "autocomplete",
            "avatar",
            "breadcrumbs",
            "button",
            "calendar",
            "calendar-preset",
            "calendar-system",
            "carousel",
            "carousel-tabbed",
            "cascade-select",
            "checkbox",
            "clipboard",
            "collapsible",
            "color-editor",
            "color-picker",
            "combobox",
            "combobox-virtual",
            "command",
            "context-menu",
            "date-field",
            "date-field-time-zone",
            "date-picker",
            "date-picker-input",
            "date-range-field",
            "dialog",
            "drawer",
            "drawer-side-panel",
            "editable",
            "field",
            "fieldset",
            "file-upload",
            "file-upload-avatar",
            "form",
            "hover-card",
            "link",
            "listbox",
            "menu",
            "menu-view-options",
            "menubar",
            "meter",
            "month-picker",
            "multiple-calendar",
            "navigation-menu",
            "number-field",
            "otp-field",
            "pagination",
            "password-input",
            "popover",
            "progress",
            "radio-group",
            "rating",
            "scroll-area",
            "search-field",
            "segmented-control",
            "select",
            "select-virtual",
            "separator",
            "slider",
            "steps",
            "switch",
            "tabs",
            "tag-group",
            "tags-input",
            "time-field",
            "toast",
            "toast-promise",
            "toggle",
            "toggle-group",
            "toolbar",
            "tooltip",
            "year-range-picker",
        ]);
        for (const list of ids) expect(list).toEqual(ids[0]);
        const manifests = await buildManifests();
        expect([...manifests.keys()]).toEqual([...FRAMEWORKS]);
        for (const [framework, manifest] of manifests) {
            // by category (overlays, navigation, disclosure, forms, dates, then display), then by
            // order
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
                "command",
                "tabs",
                "navigation-menu",
                "pagination",
                "link",
                "breadcrumbs",
                "steps",
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
                "tag-group",
                "tags-input",
                "segmented-control",
                "rating",
                "password-input",
                "search-field",
                "editable",
                "color-editor",
                "color-picker",
                "cascade-select",
                "file-upload",
                "file-upload-avatar",
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
                "calendar-system",
                "date-field-time-zone",
                "progress",
                "meter",
                "avatar",
                "separator",
                "scroll-area",
                "aspect-ratio",
                "clipboard",
                "carousel",
                "carousel-tabbed",
            ]);
            for (const example of manifest.examples) {
                expect(example.packages, framework).toEqual([
                    PRIMITIVES_PACKAGES[
                        framework as keyof typeof PRIMITIVES_PACKAGES
                    ],
                    // an injected calendar system or time zone: the toolkit too
                    ...(TOOLKIT_EXAMPLES.includes(example.id)
                        ? [TOOLKIT_PACKAGE]
                        : []),
                    // links rendered through the router: the router too
                    ...(ROUTER_EXAMPLES.includes(example.id)
                        ? [
                              ROUTER_PACKAGES[
                                  framework as keyof typeof ROUTER_PACKAGES
                              ],
                          ]
                        : []),
                ]);
                expect(example.registry).toEqual([]);
            }
        }
    });
});
