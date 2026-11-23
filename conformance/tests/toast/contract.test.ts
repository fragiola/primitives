import { expect, type Page, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { settleAnimations } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";
import { cssVariable, mouseDrag } from "../../src/swipe.ts";

// spec/toast.md: anatomy, the live regions and the order of their announcements (axe cannot check
// them), the queue's state attributes and the stacking variables

const button = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });

async function open(page: Page, path: string) {
    await page.clock.install();
    await openScenario(page, path);
    await expect(part(page, "toast", "viewport")).toBeAttached();
}

/** Records the text of every announcement inserted into the live regions, in insertion order. */
async function recordAnnouncements(page: Page) {
    await page.evaluate(() => {
        const log: string[] = [];
        (window as unknown as { announced: string[] }).announced = log;
        const observer = new MutationObserver((records) => {
            for (const record of records) {
                for (const node of record.addedNodes) {
                    if (
                        node instanceof HTMLElement &&
                        node.dataset.primitivesPart === "toast-announcement"
                    ) {
                        const live =
                            node.parentElement?.getAttribute("aria-live");
                        log.push(`${live}: ${node.textContent}`);
                    }
                }
            }
        });
        for (const region of document.querySelectorAll(
            '[data-primitives-part="toast-announcer"]',
        )) {
            observer.observe(region, { childList: true });
        }
    });
    return () =>
        page.evaluate(
            () => (window as unknown as { announced: string[] }).announced,
        );
}

test("toast / basic: the region and its two live regions, before any toast", async ({
    page,
}) => {
    await open(page, "/toast/basic");
    const viewport = part(page, "toast", "viewport");
    await expect(viewport).toHaveAttribute("role", "region");
    await expect(viewport).toHaveAttribute("tabindex", "-1");
    await expect(viewport).toHaveAttribute("aria-label", "Notifications");
    const announcers = part(page, "toast", "announcer");
    await expect(announcers).toHaveCount(2);
    const polite = announcers.nth(0);
    const assertive = announcers.nth(1);
    await expect(polite).toHaveAttribute("aria-live", "polite");
    await expect(polite).toHaveAttribute("data-priority", "low");
    await expect(assertive).toHaveAttribute("aria-live", "assertive");
    await expect(assertive).toHaveAttribute("data-priority", "high");
    for (const region of [polite, assertive]) {
        await expect(region).toHaveAttribute("aria-atomic", "false");
        await expect(region).toHaveAttribute("aria-relevant", "additions text");
        await expect(region).toBeEmpty();
    }
    // the live regions come first in the region
    expect(
        await viewport.evaluate((element) =>
            [...element.children]
                .slice(0, 2)
                .map((child) => child.getAttribute("aria-live")),
        ),
    ).toEqual(["polite", "assertive"]);
    await expect(part(page, "toast", "root")).toHaveCount(0);
});

test("toast / basic: announcements go to their priority's region, in the order they show", async ({
    page,
}) => {
    await open(page, "/toast/basic");
    const announced = await recordAnnouncements(page);
    await button(page, "Show toast").click();
    await expect(part(page, "toast", "root")).toHaveCount(1);
    await button(page, "Show alert").click();
    await expect(part(page, "toast", "root")).toHaveCount(2);
    await button(page, "Show toast").click();
    await expect(part(page, "toast", "root")).toHaveCount(3);
    expect(await announced()).toEqual([
        "polite: Saved Your draft was saved.",
        "assertive: Connection lost Retrying in 5 seconds.",
        "polite: Saved Your draft was saved.",
    ]);
    // the toasts themselves are not live: nothing is announced twice
    await expect(
        part(page, "toast", "root").and(page.locator("[aria-live]")),
    ).toHaveCount(0);
    await button(page, "Close all").click();
    await expect(part(page, "toast", "announcement")).toHaveCount(0);
});

test("toast / basic: the parts of a toast", async ({ page }) => {
    await open(page, "/toast/basic");
    await button(page, "Show toast").click();
    const root = part(page, "toast", "root");
    await expect(root).toHaveAttribute("role", "dialog");
    await expect(root).toHaveAttribute("aria-modal", "false");
    await expect(root).toHaveAttribute("tabindex", "0");
    const title = part(page, "toast", "title");
    const description = part(page, "toast", "description");
    await expect(title).toHaveText("Saved");
    await expect(description).toHaveText("Your draft was saved.");
    expect(await title.evaluate((element) => element.tagName)).toBe("H2");
    expect(await description.evaluate((element) => element.tagName)).toBe("P");
    await expect(root).toHaveAttribute(
        "aria-labelledby",
        (await title.getAttribute("id")) as string,
    );
    await expect(root).toHaveAttribute(
        "aria-describedby",
        (await description.getAttribute("id")) as string,
    );
    await expect(part(page, "toast", "action")).toHaveAttribute(
        "type",
        "button",
    );
    await expect(part(page, "toast", "close")).toHaveAttribute(
        "type",
        "button",
    );
    expect(await cssVariable(root, "--toast-index")).toBe("0");
    await expect(root).not.toHaveAttribute("data-limited");
    await expectNoFalseStates(parts(page, "toast"));
    await button(page, "Show alert").click();
    await expect(part(page, "toast", "root").first()).toHaveAttribute(
        "role",
        "alertdialog",
    );
});

test("toast / limit: queued toasts, the stacking variables and the expanded stack", async ({
    page,
}) => {
    await open(page, "/toast/limit");
    for (let index = 0; index < 3; index += 1) {
        await button(page, "Notify").click();
    }
    const roots = part(page, "toast", "root");
    await expect(roots).toHaveCount(3);
    const [third, second, first] = [roots.nth(0), roots.nth(1), roots.nth(2)];
    await expect(third).toContainText("Notification 3");
    await expect(first).toContainText("Notification 1");
    await expect(first).toHaveAttribute("data-limited", "");
    await expect(first).toHaveAttribute("inert", "");
    await expect(second).not.toHaveAttribute("data-limited");
    expect(await cssVariable(third, "--toast-index")).toBe("0");
    expect(await cssVariable(second, "--toast-index")).toBe("1");
    // each one measured; the offset is the heights in front of it
    await expect
        .poll(() => cssVariable(third, "--toast-height"))
        .toMatch(/^\d+(\.\d+)?px$/);
    const height = Number.parseFloat(
        await cssVariable(third, "--toast-height"),
    );
    expect(await cssVariable(third, "--toast-offset-y")).toBe("0px");
    expect(
        Number.parseFloat(await cssVariable(second, "--toast-offset-y")),
    ).toBeCloseTo(height, 0);
    const viewport = part(page, "toast", "viewport");
    expect(
        Number.parseFloat(
            await cssVariable(viewport, "--toast-frontmost-height"),
        ),
    ).toBeCloseTo(height, 0);
    // a queued toast is not announced
    await expect(part(page, "toast", "announcement")).toHaveCount(2);

    await expect(viewport).not.toHaveAttribute("data-expanded");
    await third.hover();
    await expect(viewport).toHaveAttribute("data-expanded", "");
    await expect(third).toHaveAttribute("data-expanded", "");
    await expect(second).toHaveAttribute("data-expanded", "");
    await page.mouse.move(0, 0);
    await expect(viewport).not.toHaveAttribute("data-expanded");

    await third.getByRole("button", { name: "Dismiss" }).focus();
    await page.keyboard.press("Enter");
    await expect(roots).toHaveCount(2);
    await expect(roots.nth(1)).toContainText("Notification 1");
    await expect(roots.nth(1)).not.toHaveAttribute("data-limited");
    await expect(roots.nth(1)).not.toHaveAttribute("inert");
    expect(await cssVariable(roots.nth(1), "--toast-index")).toBe("1");
    await expect(part(page, "toast", "announcement")).toHaveCount(2);
});

test("toast / promise: data-type follows the promise, and the announcement its text", async ({
    page,
}) => {
    await open(page, "/toast/promise");
    await button(page, "Save file").click();
    const root = part(page, "toast", "root");
    await expect(root).toHaveAttribute("data-type", "loading");
    await expect(part(page, "toast", "close")).toHaveAttribute(
        "data-type",
        "loading",
    );
    await expect(part(page, "toast", "announcement")).toHaveText("Saving file");
    await page.clock.fastForward(1100);
    await expect(root).toHaveAttribute("data-type", "success");
    await expect(part(page, "toast", "announcement")).toHaveText("File saved");
});

test("toast / swipe: data-swiping, the direction and the movement while it moves", async ({
    page,
}) => {
    await open(page, "/toast/swipe");
    await button(page, "Notify").click();
    const root = part(page, "toast", "root");
    await expect(root).toBeVisible();
    await expect(root).not.toHaveAttribute("data-swiping");
    await expect(root).not.toHaveAttribute("data-swipe-direction");
    // the drag starts on the toast once its enter transition has placed it
    await settleAnimations(page);
    const release = await mouseDrag(
        page,
        root.getByText("Drag to dismiss"),
        30,
        0,
        { hold: true },
    );
    await expect(root).toHaveAttribute("data-swiping", "");
    await expect(root).toHaveAttribute("data-swipe-direction", "right");
    expect(
        Number.parseFloat(await cssVariable(root, "--toast-swipe-movement-x")),
    ).toBeGreaterThan(20);
    expect(await cssVariable(root, "--toast-swipe-movement-y")).toBe("0px");
    await release();
    await expect(root).not.toHaveAttribute("data-swiping");
    await expect(root).not.toHaveAttribute("data-swipe-direction");
    expect(await cssVariable(root, "--toast-swipe-movement-x")).toBe("0px");
});
