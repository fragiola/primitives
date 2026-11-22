import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { isInertOrHidden } from "../../src/focus.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/dialog.md
test.describe("dialog / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/dialog/basic");
    });

    const trigger = (page: import("@playwright/test").Page) =>
        page.getByRole("button", { name: "Open dialog", includeHidden: true });
    const dialog = (page: import("@playwright/test").Page) =>
        page.getByRole("dialog", { name: "Edit profile" });

    test("the trigger announces a dialog and its state", async ({ page }) => {
        await expect(trigger(page)).toHaveAttribute("aria-haspopup", "dialog");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
        await trigger(page).click();
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
        const id = await dialog(page).getAttribute("id");
        expect(id).not.toBeNull();
        await expect(trigger(page)).toHaveAttribute(
            "aria-controls",
            id as string,
        );
    });

    test("opens a named, described, modal dialog with focus on the first field", async ({
        page,
    }) => {
        await trigger(page).click();
        await expect(dialog(page)).toBeVisible();
        await expect(dialog(page)).toHaveAttribute("aria-modal", "true");
        await expect(dialog(page)).toHaveAccessibleDescription(
            "Change your display name.",
        );
        await expect(page.getByLabel("Name")).toBeFocused();
    });

    test("traps Tab and Shift+Tab inside the dialog", async ({ page }) => {
        await trigger(page).click();
        await expect(page.getByLabel("Name")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(page.getByRole("button", { name: "Save" })).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(page.getByLabel("Name")).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
    });

    test("makes the rest of the page inert and locks its scroll", async ({
        page,
    }) => {
        await trigger(page).click();
        await expect(dialog(page)).toBeVisible();
        const outside = page.getByRole("button", {
            name: "Outside button",
            includeHidden: true,
        });
        expect(await isInertOrHidden(outside)).toBe(true);
        await page.mouse.move(10, 10);
        await page.mouse.wheel(0, 600);
        await page.waitForTimeout(200);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test("Escape closes and returns focus to the trigger", async ({ page }) => {
        await trigger(page).click();
        await expect(dialog(page)).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(dialog(page)).toBeHidden();
        await expectOutput(page, "reason", "escape-key");
        await expect(trigger(page)).toBeFocused();
    });

    test("an outside press closes", async ({ page }) => {
        await trigger(page).click();
        await expect(dialog(page)).toBeVisible();
        await page.mouse.click(5, 5);
        await expect(dialog(page)).toBeHidden();
        await expectOutput(page, "reason", "outside-press");
    });

    test("Close closes and returns focus to the trigger", async ({ page }) => {
        await trigger(page).click();
        await page.getByRole("button", { name: "Close" }).click();
        await expect(dialog(page)).toBeHidden();
        await expectOutput(page, "reason", "close-press");
        await expect(trigger(page)).toBeFocused();
    });

    test("has no axe violation while open", async ({ page }) => {
        await trigger(page).click();
        await expect(dialog(page)).toBeVisible();
        await expectNoAxeViolations(page);
    });
});

test("dialog / initial-focus: focuses the element given as initial focus", async ({
    page,
}) => {
    await openScenario(page, "/dialog/initial-focus");
    await page.getByRole("button", { name: "Delete file" }).click();
    await expect(
        page.getByRole("dialog", { name: "Delete file?" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeFocused();
});

test("dialog / controlled: an external button opens it, Close reports and returns focus", async ({
    page,
}) => {
    await openScenario(page, "/dialog/controlled");
    const opener = page.getByRole("button", {
        name: "Open dialog",
        includeHidden: true,
    });
    await opener.click();
    await expect(
        page.getByRole("dialog", { name: "Controlled" }),
    ).toBeVisible();
    await expectOutput(page, "open", "true");
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog", { name: "Controlled" })).toBeHidden();
    await expectOutput(page, "open", "false");
    await expectOutput(page, "reason", "close-press");
    await expect(opener).toBeFocused();
});

test("dialog / rejected-close: a consumer that keeps open: true keeps the dialog open", async ({
    page,
}) => {
    await openScenario(page, "/dialog/rejected-close");
    await page
        .getByRole("button", { name: "Open dialog", includeHidden: true })
        .click();
    const dialog = page.getByRole("dialog", { name: "Locked" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expectOutput(page, "reason", "escape-key");
    await expectOutput(page, "open", "true");
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).toBeFocused();

    await page.mouse.click(5, 5);
    await expectOutput(page, "reason", "outside-press");
    await expect(dialog).toBeVisible();

    await page.getByRole("button", { name: "Close" }).click();
    await expectOutput(page, "reason", "close-press");
    await expectOutput(page, "open", "true");
    await expect(dialog).toBeVisible();

    // still a working modal: Escape is still handled, and the outside stays inert
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    expect(
        await isInertOrHidden(
            page.getByRole("button", {
                name: "Open dialog",
                includeHidden: true,
            }),
        ),
    ).toBe(true);
});

test.describe("dialog / nested-popover", () => {
    const dialog = (page: Page) =>
        page.getByRole("dialog", { name: "Edit profile" });
    const popover = (page: Page) =>
        page.getByRole("dialog", { name: "About names" });
    const moreInfo = (page: Page) =>
        page.getByRole("button", { name: "More info" });

    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/dialog/nested-popover");
        await page.getByRole("button", { name: "Open dialog" }).click();
        await moreInfo(page).click();
        await expect(popover(page)).toBeVisible();
    });

    test("focus moves into the popover", async ({ page }) => {
        await expect(
            page.getByRole("button", { name: "Got it" }),
        ).toBeFocused();
    });

    test("Escape closes the popover first, then the dialog", async ({
        page,
    }) => {
        await page.keyboard.press("Escape");
        await expect(popover(page)).toBeHidden();
        await expect(dialog(page)).toBeVisible();
        await expect(moreInfo(page)).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(dialog(page)).toBeHidden();
    });

    test("a press inside the dialog closes only the popover", async ({
        page,
    }) => {
        await page.getByRole("heading", { name: "Edit profile" }).click();
        await expect(popover(page)).toBeHidden();
        await expect(dialog(page)).toBeVisible();
        // the press landed in the dialog's popup (focusable): it keeps the focus
        await expect(dialog(page)).toBeFocused();
    });
});

// spec/dialog.md, `/dialog/nested-tree`: a Dialog > a Popover > a Menu > a submenu
test.describe("dialog / nested-tree", () => {
    const dialog = (page: Page) =>
        page.getByRole("dialog", { name: "Settings" });
    const popover = (page: Page) => page.getByRole("dialog", { name: "Theme" });
    const menu = (page: Page) => page.getByRole("menu", { name: "Pick theme" });
    const submenu = (page: Page) =>
        page.getByRole("menu", { name: "More themes" });
    const button = (page: Page, name: string) =>
        page.getByRole("button", { name, exact: true });
    // a submenu trigger's recipe may add a glyph to its name
    const item = (page: Page, name: string) =>
        page.getByRole("menuitem", { name });

    /** Focus is inside the dialog's popup or one of its open descendants' popups. */
    async function expectFocusInTree(page: Page): Promise<void> {
        const inside = await page.evaluate(() => {
            const active = document.activeElement;
            return (
                active !== null &&
                active !== document.body &&
                active.closest('[role="dialog"], [role="menu"]') !== null
            );
        });
        expect(inside).toBe(true);
    }

    async function openEveryLevel(page: Page): Promise<void> {
        await button(page, "Open settings").click();
        await expect(dialog(page)).toBeVisible();
        await button(page, "Theme options").click();
        await expect(popover(page)).toBeVisible();
        await expect(button(page, "Pick theme")).toBeFocused();
        await page.keyboard.press("ArrowDown");
        await expect(item(page, "Light")).toBeFocused();
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await expect(item(page, "More themes")).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(item(page, "Solarized")).toBeFocused();
        for (const key of ["dialog", "popover", "menu", "submenu"]) {
            await expectOutput(page, key, "true");
        }
    }

    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/dialog/nested-tree");
        await openEveryLevel(page);
    });

    test("every level is open", async ({ page }) => {
        await expect(dialog(page)).toBeVisible();
        await expect(popover(page)).toBeVisible();
        await expect(menu(page)).toBeVisible();
        await expect(submenu(page)).toBeVisible();
    });

    test("Escape closes one level at a time, focus back on each level's trigger", async ({
        page,
    }) => {
        await page.keyboard.press("Escape");
        await expectOutput(page, "submenu", "false");
        await expect(submenu(page)).toBeHidden();
        await expect(item(page, "More themes")).toBeFocused();
        await expectOutput(page, "menu", "true");
        await expectFocusInTree(page);

        await page.keyboard.press("Escape");
        await expectOutput(page, "menu", "false");
        await expect(menu(page)).toBeHidden();
        await expect(button(page, "Pick theme")).toBeFocused();
        await expectOutput(page, "popover", "true");
        await expectFocusInTree(page);

        await page.keyboard.press("Escape");
        await expectOutput(page, "popover", "false");
        await expect(popover(page)).toBeHidden();
        await expect(button(page, "Theme options")).toBeFocused();
        await expectOutput(page, "dialog", "true");
        await expectFocusInTree(page);

        await page.keyboard.press("Escape");
        await expectOutput(page, "dialog", "false");
        await expect(dialog(page)).toBeHidden();
        await expect(button(page, "Open settings")).toBeFocused();
    });

    test("a press inside the popover closes the menu and its submenu only", async ({
        page,
    }) => {
        await page.getByRole("heading", { name: "Theme" }).click();
        await expectOutput(page, "menu", "false");
        await expectOutput(page, "submenu", "false");
        await expect(menu(page)).toBeHidden();
        await expect(submenu(page)).toBeHidden();
        await expectOutput(page, "popover", "true");
        await expectOutput(page, "dialog", "true");
        await expect(popover(page)).toBeVisible();
        await expectFocusInTree(page);
    });

    test("a press inside the dialog closes the popover, the menu and the submenu", async ({
        page,
    }) => {
        await page.getByRole("heading", { name: "Settings" }).click();
        await expectOutput(page, "popover", "false");
        await expectOutput(page, "menu", "false");
        await expectOutput(page, "submenu", "false");
        await expectOutput(page, "dialog", "true");
        await expect(popover(page)).toBeHidden();
        await expect(dialog(page)).toBeVisible();
        await expectFocusInTree(page);
    });

    test("a press on the backdrop closes every level", async ({ page }) => {
        await page.mouse.click(5, 5);
        for (const key of ["submenu", "menu", "popover", "dialog"]) {
            await expectOutput(page, key, "false");
        }
        await expect(dialog(page)).toBeHidden();
    });

    test("Tab out of the popover keeps focus inside the dialog", async ({
        page,
    }) => {
        await page.keyboard.press("Escape");
        await page.keyboard.press("Escape");
        await expect(button(page, "Pick theme")).toBeFocused();
        await page.keyboard.press("Tab");
        await expectOutput(page, "popover", "false");
        await expect(button(page, "Close")).toBeFocused();
        await expectOutput(page, "dialog", "true");
    });

    test("has no axe violation with every level open", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

// spec/dialog.md, `/dialog/nested-tree`: the popover's Portal is kept mounted, so its hidden
// content already sits in the page when the dialog makes the outside inert
test("dialog / nested-tree: the kept-mounted popover opens usable inside the dialog", async ({
    page,
}) => {
    await openScenario(page, "/dialog/nested-tree");
    await page
        .getByRole("button", { name: "Open settings", exact: true })
        .click();
    await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
    await page
        .getByRole("button", { name: "Theme options", exact: true })
        .click();
    const popover = page.getByRole("dialog", { name: "Theme" });
    await expect(popover).toBeVisible();
    expect(
        await popover.evaluate(
            (element) => element.closest("[inert]") === null,
        ),
    ).toBe(true);
    const pick = page.getByRole("button", { name: "Pick theme", exact: true });
    await expect(pick).toBeFocused();
    await pick.click();
    await expect(page.getByRole("menu", { name: "Pick theme" })).toBeVisible();
    await expectOutput(page, "menu", "true");
    await expectOutput(page, "popover", "true");
    await expectOutput(page, "dialog", "true");
});

// spec/dialog.md, `/dialog/nested-dialogs`
test.describe("dialog / nested-dialogs", () => {
    const named = (page: Page, name: string) =>
        page.getByRole("dialog", { name });

    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/dialog/nested-dialogs");
        for (const [opener, title] of [
            ["Open first", "First dialog"],
            ["Open second", "Second dialog"],
            ["Open third", "Third dialog"],
        ] as const) {
            await page.getByRole("button", { name: opener }).click();
            await expect(named(page, title)).toBeVisible();
        }
    });

    test("three dialogs, one backdrop", async ({ page }) => {
        await expect(page.getByRole("dialog")).toHaveCount(3);
        await expect(
            page.locator('[data-primitives-part="dialog-backdrop"]'),
        ).toHaveCount(1);
    });

    test("a press on the top viewport outside its popup closes only the top dialog", async ({
        page,
    }) => {
        await page.mouse.click(5, 5);
        await expectOutput(page, "third", "false");
        await expectOutput(page, "second", "true");
        await expectOutput(page, "first", "true");
        await expect(named(page, "Third dialog")).toBeHidden();
        await expect(named(page, "Second dialog")).toBeVisible();
        await expect(
            page.getByRole("button", { name: "Open third" }),
        ).toBeFocused();
    });

    test("Escape closes one level at a time", async ({ page }) => {
        for (const [title, opener] of [
            ["Third dialog", "Open third"],
            ["Second dialog", "Open second"],
            ["First dialog", "Open first"],
        ] as const) {
            await page.keyboard.press("Escape");
            await expect(named(page, title)).toBeHidden();
            await expect(
                page.getByRole("button", { name: opener, includeHidden: true }),
            ).toBeFocused();
        }
        await expectOutput(page, "first", "false");
    });

    test("has no axe violation with the three open", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

// spec/dialog.md, `/dialog/detached`
test.describe("dialog / detached", () => {
    const edit = (page: Page, name: string) =>
        page.getByRole("button", { name: `Edit ${name}`, includeHidden: true });

    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/dialog/detached");
    });

    test("every trigger announces the dialog, closed", async ({ page }) => {
        for (const name of ["Ada", "Grace", "Alan"]) {
            await expect(edit(page, name)).toHaveAttribute(
                "aria-haspopup",
                "dialog",
            );
            await expect(edit(page, name)).toHaveAttribute(
                "aria-expanded",
                "false",
            );
        }
    });

    test("a row's trigger opens the dialog with its payload; only it is expanded", async ({
        page,
    }) => {
        await edit(page, "Grace").click();
        const dialog = page.getByRole("dialog", { name: "Edit Grace" });
        await expect(dialog).toBeVisible();
        await expectOutput(page, "open", "true");
        await expectOutput(page, "reason", "trigger-press");
        await expectOutput(page, "trigger", "edit-grace");
        await expect(edit(page, "Grace")).toHaveAttribute(
            "aria-expanded",
            "true",
        );
        await expect(edit(page, "Grace")).toHaveAttribute(
            "aria-controls",
            (await dialog.getAttribute("id")) ?? "",
        );
        for (const name of ["Ada", "Alan"]) {
            await expect(edit(page, name)).toHaveAttribute(
                "aria-expanded",
                "false",
            );
            await expect(edit(page, name)).not.toHaveAttribute("aria-controls");
        }
    });

    test("focus returns to the opening row's trigger", async ({ page }) => {
        await edit(page, "Grace").click();
        await page.getByRole("button", { name: "Close" }).click();
        await expect(edit(page, "Grace")).toBeFocused();
        await edit(page, "Alan").click();
        await expect(
            page.getByRole("dialog", { name: "Edit Alan" }),
        ).toBeVisible();
        await expectOutput(page, "trigger", "edit-alan");
        await page.keyboard.press("Escape");
        await expect(
            page.getByRole("dialog", { name: "Edit Alan" }),
        ).toBeHidden();
        await expect(edit(page, "Alan")).toBeFocused();
    });

    test("the handle opens it from a trigger's id (imperative-action)", async ({
        page,
    }) => {
        await page.getByRole("button", { name: "Open for Grace" }).click();
        await expect(
            page.getByRole("dialog", { name: "Edit Grace" }),
        ).toBeVisible();
        await expectOutput(page, "reason", "imperative-action");
        await expectOutput(page, "trigger", "edit-grace");
        await expect(edit(page, "Grace")).toHaveAttribute(
            "aria-expanded",
            "true",
        );
        await page.keyboard.press("Escape");
        await expect(edit(page, "Grace")).toBeFocused();
    });

    test("has no axe violation while open", async ({ page }) => {
        await edit(page, "Ada").click();
        await expect(
            page.getByRole("dialog", { name: "Edit Ada" }),
        ).toBeVisible();
        await expectNoAxeViolations(page);
    });
});
