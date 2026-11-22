import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/radio-group.md
const radio = (page: Page, name: string) =>
    page.getByRole("radio", { name, exact: true });

/** The radio is the only checked one, and has the focus. */
async function expectChecked(page: Page, name: string): Promise<void> {
    await expect(radio(page, name)).toBeFocused();
    await expect(radio(page, name)).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(1);
}

test.describe("radio-group / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/radio-group/basic");
    });

    test("a named, required radiogroup of four radios, none checked", async ({
        page,
    }) => {
        const group = page.getByRole("radiogroup", { name: "Plan" });
        await expect(group).toHaveAttribute("aria-required", "true");
        // the hidden inputs are not in the tree
        await expect(page.getByRole("radio")).toHaveCount(4);
        await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
        await expect(radio(page, "Team")).toBeDisabled();
    });

    test("Tab enters at the first radio, Space checks it", async ({ page }) => {
        await page.keyboard.press("Tab");
        await expect(radio(page, "Free")).toBeFocused();
        await page.keyboard.press("Space");
        await expectChecked(page, "Free");
        await expectOutput(page, "value", "free");
    });

    test("the arrows move the focus and the check, skip the disabled radio and wrap", async ({
        page,
    }) => {
        await radio(page, "Free").focus();
        await page.keyboard.press("Space");
        await page.keyboard.press("ArrowDown");
        await expectChecked(page, "Pro");
        await expectOutput(page, "value", "pro");
        await page.keyboard.press("ArrowDown");
        await expectChecked(page, "Enterprise");
        await page.keyboard.press("ArrowDown");
        await expectChecked(page, "Free");
        await page.keyboard.press("ArrowUp");
        await expectChecked(page, "Enterprise");
        await page.keyboard.press("ArrowRight");
        await expectChecked(page, "Free");
        await page.keyboard.press("ArrowLeft");
        await expectChecked(page, "Enterprise");
        await expectOutput(page, "value", "enterprise");
    });

    test("the group is one tab stop, at its checked radio", async ({
        page,
    }) => {
        await radio(page, "Free").focus();
        await page.keyboard.press("Space");
        await page.keyboard.press("ArrowUp");
        await expectChecked(page, "Enterprise");
        await page.keyboard.press("Tab");
        await expect(
            page.getByRole("button", { name: "Submit" }),
        ).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await expect(radio(page, "Enterprise")).toBeFocused();
    });

    test("a click on a label checks its radio and focuses it", async ({
        page,
    }) => {
        await page.getByText("Pro", { exact: true }).click();
        await expectChecked(page, "Pro");
    });

    test("required blocks the submission and focuses the group; checked, the form submits it", async ({
        page,
    }) => {
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
        await expect(radio(page, "Free")).toBeFocused();
        await radio(page, "Pro").click();
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "plan=pro");
    });

    test("a form reset returns the group to no radio checked", async ({
        page,
    }) => {
        await radio(page, "Pro").click();
        await expect(radio(page, "Pro")).toHaveAttribute(
            "aria-checked",
            "true",
        );
        await page.getByRole("button", { name: "Reset" }).click();
        await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
    });

    test("a disabled radio ignores clicks", async ({ page }) => {
        // forced: the press must reach the disabled radio, which then does nothing
        await radio(page, "Team").click({ force: true });
        await page.getByText("Team", { exact: true }).click({ force: true });
        await expect(radio(page, "Team")).toHaveAttribute(
            "aria-checked",
            "false",
        );
        await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
        await expectOutput(page, "value", "none");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test("radio-group / basic?dir=rtl: ArrowLeft is the next radio, ArrowDown still the next", async ({
    page,
}) => {
    await openScenario(page, "/radio-group/basic", { dir: "rtl" });
    await radio(page, "Free").focus();
    await page.keyboard.press("Space");
    await expectChecked(page, "Free");
    await page.keyboard.press("ArrowLeft");
    await expectChecked(page, "Pro");
    await page.keyboard.press("ArrowLeft");
    await expectChecked(page, "Enterprise");
    await page.keyboard.press("ArrowRight");
    await expectChecked(page, "Pro");
    await page.keyboard.press("ArrowDown");
    await expectChecked(page, "Enterprise");
});

test.describe("radio-group / controlled", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/radio-group/controlled");
    });

    test("a horizontal group whose value the consumer holds", async ({
        page,
    }) => {
        await expect(
            page.getByRole("radiogroup", { name: "Size" }),
        ).toHaveAttribute("aria-orientation", "horizontal");
        await expect(radio(page, "Medium")).toHaveAttribute(
            "aria-checked",
            "true",
        );
    });

    test("with loopFocus off, an arrow at an end does nothing", async ({
        page,
    }) => {
        await radio(page, "Medium").focus();
        await page.keyboard.press("ArrowLeft");
        await expectChecked(page, "Small");
        await expectOutput(page, "value", "small");
        await page.keyboard.press("ArrowLeft");
        await expectChecked(page, "Small");
        await expectOutput(page, "value", "small");
    });

    test("a value the consumer refuses is reported, not checked", async ({
        page,
    }) => {
        await radio(page, "Medium").focus();
        await page.keyboard.press("ArrowLeft");
        await expectOutput(page, "value", "small");
        await radio(page, "Large").click();
        await expectOutput(page, "requested", "large");
        await expect(radio(page, "Small")).toHaveAttribute(
            "aria-checked",
            "true",
        );
        await expect(radio(page, "Large")).toHaveAttribute(
            "aria-checked",
            "false",
        );
        await expectOutput(page, "value", "small");
    });
});
