import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/carousel.md. The visible slides are asserted by index (the slides in the accessibility
// tree, the scroll offset over a slide's size), never by pixel offsets (the Epic's risk).
const region = (page: Page, name: string) =>
    page.getByRole("region", { name, exact: true });

const button = (scope: Page | Locator, name: string) =>
    scope.getByRole("button", { name, exact: true });

/** The names of the slides in the accessibility tree (the out-of-view ones are hidden). */
async function slidesInView(scope: Locator): Promise<string[]> {
    const slides = scope.getByRole("group", { name: /^\d of \d$/ });
    const names: string[] = [];
    for (const slide of await slides.all()) {
        names.push((await slide.getAttribute("aria-label")) ?? "");
    }
    return names;
}

/**
 * The slides' scroll container, which has no role: the element a control names in its
 * `aria-controls` (a Previous or Next trigger the group, a tab its slide, whose parent it is).
 */
async function itemGroup(
    scope: Locator,
    control = "Next slide",
): Promise<Locator> {
    const trigger = scope.getByRole(
        control.startsWith("Slide") ? "tab" : "button",
        {
            name: control,
            exact: true,
        },
    );
    const id = await trigger.getAttribute("aria-controls");
    const controlled = scope.page().locator(`[id="${id}"]`);
    return control.startsWith("Slide") ? controlled.locator("..") : controlled;
}

/** The slide the container is scrolled to: its scroll offset over a slide's size. */
function scrolledSlide(group: Locator, axis: "x" | "y" = "x"): Promise<number> {
    return group.evaluate((element, vertical) => {
        const first = element.firstElementChild as HTMLElement | null;
        const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0;
        const size = vertical
            ? (first?.offsetHeight ?? 1) +
              (Number.parseFloat(getComputedStyle(element).rowGap) || 0)
            : (first?.offsetWidth ?? 1) + gap;
        const offset = vertical
            ? element.scrollTop
            : Math.abs(element.scrollLeft);
        return Math.round(offset / size);
    }, axis === "y");
}

for (const dir of ["ltr", "rtl"] as const) {
    test.describe(`carousel / basic (${dir})`, () => {
        test.beforeEach(async ({ page }) => {
            await openScenario(
                page,
                "/carousel/basic",
                dir === "rtl" ? { dir } : {},
            );
        });

        test("a region of slides, one in view", async ({ page }) => {
            const carousel = region(page, "Featured");
            await expect(carousel).toHaveAttribute(
                "aria-roledescription",
                "carousel",
            );
            expect(await slidesInView(carousel)).toEqual(["1 of 4"]);
            const slide = carousel.getByRole("group", { name: "1 of 4" });
            await expect(slide).toHaveAttribute(
                "aria-roledescription",
                "slide",
            );
            const group = await itemGroup(carousel);
            expect(await scrolledSlide(group)).toBe(0);
            await expect(group).toHaveAttribute("aria-live", "polite");
            await expect(button(carousel, "Previous slide")).toBeDisabled();
            await expect(button(carousel, "Slide 1")).toHaveAttribute(
                "aria-disabled",
                "true",
            );
            await expect(button(carousel, "Slide 2")).not.toHaveAttribute(
                "aria-disabled",
            );
            await expectOutput(page, "page", "none");
        });

        test("Next moves a page, and is disabled on the last", async ({
            page,
        }) => {
            const carousel = region(page, "Featured");
            await button(carousel, "Next slide").click();
            await expectOutput(page, "page", "1");
            await expectOutput(page, "reason", "next-press");
            expect(await slidesInView(carousel)).toEqual(["2 of 4"]);
            const group = await itemGroup(carousel);
            await expect.poll(() => scrolledSlide(group)).toBe(1);
            await button(carousel, "Next slide").click();
            await button(carousel, "Next slide").click();
            await expectOutput(page, "page", "3");
            await expect(button(carousel, "Next slide")).toBeDisabled();
            await expect.poll(() => scrolledSlide(group)).toBe(3);
            await button(carousel, "Previous slide").click();
            await expectOutput(page, "page", "2");
            await expectOutput(page, "reason", "previous-press");
        });

        test("an Indicator picks a page; the current one does nothing", async ({
            page,
        }) => {
            const carousel = region(page, "Featured");
            await button(carousel, "Slide 2").click();
            await expectOutput(page, "page", "1");
            await expectOutput(page, "reason", "item-press");
            await expect(button(carousel, "Slide 2")).toHaveAttribute(
                "aria-disabled",
                "true",
            );
            await button(carousel, "Next slide").click();
            await expectOutput(page, "reason", "next-press");
            await button(carousel, "Slide 3").click({ force: true });
            await expectOutput(page, "page", "2");
            await expectOutput(page, "reason", "next-press");
        });

        test("a scroll the user made settles on its page", async ({ page }) => {
            const carousel = region(page, "Featured");
            const group = await itemGroup(carousel);
            await group.evaluate((element, rtl) => {
                const first = element.firstElementChild as HTMLElement;
                element.scrollTo({
                    left: first.offsetWidth * 2 * (rtl ? -1 : 1),
                    behavior: "instant",
                });
            }, dir === "rtl");
            await expectOutput(page, "page", "2");
            await expectOutput(page, "reason", "swipe");
            expect(await slidesInView(carousel)).toEqual(["3 of 4"]);
        });

        test("a mouse drag moves to the next page", async ({ page }) => {
            const carousel = region(page, "Featured");
            const slide = carousel.getByRole("group", { name: "1 of 4" });
            const box = await slide.boundingBox();
            if (box === null) {
                throw new Error("no slide box");
            }
            const y = box.y + box.height / 2;
            const x = box.x + box.width / 2;
            const sign = dir === "rtl" ? 1 : -1;
            await page.mouse.move(x, y);
            await page.mouse.down();
            for (let step = 1; step <= 10; step++) {
                await page.mouse.move(x + sign * box.width * 0.06 * step, y);
            }
            await page.waitForTimeout(150);
            await page.mouse.up();
            await expectOutput(page, "page", "1");
            await expectOutput(page, "reason", "drag");
            const group = await itemGroup(carousel);
            await expect.poll(() => scrolledSlide(group)).toBe(1);
        });

        test("the slides run from the inline start", async ({ page }) => {
            const carousel = region(page, "Featured");
            const group = await itemGroup(carousel);
            const order = await group.evaluate((element) => {
                const [first, second] = [...element.children].map((child) =>
                    child.getBoundingClientRect(),
                );
                return (first?.left ?? 0) < (second?.left ?? 0) ? "ltr" : "rtl";
            });
            expect(order).toBe(dir);
            await button(carousel, "Next slide").click();
            await expect.poll(() => scrolledSlide(group)).toBe(1);
            expect(await slidesInView(carousel)).toEqual(["2 of 4"]);
        });

        test("has no axe violation", async ({ page }) => {
            await expectNoAxeViolations(page);
        });
    });
}

test.describe("carousel / autoplay", () => {
    test.beforeEach(async ({ page }) => {
        await page.clock.install();
        await openScenario(page, "/carousel/autoplay");
    });

    test("rotates every delay, wrapping at the end", async ({ page }) => {
        const carousel = region(page, "Highlights");
        await expect(button(carousel, "Stop slide rotation")).toBeVisible();
        await expect(carousel).toHaveAttribute("data-playing", "");
        const group = await itemGroup(carousel);
        await expect(group).toHaveAttribute("aria-live", "off");
        await page.clock.fastForward(2500);
        await expectOutput(page, "page", "none");
        await page.clock.fastForward(1000);
        await expectOutput(page, "page", "1");
        await expectOutput(page, "reason", "autoplay");
        expect(await slidesInView(carousel)).toEqual(["2 of 3"]);
        await page.clock.fastForward(3500);
        await expectOutput(page, "page", "2");
        await page.clock.fastForward(3500);
        await expectOutput(page, "page", "0");
    });

    test("a hover pauses it, leaving resumes it with the time it had left", async ({
        page,
    }) => {
        const carousel = region(page, "Highlights");
        await page.clock.fastForward(1000);
        const slide = carousel.getByRole("group", { name: "1 of 3" });
        await slide.hover();
        await expect(carousel).toHaveAttribute("data-paused", "");
        await page.clock.fastForward(5000);
        await expectOutput(page, "page", "none");
        await page.mouse.move(0, 0);
        await expect(carousel).not.toHaveAttribute("data-paused");
        await page.clock.fastForward(1500);
        await expectOutput(page, "page", "none");
        await page.clock.fastForward(1000);
        await expectOutput(page, "page", "1");
        await expectOutput(page, "playing", "none");
    });

    test("focus entering it stops it; the trigger starts it again", async ({
        page,
    }) => {
        const carousel = region(page, "Highlights");
        await button(carousel, "Stop slide rotation").focus();
        await expectOutput(page, "playing", "false");
        await expectOutput(page, "playingReason", "focus-in");
        await expect(button(carousel, "Start slide rotation")).toBeFocused();
        const group = await itemGroup(carousel);
        await expect(group).toHaveAttribute("aria-live", "polite");
        await page.clock.fastForward(6000);
        await expectOutput(page, "page", "none");
        await button(carousel, "Start slide rotation").click();
        await expectOutput(page, "playing", "true");
        await expectOutput(page, "playingReason", "trigger-press");
        await expect(group).toHaveAttribute("aria-live", "off");
        await page.clock.fastForward(3500);
        await expectOutput(page, "page", "1");
        await expectOutput(page, "reason", "autoplay");
        await button(carousel, "Stop slide rotation").click();
        await expectOutput(page, "playing", "false");
        await expectOutput(page, "playingReason", "trigger-press");
        await page.clock.fastForward(6000);
        await expectOutput(page, "page", "1");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

for (const dir of ["ltr", "rtl"] as const) {
    test.describe(`carousel / tabbed (${dir})`, () => {
        test.beforeEach(async ({ page }) => {
            await openScenario(
                page,
                "/carousel/tabbed",
                dir === "rtl" ? { dir } : {},
            );
        });

        const tab = (page: Page, name: string) =>
            page.getByRole("tab", { name, exact: true });

        test("a tablist of slides, each a tabpanel", async ({ page }) => {
            const carousel = region(page, "Features");
            const list = carousel.getByRole("tablist", {
                name: "Choose slide to display",
            });
            await expect(list.getByRole("tab")).toHaveCount(3);
            await expect(tab(page, "Slide 1")).toHaveAttribute(
                "aria-selected",
                "true",
            );
            await expect(tab(page, "Slide 1")).toHaveAttribute("tabindex", "0");
            await expect(tab(page, "Slide 2")).toHaveAttribute(
                "tabindex",
                "-1",
            );
            const panel = carousel.getByRole("tabpanel", { name: "1 of 3" });
            await expect(panel).toBeVisible();
            const id = await panel.getAttribute("id");
            await expect(tab(page, "Slide 1")).toHaveAttribute(
                "aria-controls",
                id ?? "",
            );
            await expect(carousel.getByRole("tabpanel")).toHaveCount(1);
        });

        test("the arrows, Home and End select the tabs", async ({ page }) => {
            const next = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
            await tab(page, "Slide 1").focus();
            await page.keyboard.press(next);
            await expect(tab(page, "Slide 2")).toBeFocused();
            await expect(tab(page, "Slide 2")).toHaveAttribute(
                "aria-selected",
                "true",
            );
            await expectOutput(page, "page", "1");
            await expectOutput(page, "reason", "keyboard");
            await page.keyboard.press("End");
            await expect(tab(page, "Slide 3")).toBeFocused();
            await expectOutput(page, "page", "2");
            await page.keyboard.press(next);
            await expect(tab(page, "Slide 1")).toBeFocused();
            await expectOutput(page, "page", "0");
            await page.keyboard.press("Home");
            await expect(tab(page, "Slide 1")).toBeFocused();
            const carousel = region(page, "Features");
            const group = await itemGroup(carousel, "Slide 1");
            await expect.poll(() => scrolledSlide(group)).toBe(0);
        });

        test("a click selects a tab", async ({ page }) => {
            await tab(page, "Slide 3").click();
            await expectOutput(page, "page", "2");
            await expectOutput(page, "reason", "item-press");
            const carousel = region(page, "Features");
            await expect(
                carousel.getByRole("tabpanel", { name: "3 of 3" }),
            ).toBeVisible();
        });

        test("has no axe violation", async ({ page }) => {
            await expectNoAxeViolations(page);
        });
    });
}

test.describe("carousel / multiple", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/carousel/multiple");
    });

    test("pages of two slides, the last one full", async ({ page }) => {
        const carousel = region(page, "Products");
        expect(await slidesInView(carousel)).toEqual(["1 of 5", "2 of 5"]);
        await button(carousel, "Next slide").click();
        await expectOutput(page, "page", "1");
        expect(await slidesInView(carousel)).toEqual(["3 of 5", "4 of 5"]);
        await button(carousel, "Next slide").click();
        await expectOutput(page, "page", "2");
        expect(await slidesInView(carousel)).toEqual(["4 of 5", "5 of 5"]);
        await expect(button(carousel, "Next slide")).toBeDisabled();
        const group = await itemGroup(carousel);
        await expect.poll(() => scrolledSlide(group)).toBe(3);
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("carousel / vertical", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/carousel/vertical");
    });

    test("scrolls vertically and loops", async ({ page }) => {
        const carousel = region(page, "Stories");
        expect(await slidesInView(carousel)).toEqual(["1 of 3"]);
        const group = await itemGroup(carousel);
        expect(await scrolledSlide(group, "y")).toBe(0);
        await expect(button(carousel, "Previous slide")).toBeEnabled();
        await button(carousel, "Previous slide").click();
        await expectOutput(page, "page", "2");
        await expectOutput(page, "reason", "previous-press");
        await expect.poll(() => scrolledSlide(group, "y")).toBe(2);
        await button(carousel, "Next slide").click();
        await expectOutput(page, "page", "0");
        await expect.poll(() => scrolledSlide(group, "y")).toBe(0);
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
