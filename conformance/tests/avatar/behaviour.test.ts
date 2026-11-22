import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario, TODAY } from "../../src/scenario.ts";

// spec/avatar.md. The fixtures serve /avatar/ada.svg; /avatar/missing.svg does not exist.
const image = (page: Page, name: string) =>
    page.getByRole("img", { name, exact: true });
const text = (page: Page, value: string) =>
    page.getByText(value, { exact: true });

test.describe("avatar / basic", () => {
    test("once loaded, the image is shown and its fallback is not", async ({
        page,
    }) => {
        await openScenario(page, "/avatar/basic");
        await expectOutput(page, "ada", "loaded");
        await expect(image(page, "Ada Lovelace")).toBeVisible();
        await expect(text(page, "AL")).toHaveCount(0);
    });

    test("a broken image is never shown: its fallback is", async ({ page }) => {
        await openScenario(page, "/avatar/basic");
        await expectOutput(page, "missing", "error");
        await expect(image(page, "Grace Hopper")).toHaveCount(0);
        await expect(text(page, "GH")).toBeVisible();
    });

    test("a slow image shows its fallback while it loads", async ({ page }) => {
        // the image is held through its request, never the network, until the loading state is
        // checked: a framework that mounts before the window's `load` (which a loading image
        // holds back) and one that mounts after it see the same page
        let release: () => void = () => {};
        const held = new Promise<void>((resolve) => {
            release = resolve;
        });
        await page.route("**/avatar/ada.svg", async (route) => {
            await held;
            await route.continue();
        });
        await page.goto("/avatar/basic", { waitUntil: "domcontentloaded" });
        await expectOutput(page, "ada", "loading");
        await expect(text(page, "AL")).toBeVisible();
        await expect(image(page, "Ada Lovelace")).toHaveCount(0);
        release();
        await expectOutput(page, "ada", "loaded");
        await expect(image(page, "Ada Lovelace")).toBeVisible();
        await expect(text(page, "AL")).toHaveCount(0);
    });

    test("a fallback with a delay is rendered once the delay has run", async ({
        page,
    }) => {
        await page.clock.install({ time: TODAY });
        await page.clock.pauseAt(new Date(TODAY.getTime() + 1000));
        await openScenario(page, "/avatar/basic");
        await expect(
            page.getByRole("button", { name: "Show again" }),
        ).toBeVisible();
        await expect(text(page, "GH")).toBeVisible();
        await expect(text(page, "KJ")).toHaveCount(0);
        await page.clock.runFor(299);
        await expect(text(page, "KJ")).toHaveCount(0);
        await page.clock.runFor(1);
        await expect(text(page, "KJ")).toBeVisible();
    });

    test("a cached image is loaded at once, with no loading before it", async ({
        page,
    }) => {
        await openScenario(page, "/avatar/basic");
        await expectOutput(page, "ada", "loaded");
        await expectOutput(page, "again", "none");
        await page.getByRole("button", { name: "Show again" }).click();
        await expectOutput(page, "again", "loaded");
        await expect(image(page, "Ada again")).toBeVisible();
        await expect(text(page, "AA")).toHaveCount(0);
    });

    test("has no axe violation", async ({ page }) => {
        await openScenario(page, "/avatar/basic");
        await expectOutput(page, "ada", "loaded");
        await expectOutput(page, "missing", "error");
        await expectNoAxeViolations(page);
    });
});
