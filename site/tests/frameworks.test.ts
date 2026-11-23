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
            "button",
            "calendar",
            "calendar-preset",
            "checkbox",
            "collapsible",
            "combobox",
            "combobox-virtual",
            "context-menu",
            "date-field",
            "date-picker",
            "date-picker-input",
            "date-range-field",
            "dialog",
            "drawer",
            "drawer-side-panel",
            "field",
            "fieldset",
            "form",
            "hover-card",
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
            "popover",
            "progress",
            "radio-group",
            "scroll-area",
            "select",
            "select-virtual",
            "separator",
            "slider",
            "switch",
            "tabs",
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
                expect(example.packages, framework).toEqual([
                    PRIMITIVES_PACKAGES[
                        framework as keyof typeof PRIMITIVES_PACKAGES
                    ],
                ]);
                expect(example.registry).toEqual([]);
            }
        }
    });
});
