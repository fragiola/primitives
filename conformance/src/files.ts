import type { Locator, Page } from "@playwright/test";

// spec/drop-zone.md, "Scenarios": the files are built in the page (`new File()`) and handed over
// through a `DataTransfer` built there too, carried by drag and paste events dispatched on the
// target. An image file holds a small valid PNG padded with zeros to its size, so its preview
// loads.

/** A file the page builds: its name, size in bytes and type (default: from the extension). */
export interface FileSpec {
    name: string;
    size?: number;
    type?: string;
}

/** A 2 × 2 PNG (a blue square), base64. */
const PNG =
    "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEElEQVR4nGMwTpsJRAwQCgAf7gTJ/qZDUgAAAABJRU5ErkJggg==";

const TYPES: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    pdf: "application/pdf",
    txt: "text/plain",
};

/** The type of a file spec. */
export function fileType(spec: FileSpec): string {
    if (spec.type !== undefined) {
        return spec.type;
    }
    const extension = spec.name.split(".").pop()?.toLowerCase() ?? "";
    return TYPES[extension] ?? "";
}

/** The bytes of a file spec, as Playwright's file chooser takes them. */
export function fileBuffer(spec: FileSpec): Buffer {
    const size = spec.size ?? 100;
    const head = fileType(spec).startsWith("image/")
        ? Buffer.from(PNG, "base64")
        : Buffer.alloc(0);
    return Buffer.concat([head, Buffer.alloc(Math.max(0, size - head.length))]);
}

/** The files of a file chooser (`fileChooser.setFiles`). */
export function chooserFiles(specs: FileSpec[]) {
    return specs.map((spec) => ({
        name: spec.name,
        mimeType: fileType(spec) || "application/octet-stream",
        buffer: fileBuffer(spec),
    }));
}

type Serialized = { name: string; type: string; base64: string };

function serialize(specs: FileSpec[]): Serialized[] {
    return specs.map((spec) => ({
        name: spec.name,
        type: fileType(spec),
        base64: fileBuffer(spec).toString("base64"),
    }));
}

/**
 * Dispatches drag events of files on `target` in the page: each of `events` (`dragenter`,
 * `dragover`, `dragleave`, `drop`) with one `DataTransfer` holding the files. Returns whether
 * the last event's default was prevented.
 */
export function dispatchFileDrag(
    target: Locator,
    events: string[],
    specs: FileSpec[],
    kind: "files" | "text" = "files",
): Promise<boolean> {
    return target.evaluate(
        (element, { events, files, kind }) => {
            const transfer = new DataTransfer();
            if (kind === "text") {
                transfer.setData("text/plain", "some text");
            }
            for (const file of files) {
                const bytes = Uint8Array.from(atob(file.base64), (c) =>
                    c.charCodeAt(0),
                );
                transfer.items.add(
                    new File([bytes], file.name, { type: file.type }),
                );
            }
            let prevented = false;
            for (const type of events) {
                const event = new DragEvent(type, {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: transfer,
                });
                element.dispatchEvent(event);
                prevented = event.defaultPrevented;
            }
            return prevented;
        },
        { events, files: serialize(specs), kind },
    );
}

/** A whole drag of files onto `target`: enter, over, drop. */
export function dropFiles(
    target: Locator,
    specs: FileSpec[],
): Promise<boolean> {
    return dispatchFileDrag(target, ["dragenter", "dragover", "drop"], specs);
}

/** A paste on `target` whose clipboard holds the files (or only text, for none). */
export function pasteFiles(target: Locator, specs: FileSpec[]): Promise<void> {
    return target.evaluate((element, files) => {
        const transfer = new DataTransfer();
        transfer.setData("text/plain", "pasted text");
        for (const file of files) {
            const bytes = Uint8Array.from(atob(file.base64), (c) =>
                c.charCodeAt(0),
            );
            transfer.items.add(
                new File([bytes], file.name, { type: file.type }),
            );
        }
        element.dispatchEvent(
            new ClipboardEvent("paste", {
                bubbles: true,
                cancelable: true,
                clipboardData: transfer,
            }),
        );
    }, serialize(specs));
}

/**
 * Presses with `press` (a key, a click) and picks `specs` in the file chooser it opens; returns
 * the chooser (its `isMultiple()`).
 */
export async function pickFiles(
    page: Page,
    press: () => Promise<void>,
    specs: FileSpec[],
) {
    const [chooser] = await Promise.all([
        page.waitForEvent("filechooser", { timeout: 5000 }),
        press(),
    ]);
    await chooser.setFiles(chooserFiles(specs));
    return chooser;
}

/** Whether a press opens no file chooser within a short wait. */
export async function opensNoChooser(
    page: Page,
    press: () => Promise<void>,
): Promise<boolean> {
    let opened = false;
    const listener = () => {
        opened = true;
    };
    page.on("filechooser", listener);
    await press();
    await page.waitForTimeout(300);
    page.off("filechooser", listener);
    return !opened;
}

/** The names of a file input's files. */
export function inputFileNames(input: Locator): Promise<string[]> {
    return input.evaluate((element) =>
        [...((element as HTMLInputElement).files ?? [])].map(
            (file) => file.name,
        ),
    );
}
