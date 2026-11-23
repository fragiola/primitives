import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import {
    scrollbar,
    scrollMetrics,
    scrollRoot,
    scrollViewportTo,
    viewport,
} from "../../src/scroll-area.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("scroll area / basic", async ({ page }) => {
    await openScenario(page, "/scroll-area/basic");
    await expect(
        scrollbar(scrollRoot(page, "Changelog"), "vertical"),
    ).toHaveCount(1);
    await expectScreen(page, "scroll-area-basic");
});

test("scroll area / basic, scrolled to the middle", async ({ page }) => {
    await openScenario(page, "/scroll-area/basic");
    const view = viewport(page, "Changelog");
    await expect(
        scrollbar(scrollRoot(page, "Changelog"), "horizontal"),
    ).toHaveCount(1);
    const metrics = await scrollMetrics(view);
    await scrollViewportTo(view, {
        top: Math.round(metrics.maxY / 2),
        left: Math.round(metrics.maxX / 2),
    });
    await expect(scrollRoot(page, "Changelog")).toHaveAttribute(
        "data-overflow-y-start",
        "",
    );
    await expectScreen(page, "scroll-area-basic-scrolled");
});

test("scroll area / basic?dir=rtl", async ({ page }) => {
    await openScenario(page, "/scroll-area/basic", { dir: "rtl" });
    await expect(
        scrollbar(scrollRoot(page, "Changelog"), "vertical"),
    ).toHaveCount(1);
    await expectScreen(page, "scroll-area-basic-rtl");
});

test("scroll area / links", async ({ page }) => {
    await openScenario(page, "/scroll-area/links");
    await expect(
        scrollbar(scrollRoot(page, "Chapters"), "vertical"),
    ).toHaveCount(1);
    await expectScreen(page, "scroll-area-links");
});
