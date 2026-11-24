import { expect, type Locator, type Page, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
} from "../helpers.ts";

// file-upload: a required attachments field (spec/file-upload.md). A FileUpload in a Field
// `name="attachments"` (Label "Attachments", Description "Up to 4 images or PDFs, 5 MB each.",
// Error "Add at least one file."), maxFiles 4, maxFileSize 5 MB, accept images and PDFs; a
// Dropzone "Drop images or PDFs here, or press to choose", a Trigger "Choose files", a ClearTrigger
// "Clear all"; accepted Items "Remove <name>", rejected ones "Dismiss <name>" with the reasons as
// text; "Send" prints "Sent: <names>". file-upload-avatar: one profile photo (Label "Profile
// photo", Dropzone "Drop a photo", Trigger "Choose photo", a preview "Profile photo preview" and
// "Remove photo"). The files are built in the page and dropped through a DataTransfer.

interface Spec {
    name: string;
    size: number;
    type: string;
}

/** A 2 × 2 PNG, base64: an image file's head, padded with zeros to its size. */
const PNG =
    "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEElEQVR4nGMwTpsJRAwQCgAf7gTJ/qZDUgAAAABJRU5ErkJggg==";

/** Drops files built in the page on `target` (enter, over, drop with one DataTransfer). */
function dropFiles(target: Locator, files: Spec[]): Promise<void> {
    return target.evaluate(
        (element, { files, png }) => {
            const transfer = new DataTransfer();
            for (const file of files) {
                const head = file.type.startsWith("image/")
                    ? Uint8Array.from(atob(png), (c) => c.charCodeAt(0))
                    : new Uint8Array(0);
                const bytes = new Uint8Array(Math.max(file.size, head.length));
                bytes.set(head);
                transfer.items.add(
                    new File([bytes], file.name, { type: file.type }),
                );
            }
            for (const type of ["dragenter", "dragover", "drop"]) {
                element.dispatchEvent(
                    new DragEvent(type, {
                        bubbles: true,
                        cancelable: true,
                        dataTransfer: transfer,
                    }),
                );
            }
        },
        { files, png: PNG },
    );
}

/** Presses with `press` and picks `files` in the file chooser it opens. */
async function pick(page: Page, press: () => Promise<void>, files: Spec[]) {
    const [chooser] = await Promise.all([
        page.waitForEvent("filechooser"),
        press(),
    ]);
    await chooser.setFiles(
        files.map((file) => ({
            name: file.name,
            mimeType: file.type,
            buffer: Buffer.concat([
                file.type.startsWith("image/")
                    ? Buffer.from(PNG, "base64")
                    : Buffer.alloc(0),
                Buffer.alloc(file.size),
            ]),
        })),
    );
}

const png = (name: string, size = 2000): Spec => ({
    name,
    size,
    type: "image/png",
});
const pdf = (name: string, size = 2000): Spec => ({
    name,
    size,
    type: "application/pdf",
});

test("attachments: drops and picks are checked, listed and announced; Send submits them", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "file-upload" });
    const group = frame.getByRole("group", { name: "Attachments" });
    await expect(group).toHaveAttribute(
        "data-primitives-part",
        "file-upload-root",
    );
    expect(await promoted(page)).toBe(false);
    const send = frame.getByRole("button", { name: "Send" });
    await send.click();
    await expect(frame.getByText("Add at least one file.")).toBeVisible();
    await expect(
        frame.getByRole("button", { name: "Choose files" }),
    ).toBeFocused();

    const zone = frame.getByRole("button", {
        name: "Drop images or PDFs here, or press to choose",
    });
    await dropFiles(zone, [
        png("photo.png", 1500),
        { name: "notes.txt", size: 10, type: "text/plain" },
        pdf("huge.pdf", 6_000_000),
    ]);
    await expect(
        frame.getByRole("button", { name: "Remove photo.png" }),
    ).toBeVisible();
    await expect(frame.getByText("1.5 kB")).toBeVisible();
    await expect(frame.getByText("not an image or a PDF")).toBeVisible();
    await expect(frame.getByText("over 5 MB")).toBeVisible();
    await expect(
        frame.locator('[data-primitives-part="file-upload-announcer"]'),
    ).toHaveText("1 attached, 2 rejected");

    await pick(
        page,
        () => frame.getByRole("button", { name: "Choose files" }).click(),
        [pdf("a.pdf"), png("b.png"), png("c.png"), png("d.png")],
    );
    await expect(frame.getByRole("button", { name: /^Remove / })).toHaveCount(
        4,
    );
    await expect(frame.getByText("more than 4 files")).toBeVisible();
    await expect(frame.getByText("not an image or a PDF")).toBeHidden();

    await frame.getByRole("button", { name: "Remove a.pdf" }).click();
    await expect(
        frame.getByRole("button", { name: "Remove b.png" }),
    ).toBeFocused();
    await send.click();
    await expect(frame.getByRole("status")).toHaveText(
        "Sent: photo.png, b.png, c.png",
    );
    await expect(frame.getByText("Add at least one file.")).toBeHidden();

    await frame.getByRole("button", { name: "Clear all" }).click();
    await expect(frame.getByRole("button", { name: /^Remove / })).toHaveCount(
        0,
    );
    await expect(
        frame.getByRole("button", { name: "Choose files" }),
    ).toBeFocused();
    expect(errors).toEqual([]);
});

test("attachments: axe finds no violation with accepted and rejected files", async ({
    page,
}) => {
    requireExamples("file-upload");
    await page.goto(`${EMBED_BASE}?id=file-upload`);
    await dropFiles(
        page.getByRole("button", {
            name: "Drop images or PDFs here, or press to choose",
        }),
        [png("photo.png"), { name: "notes.txt", size: 10, type: "text/plain" }],
    );
    await expect(page.getByText("not an image or a PDF")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});

test("avatar: a photo shows its preview, a new one replaces it, Remove clears it", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "file-upload-avatar" });
    const zone = frame.getByRole("button", { name: "Drop a photo" });
    await expect(zone).toHaveAttribute(
        "data-primitives-part",
        "file-upload-dropzone",
    );
    await dropFiles(zone, [png("me.png")]);
    const preview = frame.getByRole("img", { name: "Profile photo preview" });
    await expect(preview).toHaveAttribute("src", /^blob:/);
    await expect
        .poll(() =>
            preview.evaluate(
                (element) => (element as HTMLImageElement).naturalWidth,
            ),
        )
        .toBe(2);
    const first = await preview.getAttribute("src");

    await pick(
        page,
        () => frame.getByRole("button", { name: "Choose photo" }).click(),
        [png("new.png")],
    );
    await expect(preview).toHaveAttribute("src", /^blob:/);
    await expect(preview).not.toHaveAttribute("src", first ?? "");
    await expect(frame.getByRole("img")).toHaveCount(1);

    await frame.getByRole("button", { name: "Remove photo" }).click();
    await expect(frame.getByRole("img")).toHaveCount(0);
    await expect(
        frame.getByRole("button", { name: "Choose photo" }),
    ).toBeFocused();
    expect(errors).toEqual([]);
});

test("avatar: axe finds no violation with a photo", async ({ page }) => {
    requireExamples("file-upload-avatar");
    await page.goto(`${EMBED_BASE}?id=file-upload-avatar`);
    await dropFiles(page.getByRole("button", { name: "Drop a photo" }), [
        png("me.png"),
    ]);
    await expect(
        page.getByRole("img", { name: "Profile photo preview" }),
    ).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
