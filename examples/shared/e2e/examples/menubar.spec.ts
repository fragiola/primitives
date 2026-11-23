import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
    settleAnimations,
} from "../helpers.ts";

// menubar: an app menu bar (spec/menubar.md). A Menubar "Application" of the Menus "File" (New
// file, a submenu "Open recent", Save, Export disabled), "Edit" (Undo, Redo, Cut, Copy, Paste)
// and "View" (checkbox items "Show ruler" and "Word wrap", radio items under "Zoom"), and a
// summary of the last command and the View options. Non-modal: never promoted.

test("the bar is one tab stop of menu items; the arrows move between them", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "menubar" });
    const bar = frame.getByRole("menubar", { name: "Application" });
    const item = (name: string) => bar.getByRole("menuitem", { name });
    await expect(bar).toHaveAttribute("data-primitives-part", "menubar-root");
    await expect(bar).toHaveAttribute("aria-orientation", "horizontal");
    await expect(bar.getByRole("menuitem")).toHaveCount(3);
    for (const name of ["File", "Edit", "View"]) {
        await expect(item(name)).toHaveAttribute("aria-haspopup", "menu");
        await expect(item(name)).toHaveAttribute("aria-expanded", "false");
    }
    await expect(bar.locator('[tabindex="0"]')).toHaveCount(1);
    await expect(item("File")).toHaveAttribute("tabindex", "0");

    await item("File").focus();
    await page.keyboard.press("ArrowRight");
    await expect(item("Edit")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(item("View")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(item("File")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(item("View")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(item("File")).toBeFocused();
    await page.keyboard.press("End");
    await expect(item("View")).toBeFocused();
    await expect(bar.locator('[tabindex="0"]')).toHaveCount(1);
    await expect(item("View")).toHaveAttribute("tabindex", "0");
    await expect(frame.getByRole("menu")).toHaveCount(0);
    expect(errors).toEqual([]);
});

test("ArrowDown opens a menu; the arrows then move from menu to menu; Escape returns", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "menubar" });
    const bar = frame.getByRole("menubar", { name: "Application" });
    const item = (name: string) => bar.getByRole("menuitem", { name });
    await item("File").focus();
    await page.keyboard.press("ArrowDown");
    const file = frame.getByRole("menu", { name: "File" });
    await expect(file).toBeVisible();
    await expect(item("File")).toHaveAttribute("aria-expanded", "true");
    await expect(
        file.getByRole("menuitem", { name: "New file" }),
    ).toBeFocused();
    // on an item that opens no submenu, ArrowRight moves to the next menu, focus on its item
    await page.keyboard.press("ArrowRight");
    await expect(frame.getByRole("menu", { name: "Edit" })).toBeVisible();
    await expect(file).toHaveCount(0);
    await expect(item("Edit")).toBeFocused();
    await expect(item("Edit")).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("ArrowRight");
    await expect(frame.getByRole("menu", { name: "View" })).toBeVisible();
    await expect(item("View")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(
        frame.getByRole("menuitemcheckbox", { name: "Show ruler" }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(frame.getByRole("menu")).toHaveCount(0);
    await expect(item("View")).toBeFocused();
    expect(await promoted(page)).toBe(false);
});

test("a submenu opens with ArrowRight, and its item runs and closes every level", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "menubar" });
    const bar = frame.getByRole("menubar", { name: "Application" });
    await bar.getByRole("menuitem", { name: "File" }).focus();
    await page.keyboard.press("Enter");
    const file = frame.getByRole("menu", { name: "File" });
    await page.keyboard.press("ArrowDown");
    const recent = file.getByRole("menuitem", { name: "Open recent" });
    await expect(recent).toBeFocused();
    await expect(recent).toHaveAttribute("aria-haspopup", "menu");
    await page.keyboard.press("ArrowRight");
    const submenu = frame.getByRole("menu", { name: "Open recent" });
    await expect(submenu).toBeVisible();
    await expect(
        submenu.getByRole("menuitem", { name: "notes.md" }),
    ).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(frame.getByRole("menu")).toHaveCount(0);
    await expect(bar.getByRole("menuitem", { name: "File" })).toBeFocused();
    await expect(frame.getByText("Open budget.csv")).toBeVisible();
});

test("once a menu is open, hovering another item switches to its menu", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "menubar" });
    const bar = frame.getByRole("menubar", { name: "Application" });
    const item = (name: string) => bar.getByRole("menuitem", { name });
    // with no menu open, hovering opens nothing
    await item("Edit").hover();
    await expect(frame.getByRole("menu")).toHaveCount(0);
    await item("File").click();
    await expect(frame.getByRole("menu", { name: "File" })).toBeVisible();
    await item("Edit").hover();
    await expect(frame.getByRole("menu", { name: "Edit" })).toBeVisible();
    await expect(frame.getByRole("menu", { name: "File" })).toHaveCount(0);
    await expect(item("Edit")).toHaveAttribute("tabindex", "0");
    await frame.getByRole("menuitem", { name: "Copy" }).click();
    await expect(frame.getByRole("menu")).toHaveCount(0);
    await expect(frame.getByText("Copy", { exact: true })).toBeVisible();
});

test("View's checkbox and radio items keep the menu open on a click", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "menubar" });
    await frame
        .getByRole("menubar", { name: "Application" })
        .getByRole("menuitem", { name: "View" })
        .click();
    const view = frame.getByRole("menu", { name: "View" });
    const checkbox = (name: string) =>
        view.getByRole("menuitemcheckbox", { name });
    const radio = (name: string) => view.getByRole("menuitemradio", { name });
    await expect(checkbox("Show ruler")).toHaveAttribute(
        "aria-checked",
        "true",
    );
    await expect(checkbox("Word wrap")).toHaveAttribute(
        "aria-checked",
        "false",
    );
    await expect(radio("100%")).toHaveAttribute("aria-checked", "true");
    await checkbox("Word wrap").click();
    await expect(checkbox("Word wrap")).toHaveAttribute("aria-checked", "true");
    await radio("150%").click();
    await expect(radio("150%")).toHaveAttribute("aria-checked", "true");
    await expect(radio("100%")).toHaveAttribute("aria-checked", "false");
    await expect(view).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(view).toHaveCount(0);
    await expect(
        frame.getByRole("definition").filter({ hasText: /^on$/ }),
    ).toHaveCount(1);
    await expect(frame.getByText("150%")).toBeVisible();
    expect(errors).toEqual([]);
});

test("axe finds no violation, at rest and with a menu open", async ({
    page,
}) => {
    requireExamples("menubar");
    await page.goto(`${EMBED_BASE}?id=menubar`);
    await expect(page.getByRole("menubar")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    await page.getByRole("menuitem", { name: "View" }).click();
    await expect(page.getByRole("menu", { name: "View" })).toBeVisible();
    await settleAnimations(page);
    expect(await axeViolations(page)).toEqual([]);
});
