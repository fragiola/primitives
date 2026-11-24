import { describe, expect, it } from "vitest";
import { checkFiles } from "../../src/file/check-files.ts";

const file = (name: string, size: number, type = "image/png") => ({
    name,
    size,
    type,
});

describe("checkFiles", () => {
    const rules = {
        accept: "image/*,.pdf",
        maxFiles: 3,
        minFileSize: 1,
        maxFileSize: 1_000_000,
        validate: (candidate: { name: string }) =>
            candidate.name.includes(" ") ? ["name-has-spaces"] : null,
    };

    it("gives every failing check as a reason", () => {
        const photo = file("photo.png", 1500);
        const notes = file("notes.txt", 10, "text/plain");
        const big = file("big.png", 2_000_000);
        const empty = file("my empty.txt", 0, "text/plain");
        expect(checkFiles([], [photo, notes, big, empty], rules)).toEqual({
            value: [photo],
            accepted: [photo],
            rejected: [
                { file: notes, reasons: ["invalid-type"] },
                { file: big, reasons: ["too-large"] },
                {
                    file: empty,
                    reasons: ["invalid-type", "too-small", "name-has-spaces"],
                },
            ],
        });
    });

    it("adds to the value up to maxFiles, the rest too-many", () => {
        const photo = file("photo.png", 1);
        const [a, b, c] = [
            file("a.pdf", 1),
            file("b.png", 1),
            file("c.png", 1),
        ];
        const result = checkFiles([photo], [a, b, c], rules);
        expect(result.value).toEqual([photo, a, b]);
        expect(result.rejected).toEqual([{ file: c, reasons: ["too-many"] }]);
    });

    it("replaces a single file, and rejects a pick of several", () => {
        const [a, b, c] = [
            file("a.png", 1),
            file("b.png", 1),
            file("c.png", 1),
        ];
        expect(checkFiles([a], [b], {}).value).toEqual([b]);
        const several = checkFiles([a], [b, c], {});
        expect(several.value).toEqual([a]);
        expect(several.rejected.map((entry) => entry.reasons)).toEqual([
            ["too-many"],
            ["too-many"],
        ]);
        expect(
            checkFiles([a], [file("x.txt", 1, "text/plain")], {
                accept: "image/*",
            }).value,
        ).toEqual([a]);
    });

    it("gives validate the files accepted so far", () => {
        const seen: number[] = [];
        checkFiles([file("a.png", 1)], [file("b.png", 1), file("c.png", 1)], {
            maxFiles: 5,
            validate: (_file, value) => {
                seen.push(value.length);
                return [];
            },
        });
        expect(seen).toEqual([1, 2]);
    });
});
