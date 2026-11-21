import { describe, expect, it } from "vitest";
import {
    bundleLeaks,
    chainProblems,
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
