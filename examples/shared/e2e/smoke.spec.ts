// Adapted from Tree (fragiola/tree, examples/shared/e2e/smoke.spec.ts), same author and licence.
import { expect, test } from "@playwright/test";
import {
    collectErrors,
    EXAMPLES,
    openHosted,
    part,
    reset,
    THEMES,
} from "./helpers.ts";

// Every example mounts inside an iframe and logs no error, in every theme (there are five), with
// the theme applied before the first paint, and comes back after the site's Reset; a new example
// folder is covered without touching this file.

for (const example of EXAMPLES) {
    for (const theme of THEMES) {
        test(`${example.id} renders in ${theme.name}, in a frame`, async ({
            page,
        }) => {
            const errors = collectErrors(page);
            const frame = await openHosted(page, {
                id: example.id,
                theme: theme.name,
            });
            await expect(frame.locator("body")).toHaveAttribute(
                "data-example-theme",
                theme.name,
            );
            await expect(frame.locator("html")).toHaveAttribute(
                "data-theme",
                theme.scheme,
            );
            expect(
                await frame
                    .locator("html")
                    .evaluate((el) => getComputedStyle(el).colorScheme),
            ).toBe(theme.scheme);
            // a primitive rendered, with its part attribute
            await expect(
                frame.locator("[data-primitives-part]").first(),
            ).toBeVisible();
            await expect(frame.getByTestId("example-root")).toBeVisible();
            await expect(frame.locator(part("dialog-popup"))).toHaveCount(0);
            // the site's Reset reloads the frame: the example must come back
            await reset(page, example.id);
            expect(errors).toEqual([]);
        });
    }
}
