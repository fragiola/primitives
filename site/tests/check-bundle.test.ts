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
