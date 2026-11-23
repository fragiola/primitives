import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { pointAlong } from "../../src/pointer.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/rating.md
const group = (page: Page, name: string) =>
    page.getByRole("radiogroup", { name });
const star = (page: Page, name: string) =>
    page.getByRole("radio", { name, exact: true });
/** Star `index` (1 to 5) of a Root, whatever its name. */
const nth = (root: Locator, index: number) =>
    root.getByRole("radio").nth(index - 1);

/** The star is the only checked one, and has the focus. */
async function expectChecked(page: Page, name: string): Promise<void> {
    await expect(star(page, name)).toBeFocused();
    await expect(star(page, name)).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(1);
}

/** Which stars of a Root are drawn filled (`data-highlighted`) and half (`data-half`). */
async function expectDrawn(
    root: Locator,
    highlighted: number,
    half: number | null = null,
): Promise<void> {
    const stars = root.getByRole("radio");
    await expect
        .poll(() =>
            stars.evaluateAll((elements) =>
                elements.map((element) =>
                    element.hasAttribute("data-half")
                        ? "half"
                        : element.hasAttribute("data-highlighted")
                          ? "full"
                          : "empty",
                ),
            ),
        )
        .toEqual(
            [1, 2, 3, 4, 5].map((index) =>
                index === half
                    ? "half"
                    : index <= highlighted
                      ? "full"
                      : "empty",
            ),
        );
}

/** A mouse move to (or a press at) a fraction along a star from its left edge. */
async function pointAt(
    page: Page,
    target: Locator,
    fromLeft: number,
): Promise<void> {
    const point = await pointAlong(target, fromLeft);
    await page.mouse.move(point.x, point.y);
}

async function pressAt(
    page: Page,
    target: Locator,
    fromLeft: number,
): Promise<void> {
    await pointAt(page, target, fromLeft);
    await page.mouse.down();
    await page.mouse.up();
}

test.describe("rating / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/rating/basic");
    });

    test("a named radiogroup of five stars, none checked", async ({ page }) => {
        const root = group(page, "Rating");
        await expect(root).toBeVisible();
        // the HiddenInput is not in the tree
        await expect(page.getByRole("radio")).toHaveCount(5);
        for (const name of [
            "1 star",
            "2 stars",
            "3 stars",
            "4 stars",
            "5 stars",
        ]) {
            await expect(star(page, name)).toHaveAttribute(
                "aria-checked",
                "false",
            );
        }
        await expectDrawn(root, 0);
    });

    test("Tab enters at the first star, Space checks it", async ({ page }) => {
        await page.keyboard.press("Tab");
        await expect(star(page, "1 star")).toBeFocused();
        await page.keyboard.press("Space");
        await expectChecked(page, "1 star");
        await expectOutput(page, "value", "1");
        await expectOutput(page, "reason", "keyboard");
    });

    test("the arrows, Home and End step the value and move the focus, wrapping", async ({
        page,
    }) => {
        await star(page, "1 star").focus();
        await page.keyboard.press("Space");
        await expectChecked(page, "1 star");
        await page.keyboard.press("ArrowRight");
        await expectChecked(page, "2 stars");
        await expectOutput(page, "value", "2");
        await expectOutput(page, "reason", "keyboard");
        await page.keyboard.press("End");
        await expectChecked(page, "5 stars");
        await page.keyboard.press("ArrowRight");
        await expectChecked(page, "1 star");
        await page.keyboard.press("ArrowLeft");
        await expectChecked(page, "5 stars");
        await page.keyboard.press("Home");
        await expectChecked(page, "1 star");
        await page.keyboard.press("ArrowDown");
        await expectChecked(page, "2 stars");
        await page.keyboard.press("ArrowUp");
        await expectChecked(page, "1 star");
        await page.keyboard.press("Enter");
        await expectChecked(page, "1 star");
        await expectOutput(page, "value", "1");
        await expectSubmitted(page, "none");
    });

    test("a click checks a star; the pointer previews; a second click keeps it", async ({
        page,
    }) => {
        const root = group(page, "Rating");
        await star(page, "4 stars").click();
        await expectChecked(page, "4 stars");
        await expectOutput(page, "value", "4");
        await expectOutput(page, "reason", "item-press");
        await expectDrawn(root, 4);

        await pointAt(page, star(page, "2 stars"), 0.5);
        await expectDrawn(root, 2);
        await expect(star(page, "4 stars")).toHaveAttribute(
            "aria-checked",
            "true",
        );
        await page.mouse.move(0, 0);
        await expectDrawn(root, 4);

        // `allowClear` off: choosing the value again changes nothing
        await star(page, "4 stars").click();
        await expectChecked(page, "4 stars");
        await expectOutput(page, "value", "4");
    });

    test("the form submits the value; a reset returns it to none", async ({
        page,
    }) => {
        await star(page, "4 stars").click();
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "rating=4");
        await page.getByRole("button", { name: "Reset" }).click();
        await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
        await expectOutput(page, "value", "0");
        await expectOutput(page, "reason", "none");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "empty");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("rating / half", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/rating/half");
    });

    test("a half value checks the star that holds it, drawn half", async ({
        page,
    }) => {
        const root = group(page, "Half rating");
        await expect(star(page, "2.5 stars")).toHaveAttribute(
            "aria-checked",
            "true",
        );
        await expect(nth(root, 3)).toHaveAttribute("aria-label", "2.5 stars");
        await expect(star(page, "2.5 stars")).toHaveAttribute("tabindex", "0");
        await expectDrawn(root, 3, 3);
        await expectNoAxeViolations(page);
    });

    test("the arrows step by halves; Home and End go to the ends", async ({
        page,
    }) => {
        const root = group(page, "Half rating");
        await star(page, "2.5 stars").focus();
        await page.keyboard.press("ArrowRight");
        await expectChecked(page, "3 stars");
        await expectOutput(page, "value", "3");
        await expectDrawn(root, 3);
        await page.keyboard.press("ArrowLeft");
        await expectChecked(page, "2.5 stars");
        await page.keyboard.press("ArrowLeft");
        await expectChecked(page, "2 stars");
        await expectOutput(page, "value", "2");
        await page.keyboard.press("Home");
        await expectChecked(page, "0.5 stars");
        await expectDrawn(root, 1, 1);
        await page.keyboard.press("ArrowLeft");
        await expectChecked(page, "5 stars");
        await page.keyboard.press("End");
        await expectChecked(page, "5 stars");
        await expectOutput(page, "value", "5");
    });

    test("a press on a star's start half chooses its half; again, it clears", async ({
        page,
    }) => {
        const root = group(page, "Half rating");
        await pressAt(page, nth(root, 2), 0.25);
        await expectChecked(page, "1.5 stars");
        await expectOutput(page, "value", "1.5");
        await expectOutput(page, "reason", "item-press");
        // the same value again: `allowClear` clears it, the focus stays
        await pressAt(page, nth(root, 2), 0.25);
        await expectOutput(page, "value", "0");
        await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
        await expect(star(page, "2 stars")).toBeFocused();
        await page.mouse.move(0, 0);
        await expectDrawn(root, 0);
        await pressAt(page, nth(root, 2), 0.75);
        await expectChecked(page, "2 stars");
        await expectOutput(page, "value", "2");
    });

    test("the pointer previews whole and half values", async ({ page }) => {
        const root = group(page, "Half rating");
        await pressAt(page, nth(root, 2), 0.75);
        await expectOutput(page, "value", "2");
        await pointAt(page, nth(root, 4), 0.75);
        await expectDrawn(root, 4);
        await pointAt(page, nth(root, 4), 0.25);
        await expectDrawn(root, 4, 4);
        await expectOutput(page, "value", "2");
        await page.mouse.move(0, 0);
        await expectDrawn(root, 2);
    });
});

test("rating / half?dir=rtl: ArrowLeft steps up; a star's right half is its start half", async ({
    page,
}) => {
    await openScenario(page, "/rating/half", { dir: "rtl" });
    const root = group(page, "Half rating");
    await star(page, "2.5 stars").focus();
    await page.keyboard.press("ArrowLeft");
    await expectChecked(page, "3 stars");
    await page.keyboard.press("ArrowRight");
    await expectChecked(page, "2.5 stars");
    // from the left edge: three quarters is the right side, the inline start in RTL
    await pressAt(page, nth(root, 4), 0.75);
    await expectChecked(page, "3.5 stars");
    await expectOutput(page, "value", "3.5");
    await pointAt(page, nth(root, 2), 0.25);
    await expectDrawn(root, 2);
});

test.describe("rating / read-only", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/rating/read-only");
    });

    test("a read-only rating is focusable and changes by nothing", async ({
        page,
    }) => {
        const quality = group(page, "Quality");
        await expect(quality).toHaveAttribute("aria-readonly", "true");
        await expect(nth(quality, 3)).toHaveAttribute("aria-checked", "true");
        await expectDrawn(quality, 3);
        await page.keyboard.press("Tab");
        await expect(nth(quality, 3)).toBeFocused();
        for (const key of ["ArrowRight", "Home", "End", "Space"]) {
            await page.keyboard.press(key);
        }
        await expect(nth(quality, 3)).toHaveAttribute("aria-checked", "true");
        await nth(quality, 5).click();
        await expect(nth(quality, 3)).toHaveAttribute("aria-checked", "true");
        await pointAt(page, nth(quality, 5), 0.5);
        await expectDrawn(quality, 3);
        await expectOutput(page, "value", "none");
    });

    test("a disabled rating is out of the tab order and changes by nothing", async ({
        page,
    }) => {
        const quality = group(page, "Quality");
        const service = group(page, "Service");
        await expect(service).toHaveAttribute("aria-disabled", "true");
        for (const radio of await service.getByRole("radio").all()) {
            await expect(radio).toBeDisabled();
        }
        await expectDrawn(service, 2);
        await nth(quality, 3).focus();
        await page.keyboard.press("Tab");
        await expect(page.getByRole("button", { name: "After" })).toBeFocused();
        await nth(service, 4).click({ force: true });
        await expect(nth(service, 2)).toHaveAttribute("aria-checked", "true");
        await expectOutput(page, "value", "none");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("rating / field", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/rating/field");
    });

    test("labelled and described by the Field, required", async ({ page }) => {
        const root = group(page, "Satisfaction");
        await expect(root).toHaveAccessibleDescription("How was your stay?");
        await expect(root).toHaveAttribute("aria-required", "true");
        await expect(root).not.toHaveAttribute("aria-invalid");
        await expectNoAxeViolations(page);
    });

    test("required blocks the submission, focuses the first star and shows the error", async ({
        page,
    }) => {
        const root = group(page, "Satisfaction");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
        await expect(star(page, "1 star")).toBeFocused();
        await expect(root).toHaveAttribute("aria-invalid", "true");
        await expect(page.getByText("Choose a rating.")).toBeVisible();
        await expectNoAxeViolations(page);

        await star(page, "4 stars").click();
        await expect(page.getByText("Choose a rating.")).toBeHidden();
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "satisfaction=4");
    });

    test("a form reset returns it to no star checked", async ({ page }) => {
        await star(page, "4 stars").click();
        await page.getByRole("button", { name: "Reset" }).click();
        await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
    });
});
