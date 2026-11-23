import { expect, type Locator, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// segmented-control: a view switcher (spec/segmented-control.md). A label "View" names
// (`aria-labelledby`) a SegmentedControl of the Items "List" (checked at first), "Grid" and
// "Board", each with an ItemText, and an Indicator after them; under it, a list "Projects" of six
// projects whose `data-view` is the checked view.

/** The Indicator's box variables, against its checked Item's box in the Root's padding box. */
async function indicatorFollows(indicator: Locator, item: Locator) {
    const box = await item.evaluate((element: HTMLElement) => ({
        left: element.offsetLeft,
        width: element.offsetWidth,
    }));
    await expect
        .poll(() =>
            indicator.evaluate((element: HTMLElement) => ({
                left: Math.round(
                    Number.parseFloat(
                        element.style.getPropertyValue(
                            "--segment-indicator-left",
                        ),
                    ),
                ),
                start: Math.round(
                    Number.parseFloat(
                        element.style.getPropertyValue(
                            "--segment-indicator-inset-inline-start",
                        ),
                    ),
                ),
                width: Math.round(
                    Number.parseFloat(
                        element.style.getPropertyValue(
                            "--segment-indicator-width",
                        ),
                    ),
                ),
            })),
        )
        .toEqual({ left: box.left, start: box.left, width: box.width });
}

test("a press or an arrow checks a view; the projects and the Indicator follow", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "segmented-control" });
    const group = frame.getByRole("radiogroup", { name: "View" });
    const view = (name: string) => group.getByRole("radio", { name });
    const projects = frame.getByRole("list", { name: "Projects" });
    const indicator = frame.locator(part("segmented-control-indicator"));
    await expect(group).toHaveAttribute(
        "data-primitives-part",
        "segmented-control-root",
    );
    await expect(group).toHaveAttribute("aria-orientation", "horizontal");
    await expect(group.getByRole("radio")).toHaveCount(3);
    await expect(view("List")).toHaveAttribute("aria-checked", "true");
    await expect(view("List")).toHaveAttribute("data-checked", "");
    await expect(view("Grid")).toHaveAttribute("aria-checked", "false");
    await expect(projects).toHaveAttribute("data-view", "list");
    await expect(projects.getByRole("listitem")).toHaveCount(6);
    await expect(indicator).toHaveAttribute("aria-hidden", "true");
    await indicatorFollows(indicator, view("List"));

    await view("Grid").click();
    await expect(view("Grid")).toHaveAttribute("aria-checked", "true");
    await expect(view("Grid")).toBeFocused();
    await expect(view("List")).toHaveAttribute("aria-checked", "false");
    await expect(projects).toHaveAttribute("data-view", "grid");
    await indicatorFollows(indicator, view("Grid"));

    // every arrow moves the focus and the check together, wrapping
    await page.keyboard.press("ArrowRight");
    await expect(view("Board")).toBeFocused();
    await expect(view("Board")).toHaveAttribute("aria-checked", "true");
    await expect(projects).toHaveAttribute("data-view", "board");
    await indicatorFollows(indicator, view("Board"));
    await page.keyboard.press("ArrowRight");
    await expect(view("List")).toBeFocused();
    await expect(view("List")).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(view("Board")).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("ArrowUp");
    await expect(view("Grid")).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("ArrowDown");
    await expect(view("Board")).toHaveAttribute("aria-checked", "true");
    await expect(group.locator('[aria-checked="true"]')).toHaveCount(1);
    await expect(projects).toHaveAttribute("data-view", "board");
    expect(errors).toEqual([]);
});

test("one tab stop: the checked view", async ({ page }) => {
    const frame = await openHosted(page, { id: "segmented-control" });
    const group = frame.getByRole("radiogroup", { name: "View" });
    const view = (name: string) => group.getByRole("radio", { name });
    await expect(
        frame.locator(`${part("segmented-control-item")}[tabindex="0"]`),
    ).toHaveCount(1);
    await expect(view("List")).toHaveAttribute("tabindex", "0");
    await view("Board").click();
    await expect(view("Board")).toHaveAttribute("tabindex", "0");
    await expect(view("List")).toHaveAttribute("tabindex", "-1");
    // Space and Enter on the checked view change nothing
    await page.keyboard.press("Space");
    await page.keyboard.press("Enter");
    await expect(view("Board")).toHaveAttribute("aria-checked", "true");
    // Tab leaves the control at once
    await page.keyboard.press("Tab");
    for (const name of ["List", "Grid", "Board"]) {
        await expect(view(name)).not.toBeFocused();
    }
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("segmented-control");
    await page.goto(`${EMBED_BASE}?id=segmented-control`);
    await expect(page.getByRole("radiogroup")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
