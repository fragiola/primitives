import { expect, type Page, test } from "@playwright/test";
import { IMPLEMENTATIONS } from "../../src/implementations.ts";
import { expectOutput } from "../../src/output.ts";
import { settleAnimations } from "../../src/presence.ts";
import { scenarioPaths, snapshotRoot } from "../../src/ssr.ts";

// Epic #22 (#20), spec/README.md "Server rendering": every scenario of the specs renders on the
// server (`src/ssr-server.ts`, each fixture's `src/server/entry-server`), hydrates in the browser
// with no warning, and ends with the same DOM as the page rendered in the browser alone.

const SCENARIOS = scenarioPaths();

function ssrBase(project: string): string {
    const implementation = IMPLEMENTATIONS.find(
        (candidate) => candidate.name === project,
    );
    if (implementation === undefined) {
        throw new Error(`no implementation named ${project}`);
    }
    return `http://localhost:${implementation.ssrPort}`;
}

/** Every console error and warning of the page, and its uncaught errors. */
function collectProblems(page: Page): string[] {
    const problems: string[] = [];
    page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warning") {
            problems.push(`${message.type()}: ${message.text()}`);
        }
    });
    page.on("pageerror", (error) =>
        problems.push(`pageerror: ${error.message}`),
    );
    return problems;
}

/**
 * Waits until the fixture says it rendered (or hydrated), then for its animations and frames. An
 * Avatar's page also waits for its images (loaded or failed) and its Fallback's delay
 * (spec/avatar.md): its loading is asynchronous, so both renders are compared once it settled.
 */
async function ready(page: Page, scenario: string): Promise<void> {
    await page
        .locator("html[data-fixture-ready]")
        .waitFor({ state: "attached" });
    if (scenario.startsWith("/avatar/")) {
        await page.waitForLoadState("networkidle");
        await expectOutput(page, "ada", "loaded");
        await expectOutput(page, "missing", "error");
        await expect(page.getByText("KJ", { exact: true })).toBeVisible();
    }
    await settleAnimations(page);
}

test("the scenarios come from the specs", () => {
    expect(SCENARIOS.length).toBeGreaterThan(50);
    expect(SCENARIOS).toContain("/dialog/basic");
    expect(SCENARIOS).toContain("/calendar/locale?locale=de-DE");
});

for (const scenario of SCENARIOS) {
    test(`ssr ${scenario}: renders on the server, hydrates with no warning, as the client renders it`, async ({
        page,
    }, info) => {
        const url = `${ssrBase(info.project.name)}${scenario}`;
        const served = await page.request.get(url);
        expect(served.ok()).toBe(true);
        const html = await served.text();
        // the page is in the server's HTML, not only after hydration
        expect(html).toMatch(
            /<div id="root" data-ssr[^>]*>\s*(<!--[^>]*-->\s*)*<main/,
        );

        const problems = collectProblems(page);
        await page.goto(url);
        await ready(page, scenario);
        const hydrated = await snapshotRoot(page);
        expect(problems).toEqual([]);
        // the ids the server wrote are the ones the hydrated page keeps
        const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(
            (match) => match[1],
        );
        expect(
            await page.evaluate(
                (ids) =>
                    ids.filter((id) => document.getElementById(id) === null),
                ids as string[],
            ),
        ).toEqual([]);

        await page.goto(scenario);
        await ready(page, scenario);
        expect(hydrated).toEqual(await snapshotRoot(page));
    });
}

// Epic #22 (#20), spec/tabs.md and slider.md "Server rendering": the parts Base UI places before
// hydration are in place in the server's page alone (its scripts blocked: no hydration).
test.describe("before hydration", () => {
    test.beforeEach(async ({ page }) => {
        await page.route(/\/assets\/.+\.js$/, (route) => route.abort());
    });

    for (const scenario of ["/tabs/automatic", "/tabs/automatic?dir=rtl"]) {
        test(`ssr ${scenario}: the Indicator covers the selected tab`, async ({
            page,
        }, info) => {
            await page.goto(`${ssrBase(info.project.name)}${scenario}`);
            expect(
                await page.evaluate(() =>
                    document.documentElement.hasAttribute("data-fixture-ready"),
                ),
            ).toBe(false);
            const indicator = page.locator(
                '[data-primitives-part="tabs-indicator"]',
            );
            await expect(indicator.locator("script")).toHaveCount(0);
            const selected = page.getByRole("tab", { selected: true });
            const width = await indicator.evaluate((element) =>
                getComputedStyle(element).getPropertyValue(
                    "--tabs-indicator-inline-size",
                ),
            );
            const tab = await selected.boundingBox();
            const box = await indicator.boundingBox();
            expect(tab).not.toBeNull();
            expect(box).not.toBeNull();
            expect(Number.parseFloat(width)).toBeCloseTo(tab?.width ?? 0, 0);
            // the recipe draws it along the bottom of the selected tab
            expect(box?.x).toBeCloseTo(tab?.x ?? Number.NaN, 0);
            expect(box?.width).toBeCloseTo(tab?.width ?? Number.NaN, 0);
        });
    }

    // Epic #91 (#90), spec/segmented-control.md "Server rendering": the Indicator's script places
    // it over the checked Item before hydration, as the Tabs Indicator's
    for (const scenario of [
        "/segmented-control/basic",
        "/segmented-control/basic?dir=rtl",
    ]) {
        test(`ssr ${scenario}: the Indicator covers the checked Item`, async ({
            page,
        }, info) => {
            await page.goto(`${ssrBase(info.project.name)}${scenario}`);
            expect(
                await page.evaluate(() =>
                    document.documentElement.hasAttribute("data-fixture-ready"),
                ),
            ).toBe(false);
            const indicator = page.locator(
                '[data-primitives-part="segmented-control-indicator"]',
            );
            await expect(indicator.locator("script")).toHaveCount(0);
            const width = await indicator.evaluate((element) =>
                getComputedStyle(element).getPropertyValue(
                    "--segment-indicator-inline-size",
                ),
            );
            const item = await page
                .getByRole("radio", { checked: true })
                .boundingBox();
            const box = await indicator.boundingBox();
            expect(item).not.toBeNull();
            expect(box).not.toBeNull();
            expect(Number.parseFloat(width)).toBeCloseTo(item?.width ?? 0, 0);
            // the recipe draws it over the checked Item's whole box
            expect(box?.x).toBeCloseTo(item?.x ?? Number.NaN, 0);
            expect(box?.width).toBeCloseTo(item?.width ?? Number.NaN, 0);
        });
    }

    // Epic #49 (#46), spec/tabs.md `/tabs/nonce`: under a Content Security Policy that allows
    // inline scripts by nonce, the script with the Indicator's `nonce` runs; one without is blocked
    test("ssr /tabs/nonce: the Indicator's script runs under a nonce policy", async ({
        page,
    }, info) => {
        const base = ssrBase(info.project.name);
        await page.route(
            (url) => url.pathname.startsWith("/tabs/"),
            async (route) => {
                const response = await route.fetch();
                await route.fulfill({
                    response,
                    headers: {
                        ...response.headers(),
                        "content-security-policy":
                            "script-src 'nonce-fixture-nonce'",
                    },
                });
            },
        );
        const indicator = page.locator(
            '[data-primitives-part="tabs-indicator"]',
        );
        const width = () =>
            indicator.evaluate((element) =>
                getComputedStyle(element).getPropertyValue(
                    "--tabs-indicator-inline-size",
                ),
            );

        // the policy is in force: the script with no nonce is blocked and stays
        await page.goto(`${base}/tabs/automatic`);
        await expect(indicator.locator("script")).toHaveCount(1);
        expect(await width()).toBe("");

        await page.goto(`${base}/tabs/nonce`);
        await expect(indicator.locator("script")).toHaveCount(0);
        const tab = await page
            .getByRole("tab", { selected: true })
            .boundingBox();
        expect(tab).not.toBeNull();
        expect(Number.parseFloat(await width())).toBeCloseTo(
            tab?.width ?? 0,
            0,
        );
        const box = await indicator.boundingBox();
        expect(box?.x).toBeCloseTo(tab?.x ?? Number.NaN, 0);
    });

    test("ssr /slider/basic: the thumb sits at its value", async ({
        page,
    }, info) => {
        await page.goto(`${ssrBase(info.project.name)}/slider/basic`);
        const control = await page.getByTestId("control").boundingBox();
        const thumb = await page.getByRole("slider").boundingBox();
        expect(control).not.toBeNull();
        expect(thumb).not.toBeNull();
        // value 50 of 0–100: the thumb's center at the middle of the control
        const center = (thumb?.x ?? 0) + (thumb?.width ?? 0) / 2;
        expect(center).toBeCloseTo(
            (control?.x ?? 0) + (control?.width ?? 0) / 2,
            0,
        );
    });
});
