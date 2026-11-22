import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// button: publish a post (spec/button.md). A Button "Publish" that, once pressed, is busy for a
// second (`disabled` and `focusableWhenDisabled`) and then prints "Published." in the status; a
// Button "Archive" rendered as a `span` (`nativeButton={false}`), disabled while "Publish" is busy,
// that prints "Archived.". The status starts at "Draft.".

test("a busy button keeps the focus and ignores its keys; a span button presses on Enter", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "button" });
    const publish = frame.getByRole("button", { name: "Publish" });
    const archive = frame.getByRole("button", { name: "Archive" });
    const status = frame.getByRole("status");
    await expect(publish).toHaveAttribute(
        "data-primitives-part",
        "button-root",
    );
    await expect(status).toHaveText("Draft.");

    await publish.focus();
    await page.keyboard.press("Enter");
    await expect(status).toHaveText("Publishing…");
    await expect(publish).toHaveAttribute("aria-disabled", "true");
    await expect(publish).toBeFocused();
    await expect(archive).toHaveAttribute("aria-disabled", "true");
    await expect(archive).toHaveAttribute("tabindex", "-1");
    await expect(status).toHaveText("Published.");
    await expect(publish).not.toHaveAttribute("aria-disabled");

    await expect(archive).toHaveAttribute("role", "button");
    await archive.focus();
    await page.keyboard.press("Enter");
    await expect(status).toHaveText("Archived.");
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("button");
    await page.goto(`${EMBED_BASE}?id=button`);
    await expect(page.getByRole("button")).toHaveCount(2);
    expect(await axeViolations(page)).toEqual([]);
});
