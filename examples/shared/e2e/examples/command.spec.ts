import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
} from "../helpers.ts";

// command: an app's command menu (spec/command.md, "The Command dialog"). A Command in a modal
// Dialog that the example's own Ctrl+K (⌘K) toggles: inside the site's frame its overlay is
// promoted over the page, as Dialog's. Groups "Navigation" (Home, Settings, Profile) and
// "Actions" (Change theme…, Copy link, Delete project disabled); "Change theme…" opens the
// "theme" page (Light, Dark, System); running a command prints "Ran: <value>".

test("Ctrl+K opens the menu; typing filters by name and keywords; Enter runs", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "command" });
    const trigger = frame.getByRole("button", { name: "Open command menu" });
    await trigger.focus();
    await page.keyboard.press("ControlOrMeta+k");
    const dialog = frame.getByRole("dialog", { name: "Command menu" });
    await expect(dialog).toBeVisible();
    await expect.poll(() => promoted(page)).toBe(true);
    const input = frame.getByRole("combobox", { name: "Command" });
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute(
        "data-primitives-part",
        "command-input",
    );
    await expect(frame.getByRole("option")).toHaveText([
        "Home",
        "Settings",
        "Profile",
        "Change theme…",
        "Copy link",
        "Delete project",
    ]);
    await expect(frame.getByRole("option", { name: "Home" })).toHaveAttribute(
        "aria-selected",
        "true",
    );

    // a keyword: "account" finds Profile; the empty group hides
    await page.keyboard.type("account");
    await expect(frame.getByRole("option")).toHaveText(["Profile"]);
    await expect(frame.getByText("Actions")).toBeHidden();
    await page.keyboard.press("Enter");
    await expect(dialog).toHaveCount(0);
    await expect(frame.getByRole("status")).toHaveText("Ran: Profile");
    await expect(trigger).toBeFocused();
    await expect.poll(() => promoted(page)).toBe(false);

    // the arrows move the highlight while focus stays in the input
    await page.keyboard.press("ControlOrMeta+k");
    await expect(input).toBeFocused();
    await expect(input).toHaveValue("");
    await page.keyboard.press("ArrowDown");
    await expect(
        frame.getByRole("option", { name: "Settings" }),
    ).toHaveAttribute("aria-selected", "true");
    // End: the last shown command, disabled ones included; Enter runs nothing there
    await page.keyboard.press("End");
    await expect(
        frame.getByRole("option", { name: "Delete project" }),
    ).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(frame.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("ArrowUp");
    await expect(input).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(frame.getByRole("dialog")).toHaveCount(0);
    await expect(frame.getByRole("status")).toHaveText("Ran: Copy link");
    expect(errors).toEqual([]);
});

test("a nested page opens, Backspace on the empty input goes back, Escape closes", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "command" });
    const trigger = frame.getByRole("button", { name: "Open command menu" });
    await trigger.click();
    const input = frame.getByRole("combobox", { name: "Command" });
    await expect(input).toBeFocused();
    await page.keyboard.type("theme");
    await expect(frame.getByRole("option")).toHaveText(["Change theme…"]);
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("");
    await expect(frame.getByRole("option")).toHaveText([
        "Light",
        "Dark",
        "System",
    ]);
    await page.keyboard.press("Backspace");
    await expect(frame.getByRole("option").first()).toHaveText("Home");

    await page.keyboard.type("zzz");
    await expect(frame.getByRole("option")).toHaveCount(0);
    await expect(frame.getByText("No results.")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(frame.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();

    // a click runs a command; the page of themes runs one too
    await trigger.click();
    await frame.getByRole("option", { name: "Change theme…" }).click();
    await frame.getByRole("option", { name: "Dark" }).click();
    await expect(frame.getByRole("dialog")).toHaveCount(0);
    await expect(frame.getByRole("status")).toHaveText("Ran: Dark");
});

test("axe finds no violation with the menu open", async ({ page }) => {
    requireExamples("command");
    await page.goto(`${EMBED_BASE}?id=command`);
    await page.getByRole("button", { name: "Open command menu" }).click();
    await expect(page.getByRole("combobox", { name: "Command" })).toBeFocused();
    await page.keyboard.type("s");
    expect(await axeViolations(page)).toEqual([]);
});
