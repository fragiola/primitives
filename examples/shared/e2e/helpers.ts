// Adapted from Tree (fragiola/tree, examples/shared/e2e/helpers.ts), same author and licence.
import AxeBuilder from "@axe-core/playwright";
import {
    expect,
    type FrameLocator,
    type Locator,
    type Page,
    test,
} from "@playwright/test";
import { examplesApp, listExampleIds } from "../scripts/examples-lib.ts";
import { THEMES, type ThemeName } from "../src/themes/themes.ts";
import { embedBase, frameworkOf, missingReason } from "./available.ts";

// The examples run in a framework's embed app, addressed by its directory URL (`<base>?id=`, §5.1
// of the site export contract), inside an iframe of a same-origin host page (serve.ts), as
// fragiola.com shows them.
//
// Every framework runs these specs (config.ts). They reach the examples only through what every
// framework reproduces: roles and accessible names, `data-primitives-part`, `data-*` state and
// ARIA; never a class name or a framework detail.

/** The framework under test, set by the app's playwright.config.ts. */
export const FRAMEWORK = frameworkOf(process.env.EXAMPLES_FRAMEWORK);
/** Where the e2e server mounts its embed (serve.ts). */
export const EMBED_BASE = embedBase(FRAMEWORK);
const AVAILABLE = listExampleIds(examplesApp(FRAMEWORK));
/** The framework's examples: a spec loops over these, never over a fixed list. */
export const EXAMPLES = AVAILABLE.map((id) => ({ id }));
export { THEMES };

/** A `data-primitives-part` selector. */
export const part = (name: string) => `[data-primitives-part="${name}"]`;

/** Fails the running test when the framework lacks one of these examples. */
export function requireExamples(...ids: string[]) {
    const reason = missingReason(FRAMEWORK, AVAILABLE, ids);
    if (reason !== undefined) throw new Error(reason);
}

export interface Message {
    type: string;
    id?: string;
    open?: boolean;
    height?: number;
}

/** The messages the host page received from the embed, in order. */
export const messages = (page: Page) =>
    page.evaluate(
        () => (window as unknown as { messages: Message[] }).messages,
    );

/** Whether the host has promoted the frame (it is in the top layer, over the viewport). */
export const promoted = (page: Page) =>
    page.evaluate(() =>
        (window as unknown as { isPromoted: () => boolean }).isPromoted(),
    );

/**
 * Opens an example as fragiola.com shows it: in an iframe of a same-origin page (serve.ts,
 * /host.html), and waits for its `ready`. `legacy`: a host older than contract v1.3 (no `host`
 * message, so no promotion).
 */
export async function openHosted(
    page: Page,
    query: { id: string; theme?: string; legacy?: boolean },
): Promise<FrameLocator> {
    requireExamples(query.id);
    const params = new URLSearchParams({ id: query.id });
    if (query.theme !== undefined) params.set("theme", query.theme);
    if (query.legacy) params.set("legacy", "1");
    await page.goto(`/host.html?${params}`);
    await expect
        .poll(() => messages(page))
        .toContainEqual({ type: "fragiola:example:ready", id: query.id });
    return page.frameLocator('[data-testid="frame"]');
}

/** The site's Reset: it reloads the example's frame. */
export async function reset(page: Page, id: string) {
    await page.reload();
    await expect
        .poll(() => messages(page))
        .toContainEqual({ type: "fragiola:example:ready", id });
}

/** Collects console errors and uncaught exceptions for the page's lifetime. */
export function collectErrors(page: Page): string[] {
    const errors: string[] = [];
    page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
    return errors;
}

/** Applies a theme as the site's switcher does: a message to the frame. */
export async function sendTheme(page: Page, theme: string) {
    await page.evaluate((theme) => {
        document
            .querySelector("iframe")
            ?.contentWindow?.postMessage(
                { type: "fragiola:example:theme", theme },
                location.origin,
            );
    }, theme);
}

export type { ThemeName };
export { test };

/**
 * The axe rules an example answers for: WCAG A and AA. An example is a fragment of a page (no
 * `h1`, no landmarks), so the page-level best practices do not apply to it.
 */
export const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/**
 * Waits until no animation runs in the page: an overlay's enter transition starts once its popup
 * drops `data-starting-style`, which a framework that renders in a later task (zoneless Angular)
 * does a frame or two after the popup is visible. Waits for the frames, then for every running
 * animation, until none is left (as the conformance suite's axe check).
 */
export async function settleAnimations(page: Page): Promise<void> {
    await page.evaluate(async () => {
        const frame = () =>
            new Promise((resolve) =>
                requestAnimationFrame(() => resolve(null)),
            );
        for (let round = 0; round < 10; round += 1) {
            await frame();
            await frame();
            const running = document.getAnimations();
            if (running.length === 0) {
                return;
            }
            await Promise.all(running.map((animation) => animation.finished));
        }
    });
}

/**
 * {@link settleAnimations} inside the document of `locator`'s element: an example's own frame (a
 * drawer that slides in moves under the pointer until its transition ends).
 */
export async function settleAnimationsOf(locator: Locator): Promise<void> {
    await locator.evaluate(async (element) => {
        const view = element.ownerDocument.defaultView ?? window;
        const frame = () =>
            new Promise((resolve) =>
                view.requestAnimationFrame(() => resolve(null)),
            );
        for (let round = 0; round < 10; round += 1) {
            await frame();
            await frame();
            const running = element.ownerDocument.getAnimations();
            if (running.length === 0) {
                return;
            }
            await Promise.all(running.map((animation) => animation.finished));
        }
    });
}

/**
 * The page's axe violations under {@link WCAG}, once its transitions have settled: a half-faded
 * popup has no stable colour contrast. Every example's axe check goes through it, in every
 * framework, so none measures an enter transition (tests/axe-settled.test.ts).
 */
export async function axeViolations(page: Page) {
    await settleAnimations(page);
    return (await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations;
}
