import { describe, expect, it } from "vitest";
import {
    acceptAttribute,
    acceptFiles,
    acceptsFile,
} from "../../src/file/accept-files.ts";

const png = { name: "photo.png", type: "image/png" };
const pdf = { name: "Scan.PDF", type: "application/pdf" };
const txt = { name: "notes.txt", type: "text/plain" };

describe("acceptsFile", () => {
    it("takes every file without accept", () => {
        expect(acceptsFile(txt, undefined)).toBe(true);
        expect(acceptsFile(txt, "")).toBe(true);
        expect(acceptsFile(txt, [])).toBe(true);
    });

    it("reads extensions, MIME types and wildcards, case insensitive", () => {
        expect(acceptsFile(png, "image/*")).toBe(true);
        expect(acceptsFile(pdf, "image/*, .pdf")).toBe(true);
        expect(acceptsFile(pdf, "application/PDF")).toBe(true);
        expect(acceptsFile(txt, ["image/*", ".pdf"])).toBe(false);
        expect(acceptsFile({ name: "x", type: "" }, "image/*")).toBe(false);
    });

    it("writes the attribute", () => {
        expect(acceptAttribute(["image/*", " .pdf "])).toBe("image/*,.pdf");
        expect(acceptAttribute(" , ")).toBeUndefined();
    });
});

describe("acceptFiles", () => {
    it("splits the accepted and the rejected, in order", () => {
        expect(acceptFiles([png, txt, pdf], "image/*,.pdf", true)).toEqual({
            accepted: [png, pdf],
            rejected: [txt],
        });
    });

    it("rejects several files when not multiple", () => {
        expect(acceptFiles([png, pdf], undefined, false)).toEqual({
            accepted: [],
            rejected: [png, pdf],
        });
        expect(acceptFiles([png], undefined, false).accepted).toEqual([png]);
    });
});
