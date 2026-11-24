import { describe, expect, it } from "vitest";
import { formatFileSize } from "../../src/file/format-file-size.ts";

describe("formatFileSize", () => {
    it("writes decimal units in the locale", () => {
        expect(formatFileSize(512, "en-US")).toBe("512 byte");
        expect(formatFileSize(1500, "en-US")).toBe("1.5 kB");
        expect(formatFileSize(2_000_000, "en-US")).toBe("2 MB");
        expect(formatFileSize(3_210_000_000, "en-US")).toBe("3.2 GB");
        expect(formatFileSize(1500, "de-DE")).toBe("1,5 kB");
    });

    it("stops at terabytes", () => {
        expect(formatFileSize(5e15, "en-US")).toBe("5,000 TB");
    });
});
