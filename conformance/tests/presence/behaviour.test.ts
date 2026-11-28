import { expect, type Page, test } from "@playwright/test";
import {
    isSameElement,
    keyframeExit,
    markElement,
    recordExit,
    settleAnimations,
    slowMotion,
} from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/dialog.md and popover.md, "Animation": every overlay's popup stays mounted with `data-ending-style` until
// its exit transition has finished, then unmounts; reopened during that exit, it is the same
// element again; it unmounts before the next paint once its exit has finished (README,
// "Lifecycle"). The recipes animate opacity and scale over `--pr-motion`.

interface Overlay {
    path: string;
    part: string;
    open: (page: Page) => Promise<void>;
    /** Opens it again during its exit (default: as `open`). */
    reopen?: (page: Page) => Promise<void>;
    /** Options of the scenario (the calendars fix "today"). */
    today?: boolean;
}

const press = (name: string) => async (page: Page) => {
    await page.getByRole("button", { name }).click();
};

const OVERLAYS: Record<string, Overlay> = {
    dialog: {
        path: "/dialog/basic",
        part: "dialog-popup",
        open: press("Open dialog"),
        // the exiting backdrop still covers the page: the keyboard, from the trigger focus returned to
        reopen: async (page) => {
            await page.keyboard.press("Enter");
        },
    },
    popover: {
        path: "/popover/basic",
        part: "popover-popup",
        open: press("Open popover"),
    },
    tooltip: {
        path: "/tooltip/basic",
        part: "tooltip-popup",
        // a hover (a focus opens it at once, `data-instant`, which the recipe does not animate)
        open: async (page) => {
            await page.mouse.move(0, 0);
            await page.getByRole("button", { name: "Save" }).hover();
            await expect(page.getByRole("tooltip")).toBeVisible();
        },
    },
    menu: { path: "/menu/basic", part: "menu-popup", open: press("Actions") },
    select: {
        path: "/select/basic",
        part: "select-popup",
        open: async (page) => {
            await page.getByRole("combobox", { name: "Fruit" }).click();
        },
    },
    combobox: {
        path: "/combobox/basic",
        part: "combobox-popup",
        open: press("Show fruits"),
    },
    "date-picker": {
        path: "/date-picker/basic",
        part: "date-picker-popup",
        open: press("Choose date"),
        today: true,
    },
    "date-range-picker": {
        path: "/date-picker/range",
        part: "date-range-picker-popup",
        open: press("Choose dates"),
        today: true,
    },
};

const popup = (page: Page, part: string) =>
    page.locator(`[data-primitives-part="${part}"]`);

for (const [name, overlay] of Object.entries(OVERLAYS)) {
    test.describe(`presence / ${name}`, () => {
        test.beforeEach(async ({ page }) => {
            await openScenario(page, overlay.path, { today: overlay.today });
        });

        test("plays its exit transition before it unmounts", async ({
            page,
        }) => {
            await slowMotion(page, 600);
            await overlay.open(page);
            await expect(popup(page, overlay.part)).toBeVisible();
            // closed once its enter transition is over: a transition reversed at its start has
            // nothing left to animate
            await settleAnimations(page);
            const exit = await recordExit(page, overlay.part);
            await page.keyboard.press("Escape");
            await expect(popup(page, overlay.part)).toHaveCount(0);
            const record = await exit();
            expect(record.ending).toBe(true);
            expect(record.running).toBeGreaterThan(0);
            // the transition lasts 600ms: the popup stayed for most of it
            expect(record.unmountedAfter).toBeGreaterThanOrEqual(400);
            // unmounted in the frame its transition ended (spec/README.md, "Lifecycle")
            expect(record.paintedAfterEnd).toEqual([]);
        });

        test("a keyframe exit is never painted at rest before it unmounts", async ({
            page,
        }) => {
            // spec/README.md, "Lifecycle": an `animation-fill-mode: none` exit is back at opacity
            // 1 once it ends, so a frame painted before the unmount would show the popup again
            await slowMotion(page, 300);
            await keyframeExit(page, overlay.part);
            await overlay.open(page);
            await expect(popup(page, overlay.part)).toBeVisible();
            await settleAnimations(page);
            const exit = await recordExit(page, overlay.part);
            await page.keyboard.press("Escape");
            await expect(popup(page, overlay.part)).toHaveCount(0);
            const record = await exit();
            expect(record.ending).toBe(true);
            expect(record.running).toBeGreaterThan(0);
            expect(record.unmountedAfter).toBeGreaterThanOrEqual(200);
            expect(record.paintedAfterEnd).toEqual([]);
        });

        test("reopened during its exit, it is the same element, open again", async ({
            page,
        }) => {
            // long enough for a tooltip's hover delay to end inside the exit
            await slowMotion(page, 2000);
            await overlay.open(page);
            await expect(popup(page, overlay.part)).toBeVisible();
            await settleAnimations(page);
            await markElement(page, overlay.part);
            await page.keyboard.press("Escape");
            await expect(popup(page, overlay.part)).toHaveAttribute(
                "data-ending-style",
            );
            await (overlay.reopen ?? overlay.open)(page);
            await expect(popup(page, overlay.part)).toHaveAttribute(
                "data-open",
            );
            await expect(popup(page, overlay.part)).not.toHaveAttribute(
                "data-ending-style",
            );
            expect(await isSameElement(page, overlay.part)).toBe(true);
            // it stays: the cancelled exit never unmounts it
            await page.waitForTimeout(2200);
            await expect(popup(page, overlay.part)).toBeVisible();
        });
    });
}
