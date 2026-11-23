import { afterEach, describe, expect, it, vi } from "vitest";
import { watchDocumentLanguage } from "../../src/date/watch-document-language.ts";

// Epic #49 (#46): a calendar with no `locale` follows the document's `lang` after mount
describe("watchDocumentLanguage", () => {
    afterEach(() => {
        document.documentElement.removeAttribute("lang");
    });

    it("reports a change of the document element's lang until stopped", async () => {
        const change = vi.fn();
        const stop = watchDocumentLanguage(document, change);
        document.documentElement.lang = "fr-FR";
        await Promise.resolve();
        expect(change).toHaveBeenCalledOnce();
        document.documentElement.setAttribute("data-other", "");
        await Promise.resolve();
        expect(change).toHaveBeenCalledOnce();
        stop();
        document.documentElement.lang = "de-DE";
        await Promise.resolve();
        expect(change).toHaveBeenCalledOnce();
    });
});
