// Adapted from Tree (fragiola/tree, examples/shared/tests/meta.test.ts), same author and licence.
import { describe, expect, it } from "vitest";
import {
    existingApps,
    listExampleIds,
    listMetaIds,
    readMeta,
    validateMeta,
} from "../scripts/examples-lib.ts";
import { FRAMEWORKS } from "../src/framework.ts";
import { CATEGORIES } from "../src/meta-types.ts";

// Every example has one metadata file, shared by every framework, and every framework has every
// example: the same ids in React, Vue and Angular (one gallery entry each, contract §5.3).

describe("the examples' metadata", () => {
    it("exists for every example of every framework, and only for them", () => {
        const apps = existingApps();
        expect(apps.map((app) => app.framework)).toEqual([...FRAMEWORKS]);
        for (const app of apps) {
            expect(listExampleIds(app), app.framework).toEqual(listMetaIds());
        }
    });

    it("is valid, with a docs page, in a known category", async () => {
        for (const id of listMetaIds()) {
            const meta = await readMeta(id);
            expect(CATEGORIES).toContain(meta.category);
            expect(meta.docs, id).toMatch(/^\/docs\//);
            expect(meta.features.length, id).toBeGreaterThan(0);
            expect(meta.description.length, id).toBeGreaterThanOrEqual(50);
        }
    });

    it("rejects what is not an ExampleMeta", () => {
        expect(() => validateMeta("x", undefined)).toThrow(/no default export/);
        const base = {
            title: "X",
            description: "Y",
            category: "overlays",
            order: 1,
            features: [],
        };
        expect(() => validateMeta("x", { ...base, category: "nope" })).toThrow(
            /category must be one of overlays, navigation/,
        );
        expect(() => validateMeta("x", { ...base, layout: "grid" })).toThrow(
            /layout/,
        );
        expect(() => validateMeta("x", { ...base, height: 0 })).toThrow(
            /height/,
        );
        expect(validateMeta("x", base)).toEqual(base);
    });
});
