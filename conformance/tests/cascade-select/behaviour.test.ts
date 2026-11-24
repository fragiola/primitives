import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/cascade-select.md
const trigger = (page: Page, name = "Location") =>
    page.getByRole("combobox", { name });
const levels = (page: Page) => page.getByRole("listbox");
const option = (page: Page, name: string) =>
    page.getByRole("option", { name, exact: true });

/** The highlighted option, as the trigger announces it (`aria-activedescendant`). */
async function expectHighlighted(page: Page, name: string, label?: string) {
    await expect(option(page, name)).toHaveAttribute("data-highlighted");
    const id = await option(page, name).getAttribute("id");
    expect(id).not.toBeNull();
    await expect(trigger(page, label)).toHaveAttribute(
        "aria-activedescendant",
        id as string,
    );
}

/** Opens the popup with the keyboard, then highlights `name` in the first level. */
async function openOn(page: Page, name: string) {
    await trigger(page).focus();
    await page.keyboard.press("ArrowDown");
    await expectHighlighted(page, "Africa");
    for (const step of ["Americas", "Antarctica", "Europe", "Oceania"]) {
        if (
            (await option(page, name).getAttribute("data-highlighted")) !== null
        ) {
            return;
        }
        await page.keyboard.press("ArrowDown");
        await expectHighlighted(page, step);
    }
}

test.describe("cascade-select / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/cascade-select/basic");
    });

    test("a named, collapsed select-only combobox showing its placeholder", async ({
        page,
    }) => {
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
        await expect(trigger(page)).toHaveAttribute("aria-haspopup", "listbox");
        await expect(trigger(page)).toHaveText("Choose a place");
        await expect(page.getByRole("combobox")).toHaveCount(1);
        await expect(page.getByRole("textbox")).toHaveCount(0);
    });

    test("ArrowDown opens the first level only, highlighting its first item", async ({
        page,
    }) => {
        await trigger(page).focus();
        await page.keyboard.press("ArrowDown");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
        await expect(levels(page)).toHaveCount(1);
        await expect(page.getByRole("option")).toHaveText([
            "Africa",
            "Americas",
            "Antarctica",
            "Europe",
            "Oceania",
        ]);
        await expectHighlighted(page, "Africa");
        await expect(option(page, "Africa")).toHaveAttribute(
            "data-has-children",
        );
        await expect(option(page, "Antarctica")).not.toHaveAttribute(
            "data-has-children",
        );
        await expect(trigger(page)).toBeFocused();
    });

    test("ArrowRight opens a level named by its parent; ArrowLeft closes it", async ({
        page,
    }) => {
        await openOn(page, "Europe");
        await expect(levels(page)).toHaveCount(1);
        await page.keyboard.press("ArrowRight");
        const second = page.getByRole("listbox", { name: "Europe" });
        await expect(second).toBeVisible();
        await expectHighlighted(page, "France");
        await expect(option(page, "Europe")).toHaveAttribute("data-expanded");
        await expect(option(page, "Europe")).toHaveAttribute(
            "aria-controls",
            (await second.getAttribute("id")) as string,
        );
        await page.keyboard.press("ArrowLeft");
        await expectHighlighted(page, "Europe");
        await expect(levels(page)).toHaveCount(1);
        await page.keyboard.press("ArrowLeft");
        await expectHighlighted(page, "Europe");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
    });

    test("three levels down, a disabled leaf is not chosen; Enter chooses a leaf", async ({
        page,
    }) => {
        await openOn(page, "Europe");
        await page.keyboard.press("ArrowRight");
        await expectHighlighted(page, "France");
        await page.keyboard.press("ArrowDown");
        await expectHighlighted(page, "Germany");
        await page.keyboard.press("ArrowRight");
        await expectHighlighted(page, "Berlin");
        await expect(levels(page)).toHaveCount(3);
        await page.keyboard.press("ArrowDown");
        await expectHighlighted(page, "Munich");
        await expect(option(page, "Munich")).toHaveAttribute(
            "aria-disabled",
            "true",
        );
        await page.keyboard.press("Enter");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
        await page.keyboard.press("ArrowUp");
        await expectHighlighted(page, "Berlin");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "europe/germany/berlin");
        await expect(trigger(page)).toHaveText("Europe / Germany / Berlin");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
        await expect(trigger(page)).toBeFocused();

        // reopened on the chosen path
        await page.keyboard.press("ArrowDown");
        await expect(levels(page)).toHaveCount(3);
        await expectHighlighted(page, "Berlin");
        for (const name of ["Europe", "Germany", "Berlin"]) {
            await expect(option(page, name)).toHaveAttribute(
                "aria-selected",
                "true",
            );
        }
        await expect(option(page, "France")).toHaveAttribute(
            "aria-selected",
            "false",
        );
        await expect(
            option(page, "Berlin").locator(
                '[data-primitives-part="cascade-select-item-indicator"]',
            ),
        ).toHaveCount(1);
    });

    test("typeahead moves within the highlighted level; closed, it opens on a match", async ({
        page,
    }) => {
        await openOn(page, "Europe");
        await page.keyboard.press("ArrowRight");
        await expectHighlighted(page, "France");
        await page.keyboard.press("p");
        await expectHighlighted(page, "Portugal");
        await page.keyboard.press("Escape");
        await expectOutput(page, "reason", "escape-key");
        await expectOutput(page, "value", "none");
        await page.waitForTimeout(600);
        await page.keyboard.press("e");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
        await expectHighlighted(page, "Europe");
    });

    test("a leaf of the first level is chosen; a disabled parent never opens", async ({
        page,
    }) => {
        await openOn(page, "Oceania");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Enter");
        await expect(levels(page)).toHaveCount(1);
        await expectHighlighted(page, "Oceania");
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowUp");
        await expectHighlighted(page, "Antarctica");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "antarctica");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
        await expect(trigger(page)).toHaveText("Antarctica");
    });

    test("Tab chooses a leaf, not a parent, and closes", async ({ page }) => {
        await openOn(page, "Americas");
        await page.keyboard.press("ArrowRight");
        await expectHighlighted(page, "Brazil");
        await page.keyboard.press("ArrowDown");
        await expectHighlighted(page, "Canada");
        await page.keyboard.press("Tab");
        await expectOutput(page, "reason", "focus-out");
        await expectOutput(page, "value", "none");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
        await openOn(page, "Antarctica");
        await page.keyboard.press("Tab");
        await expectOutput(page, "value", "antarctica");
    });

    test("clicks open a parent's level at once and choose a leaf", async ({
        page,
    }) => {
        await trigger(page).click();
        await expectOutput(page, "reason", "trigger-press");
        await option(page, "Europe").click();
        await expect(
            page.getByRole("listbox", { name: "Europe" }),
        ).toBeVisible();
        await expectHighlighted(page, "Europe");
        await option(page, "Portugal").click();
        await expect(
            page.getByRole("listbox", { name: "Portugal" }),
        ).toBeVisible();
        await option(page, "Porto").click();
        await expectOutput(page, "value", "europe/portugal/porto");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
        await expect(trigger(page)).toBeFocused();
    });

    test("hovering a parent opens its level after the delay", async ({
        page,
    }) => {
        await trigger(page).click();
        await option(page, "Europe").hover();
        await expect(
            page.getByRole("listbox", { name: "Europe" }),
        ).toBeVisible();
        await expectHighlighted(page, "Europe");
        await option(page, "Africa").hover();
        await expect(page.getByRole("listbox", { name: "Europe" })).toHaveCount(
            0,
        );
        await expect(
            page.getByRole("listbox", { name: "Africa" }),
        ).toBeVisible();
        await expectHighlighted(page, "Africa");
    });

    test("the safe area keeps a level open while the pointer travels to it", async ({
        page,
    }) => {
        await trigger(page).click();
        await option(page, "Europe").hover();
        const second = page.getByRole("listbox", { name: "Europe" });
        await expect(second).toBeVisible();
        const from = await option(page, "Europe").boundingBox();
        const to = await option(page, "France").boundingBox();
        if (from === null || to === null) {
            throw new Error("missing boxes");
        }
        await page.mouse.move(
            from.x + from.width - 4,
            from.y + from.height / 2,
        );
        await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {
            steps: 12,
        });
        await expect(second).toBeVisible();
        await expectHighlighted(page, "France");
    });

    test("an outside press closes the popup", async ({ page }) => {
        await trigger(page).click();
        await expect(levels(page)).toHaveCount(1);
        await page.mouse.click(600, 20);
        await expectOutput(page, "reason", "outside-press");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
    });

    test("the form submits the path, validates required and resets", async ({
        page,
    }) => {
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
        await expect(trigger(page)).toBeFocused();
        await trigger(page).click();
        await option(page, "Europe").click();
        await option(page, "Portugal").click();
        await option(page, "Porto").click();
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "location=europe/portugal/porto");
        await page.getByRole("button", { name: "Reset" }).click();
        await expectOutput(page, "value", "none");
        await expect(trigger(page)).toHaveText("Choose a place");
    });

    test("axe finds no violation, closed and open on three levels", async ({
        page,
    }) => {
        await expectNoAxeViolations(page);
        await openOn(page, "Europe");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await expect(levels(page)).toHaveCount(3);
        await expectNoAxeViolations(page);
    });
});

test.describe("cascade-select / basic in RTL", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/cascade-select/basic", { dir: "rtl" });
    });

    test("ArrowLeft opens a level, ArrowRight closes it, the level on the left", async ({
        page,
    }) => {
        await openOn(page, "Europe");
        await page.keyboard.press("ArrowRight");
        await expect(levels(page)).toHaveCount(1);
        await page.keyboard.press("ArrowLeft");
        await expectHighlighted(page, "France");
        const first = await option(page, "Europe").boundingBox();
        const second = await page
            .getByRole("listbox", { name: "Europe" })
            .boundingBox();
        if (first === null || second === null) {
            throw new Error("missing boxes");
        }
        expect(second.x + second.width).toBeLessThanOrEqual(first.x + 2);
        await page.keyboard.press("ArrowRight");
        await expectHighlighted(page, "Europe");
        await expect(levels(page)).toHaveCount(1);
    });
});

test.describe("cascade-select / change-on-select", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/cascade-select/change-on-select");
    });

    test("a parent is chosen, the popup staying open on its level", async ({
        page,
    }) => {
        await expect(trigger(page)).toHaveText("Americas");
        await trigger(page).focus();
        await page.keyboard.press("ArrowDown");
        await expectHighlighted(page, "Americas");
        await expect(option(page, "Americas")).toHaveAttribute(
            "aria-selected",
            "true",
        );
        await expect(levels(page)).toHaveCount(1);
        await page.keyboard.press("ArrowUp");
        await expectHighlighted(page, "Africa");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "africa");
        await expectHighlighted(page, "Kenya");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "africa/kenya");
        await expectHighlighted(page, "Mombasa");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "africa/kenya/mombasa");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
        await expect(trigger(page)).toHaveText("Mombasa");
    });

    test("Tab chooses a parent; a click chooses one and keeps the popup open", async ({
        page,
    }) => {
        await trigger(page).focus();
        await page.keyboard.press("ArrowUp");
        await expectHighlighted(page, "Americas");
        await page.keyboard.press("ArrowRight");
        await expectHighlighted(page, "Brazil");
        await page.keyboard.press("ArrowLeft");
        await expectHighlighted(page, "Americas");
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("Tab");
        await expectOutput(page, "value", "africa");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
        await trigger(page).click();
        await option(page, "Europe").click();
        await expectOutput(page, "value", "europe");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
        await expect(
            page.getByRole("listbox", { name: "Europe" }),
        ).toBeVisible();
    });
});

test.describe("cascade-select / field", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/cascade-select/field");
    });

    test("named and described by the field; submits, changes and resets the path", async ({
        page,
    }) => {
        const combobox = trigger(page, "Place");
        await expect(combobox).toHaveAccessibleDescription("Where you live.");
        await expect(combobox).toHaveText("Europe / France / Lyon");
        const root = page.locator('[data-primitives-part="field-root"]');
        await expect(root).toHaveAttribute("data-filled", "");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "place=europe/france/lyon");

        await combobox.focus();
        await expect(root).toHaveAttribute("data-focused", "");
        await page.keyboard.press("Home");
        await expectHighlighted(page, "Africa", "Place");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await expectHighlighted(page, "Mombasa", "Place");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "africa/kenya/mombasa");
        await page.keyboard.press("Tab");
        await expect(root).toHaveAttribute("data-touched", "");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "place=africa/kenya/mombasa");
        await page.getByRole("button", { name: "Reset" }).click();
        await expectOutput(page, "value", "europe/france/lyon");
        await expect(combobox).toHaveText("Europe / France / Lyon");
        await expectNoAxeViolations(page);
    });
});
