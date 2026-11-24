import { describe, expect, it } from "vitest";
import { fieldFiles } from "../../src/file/field-files.ts";

describe("fieldFiles", () => {
    it("is the files, written as their names, sizes, types and dates", () => {
        const a = new File(["ab"], "a.png", {
            type: "image/png",
            lastModified: 1,
        });
        const b = new File(["ab"], "b.png", {
            type: "image/png",
            lastModified: 1,
        });
        const files = fieldFiles([a]);
        expect(files).toEqual([a]);
        expect(files[0]).toBe(a);
        expect(Object.keys(files)).toEqual(["0"]);
        expect(JSON.stringify(files)).toBe('["a.png:2:image/png:1"]');
        expect(JSON.stringify(fieldFiles([b]))).not.toBe(JSON.stringify(files));
    });
});
