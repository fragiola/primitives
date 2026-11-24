import { expect, test } from "@playwright/test";
import { part } from "../../src/contract.ts";
import { dropFiles } from "../../src/files.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("file-upload / basic: empty, and with accepted and rejected Items", async ({
    page,
}) => {
    await openScenario(page, "/file-upload/basic");
    await expectScreen(page, "file-upload-basic");
    await dropFiles(part(page, "file-upload", "dropzone"), [
        { name: "photo.png", size: 1500 },
        { name: "report.pdf", size: 250_000 },
        { name: "notes.txt", size: 10 },
    ]);
    await expectOutput(page, "value", "photo.png, report.pdf");
    const image = part(page, "file-upload", "item-preview-image");
    await expect
        .poll(() =>
            image.evaluate(
                (element) => (element as HTMLImageElement).naturalWidth,
            ),
        )
        .toBe(2);
    await expectScreen(page, "file-upload-basic-files");
});

test("file-upload / single: an avatar", async ({ page }) => {
    await openScenario(page, "/file-upload/single");
    await dropFiles(part(page, "file-upload", "dropzone"), [{ name: "a.png" }]);
    const image = page.getByRole("img", { name: "Avatar preview" });
    await expect
        .poll(() =>
            image.evaluate(
                (element) => (element as HTMLImageElement).naturalWidth,
            ),
        )
        .toBe(2);
    await expectScreen(page, "file-upload-single");
});
