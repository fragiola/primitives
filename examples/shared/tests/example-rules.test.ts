import { describe, expect, it } from "vitest";
import { ALLOWED_IMPORTS, inlineClasses } from "../scripts/example-rules.ts";

// The rules each framework's tests/examples.test.ts runs (scripts/example-rules.ts), with planted
// breaks: a class string in markup is found in every framework's syntax.

describe("the example rules", () => {
    it("find a class string in React markup", () => {
        expect(inlineClasses('<div className="p-4" />', "react")).toHaveLength(
            1,
        );
        expect(
            inlineClasses("<div className={`p-$" + "{n}`} />", "react"),
        ).toHaveLength(1);
        expect(
            inlineClasses("<div className={styles.root} />", "react"),
        ).toEqual([]);
    });

    it("find a class string in Vue and Angular templates", () => {
        for (const framework of ["vue", "angular"] as const) {
            expect(
                inlineClasses('<div class="p-4"></div>', framework),
            ).toHaveLength(1);
            expect(
                inlineClasses(`<div :class="'p-4'"></div>`, framework),
            ).toHaveLength(1);
            expect(
                inlineClasses(`<div [class]="'p-4'"></div>`, framework),
            ).toHaveLength(1);
            expect(
                inlineClasses('<div :class="styles.root"></div>', framework),
            ).toEqual([]);
            expect(
                inlineClasses('<div [class]="styles.root"></div>', framework),
            ).toEqual([]);
        }
    });

    it("allow a component entry, never the root entry or an alias", () => {
        const allowed = (
            framework: "react" | "vue" | "angular",
            specifier: string,
        ) =>
            ALLOWED_IMPORTS[framework].some((pattern) =>
                pattern.test(specifier),
            );
        expect(allowed("react", "@fragiola/primitives-react/dialog")).toBe(
            true,
        );
        expect(allowed("react", "@fragiola/primitives-react")).toBe(false);
        expect(allowed("react", "@/components/dialog")).toBe(false);
        expect(allowed("vue", "@fragiola/primitives-react/dialog")).toBe(false);
        expect(allowed("angular", "@angular/core")).toBe(true);
        expect(allowed("angular", "@angular/forms")).toBe(false);
    });
});
