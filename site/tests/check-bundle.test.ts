import { describe, expect, it } from "vitest";
import {
    bundleLeaks,
    chainProblems,
    ENTRY_DEPENDENCIES,
    entryLeaks,
    GUARD,
    type GuardRules,
    ownerOf,
} from "../../scripts/check-bundle.ts";
import { MECHANISMS } from "../../scripts/components.ts";

// `pnpm build` runs scripts/check-bundle.ts on each framework's guard app (Dialog and Tabs). These
// pin the check itself on planted bundles: what a planted import would add to the source map.

const COMPONENTS = ["dialog", "tabs", "menu", "calendar"];

const rules = (framework: GuardRules["framework"]): GuardRules => ({
    framework,
    components: COMPONENTS,
    imported: GUARD.components,
    mechanisms: MECHANISMS,
    allowed: GUARD.mechanisms,
});

/** The sources of a clean React guard bundle. */
const CLEAN = [
    "packages/react/src/components/dialog/dialog-popup.tsx",
    "packages/react/src/components/tabs/tabs-list.tsx",
    "packages/react/src/utils/render-element.tsx",
    "packages/react/src/hooks/use-presence.ts",
    "packages/primitives/src/overlay/overlay-session.ts",
    "packages/primitives/src/layers/layer-stack.ts",
    "packages/primitives/src/collection/key-maps.ts",
    "node_modules/.pnpm/react-dom@19.3.1/node_modules/react-dom/cjs/react-dom.production.js",
    "fixtures/react/guard/main.tsx",
];
const CLEAN_CODE = 'a="dialog-popup",b="tabs-tab"';

describe("the bundle guard", () => {
    it("passes a bundle of Dialog, Tabs and the mechanisms they use", () => {
        expect(bundleLeaks(CLEAN, CLEAN_CODE, rules("react"))).toEqual([]);
    });

    it("fails a planted component: its folder in the source map", () => {
        expect(
            bundleLeaks(
                [...CLEAN, "packages/react/src/components/menu/menu-item.tsx"],
                CLEAN_CODE,
                rules("react"),
            ),
        ).toEqual([
            'the component "menu": packages/react/src/components/menu/menu-item.tsx',
        ]);
    });

    it("fails a planted component in Angular: its entry point's folder", () => {
        const angular = [
            "packages/angular/dialog/directives/dialog-popup.directive.ts",
            "packages/angular/internal/utils/presence.ts",
            "packages/angular/calendar/directives/calendar-cell.directive.ts",
        ];
        expect(bundleLeaks(angular, CLEAN_CODE, rules("angular"))).toEqual([
            'the component "calendar": packages/angular/calendar/directives/calendar-cell.directive.ts',
        ]);
    });

    it("fails a planted component by its part attribute values, whatever the map says", () => {
        expect(
            bundleLeaks(CLEAN, `${CLEAN_CODE},c="menu-item"`, rules("react")),
        ).toEqual(['the component "menu": its part attribute values']);
    });

    it("fails an unused toolkit mechanism (the calendar's dates, the slider's range)", () => {
        expect(
            bundleLeaks(
                [
                    ...CLEAN,
                    "packages/primitives/src/date/date-math.ts",
                    "packages/primitives/src/range/range-math.ts",
                ],
                CLEAN_CODE,
                rules("react"),
            ),
        ).toEqual([
            'the unused toolkit mechanism "date": packages/primitives/src/date/date-math.ts',
            'the unused toolkit mechanism "range": packages/primitives/src/range/range-math.ts',
        ]);
    });

    it("fails the date family in a Dialog and Tabs app: every entry, the toolkit's dates", () => {
        // the four entries share the calendar's and the date picker's modules: a planted import of
        // any of them brings those folders and `/date` (spec/calendar.md, "Anatomy")
        const family = {
            ...rules("vue"),
            components: [
                ...COMPONENTS,
                "range-calendar",
                "date-picker",
                "date-range-picker",
            ],
        };
        expect(
            bundleLeaks(
                [
                    "packages/vue/src/components/dialog/dialog-popup.ts",
                    "packages/vue/src/components/range-calendar/range-calendar-root.ts",
                    "packages/vue/src/components/calendar/calendar-cell.ts",
                    "packages/vue/src/components/date-picker/date-picker-popup.ts",
                    "packages/primitives/src/date/month-grid.ts",
                    "packages/primitives/src/overlay/overlay-session.ts",
                ],
                CLEAN_CODE,
                family,
            ),
        ).toEqual([
            'the component "calendar": packages/vue/src/components/calendar/calendar-cell.ts',
            'the component "date-picker": packages/vue/src/components/date-picker/date-picker-popup.ts',
            'the component "range-calendar": packages/vue/src/components/range-calendar/range-calendar-root.ts',
            'the unused toolkit mechanism "date": packages/primitives/src/date/month-grid.ts',
        ]);
    });

    it("fails another framework's package", () => {
        expect(
            bundleLeaks(
                [...CLEAN, "packages/vue/src/utils/render-part.ts"],
                CLEAN_CODE,
                rules("react"),
            ),
        ).toEqual([
            "another framework's package: packages/vue/src/utils/render-part.ts",
        ]);
    });

    it("reads a source's owner from its folder, never its name", () => {
        expect(ownerOf("packages/react/src/utils/menu-helpers.ts")).toEqual({
            kind: "package",
            name: "react",
        });
        expect(ownerOf("packages/angular/internal/utils/portal.ts")).toEqual({
            kind: "package",
            name: "angular",
        });
        expect(ownerOf("node_modules/x/packages/core/src/a.ts")).toBeNull();
    });

    it("fails a bundle it cannot read: source maps that stop at built files", () => {
        expect(chainProblems(CLEAN)).toEqual([]);
        expect(
            chainProblems([
                "packages/react/src/components/dialog/dialog-popup.tsx",
                "packages/primitives/dist/overlay.js",
            ]),
        ).toEqual([
            "the source map stops at built files (packages/primitives/dist/overlay.js): their source maps are not chained",
            "the source map names no toolkit mechanism source",
        ]);
        expect(chainProblems(["fixtures/react/guard/main.tsx"])).toEqual([
            "the source map names no component source",
            "the source map names no toolkit mechanism source",
        ]);
    });
});

// Epic #22 (#21): the two-component app cannot see Dialog's code inside Tabs, since both are
// imported; each entry is also read alone.
describe("the bundle guard, entry by entry", () => {
    const SOURCES = {
        react: {
            dialog: "packages/react/src/components/dialog/dialog-popup.tsx",
            tabs: "packages/react/src/components/tabs/tabs-list.tsx",
        },
        vue: {
            dialog: "packages/vue/src/components/dialog/dialog-popup.ts",
            tabs: "packages/vue/src/components/tabs/tabs-list.ts",
        },
        angular: {
            dialog: "packages/angular/dialog/directives/dialog-popup.directive.ts",
            tabs: "packages/angular/tabs/directives/tabs-list.directive.ts",
        },
    } as const;

    for (const framework of ["react", "vue", "angular"] as const) {
        it(`fails Tabs code planted inside Dialog's entry (${framework})`, () => {
            const { dialog, tabs } = SOURCES[framework];
            expect(entryLeaks(framework, "dialog", [dialog], [])).toEqual([]);
            expect(entryLeaks(framework, "dialog", [dialog, tabs], [])).toEqual(
                [`/dialog: the component "tabs": ${tabs}`],
            );
            // the other way round too
            expect(entryLeaks(framework, "tabs", [tabs, dialog], [])).toEqual([
                `/tabs: the component "dialog": ${dialog}`,
            ]);
        });
    }

    it("fails an entry importing another component's entry (Angular's secondary entries)", () => {
        const { dialog } = SOURCES.angular;
        expect(entryLeaks("angular", "dialog", [dialog], ["internal"])).toEqual(
            [],
        );
        expect(
            entryLeaks("angular", "dialog", [dialog], ["internal", "tabs"]),
        ).toEqual(['/dialog: imports the component entry "/tabs"']);
    });

    it("accepts the components an entry is built on, and only those", () => {
        expect(ENTRY_DEPENDENCIES.checkbox).toEqual([
            "checkbox-group",
            "field",
        ]);
        // Epic #29: a Radio on its group's context, the new form controls on Field, and the
        // components that are no form control on nothing
        expect(ENTRY_DEPENDENCIES.radio).toEqual(["radio-group", "field"]);
        expect(ENTRY_DEPENDENCIES["radio-group"]).toEqual(["field"]);
        expect(ENTRY_DEPENDENCIES.switch).toEqual(["field"]);
        // Epic #35: AlertDialog on Dialog's parts, ContextMenu on Menu's; neither base on them
        expect(ENTRY_DEPENDENCIES["alert-dialog"]).toEqual(["dialog"]);
        expect(ENTRY_DEPENDENCIES["context-menu"]).toEqual(["menu"]);
        expect(ENTRY_DEPENDENCIES.dialog).toBeUndefined();
        expect(ENTRY_DEPENDENCIES.menu).toBeUndefined();
        // Epic #49: a ToggleGroup on its Toggles' entry (the group's context is the Toggle's);
        // a Toggle on nothing, and a Toolbar on neither (spec/toolbar.md, "Nested composites")
        expect(ENTRY_DEPENDENCIES["toggle-group"]).toEqual(["toggle"]);
        expect(ENTRY_DEPENDENCIES.toggle).toBeUndefined();
        expect(ENTRY_DEPENDENCIES.toolbar).toBeUndefined();
        // Epic #32: Collapsible and Accordion share the panel's mechanics through each framework's
        // hooks and the toolkit, not through each other's code
        for (const name of [
            "accordion",
            "collapsible",
            "avatar",
            "button",
            "progress",
            "separator",
        ] as const) {
            expect(ENTRY_DEPENDENCIES[name]).toBeUndefined();
        }
        expect(
            entryLeaks(
                "react",
                "checkbox",
                [
                    "packages/react/src/components/checkbox/checkbox-root.tsx",
                    "packages/react/src/components/field/field-context.ts",
                    "packages/react/src/components/checkbox-group/checkbox-group-context.ts",
                ],
                [],
            ),
        ).toEqual([]);
        expect(
            entryLeaks(
                "react",
                "select",
                [
                    "packages/react/src/components/select/select-root.tsx",
                    "packages/react/src/components/checkbox/checkbox-root.tsx",
                ],
                [],
            ),
        ).toEqual([
            '/select: the component "checkbox": packages/react/src/components/checkbox/checkbox-root.tsx',
        ]);
        // a Toolbar that held ToggleGroup's code, or a Toggle the group's, leaks
        expect(
            entryLeaks(
                "react",
                "toolbar",
                [
                    "packages/react/src/components/toolbar/toolbar-root.tsx",
                    "packages/react/src/hooks/use-roving-composite.ts",
                    "packages/react/src/components/toggle-group/toggle-group.tsx",
                ],
                [],
            ),
        ).toEqual([
            '/toolbar: the component "toggle-group": packages/react/src/components/toggle-group/toggle-group.tsx',
        ]);
        expect(
            entryLeaks(
                "vue",
                "toggle",
                [
                    "packages/vue/src/components/toggle/toggle.ts",
                    "packages/vue/src/components/toggle-group/toggle-group.ts",
                ],
                [],
            ),
        ).toEqual([
            '/toggle: the component "toggle-group": packages/vue/src/components/toggle-group/toggle-group.ts',
        ]);
    });

    it("fails another framework's code inside an entry", () => {
        expect(
            entryLeaks(
                "vue",
                "dialog",
                [
                    SOURCES.vue.dialog,
                    "packages/react/src/components/dialog/dialog-popup.tsx",
                ],
                [],
            ),
        ).toEqual([
            "/dialog: another framework's package: packages/react/src/components/dialog/dialog-popup.tsx",
        ]);
    });
});

// Epic #26 (#25): a global provider references no component (D8). The utility entries are read
// alone and may hold no component's code at all; a component may read a provider's context.
describe("the bundle guard, utility entries", () => {
    it("knows the utilities' sources in every framework", () => {
        expect(
            ownerOf("packages/react/src/direction/direction-provider.tsx"),
        ).toEqual({ kind: "utility", framework: "react", name: "direction" });
        expect(ownerOf("packages/vue/src/render/index.ts")).toEqual({
            kind: "utility",
            framework: "vue",
            name: "render",
        });
        expect(
            ownerOf(
                "packages/angular/direction/directives/direction-provider.directive.ts",
            ),
        ).toEqual({ kind: "utility", framework: "angular", name: "direction" });
        // a component's folder stays a component
        expect(
            ownerOf("packages/react/src/components/tabs/tabs-list.tsx"),
        ).toEqual({ kind: "component", framework: "react", name: "tabs" });
    });

    it("fails a component's code inside the direction entry", () => {
        const provider = "packages/react/src/direction/direction-provider.tsx";
        expect(entryLeaks("react", "direction", [provider], [], {})).toEqual(
            [],
        );
        expect(
            entryLeaks(
                "react",
                "direction",
                [provider, "packages/react/src/components/tabs/tabs-list.tsx"],
                [],
                {},
            ),
        ).toEqual([
            '/direction: the component "tabs": packages/react/src/components/tabs/tabs-list.tsx',
        ]);
        expect(
            entryLeaks("angular", "direction", [], ["internal", "tabs"], {}),
        ).toEqual(['/direction: imports the component entry "/tabs"']);
    });

    it("lets a component read a provider's context", () => {
        expect(
            entryLeaks(
                "react",
                "tabs",
                [
                    "packages/react/src/components/tabs/tabs-list.tsx",
                    "packages/react/src/direction/direction-context.ts",
                ],
                [],
            ),
        ).toEqual([]);
    });
});
