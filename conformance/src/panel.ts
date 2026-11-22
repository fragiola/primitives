import type { Locator, Page } from "@playwright/test";

/** What a disclosure panel looked like when it entered or left a transition state. */
export interface PanelMoment {
    /** `data-starting-style` removed (`start`), or `data-ending-style` set (`end`). */
    moment: "start" | "end";
    /** Its size variable's inline value at that moment (`--<component>-panel-height`). */
    size: string;
    /** Its computed height at that moment, in pixels. */
    height: number;
    /** Animations or transitions running on it at that moment. */
    running: number;
}

/**
 * Starts recording the moments a disclosure panel's transition starts (spec/collapsible.md,
 * "Animation"): when `data-starting-style` is removed from a `data-primitives-part="<part>"`
 * element and when `data-ending-style` is set on one, its size variable and its computed height.
 * Returns a reader of the moments since.
 */
export async function recordPanelMoments(
    page: Page,
    part: string,
    variable: string,
): Promise<() => Promise<PanelMoment[]>> {
    await page.evaluate(
        ({ part, variable }) => {
            const moments: PanelMoment[] = [];
            const observer = new MutationObserver((records) => {
                for (const record of records) {
                    const element = record.target as HTMLElement;
                    if (
                        element.getAttribute("data-primitives-part") !== part ||
                        !element.isConnected
                    ) {
                        continue;
                    }
                    const name = record.attributeName;
                    const has = element.hasAttribute(name ?? "");
                    const started =
                        name === "data-starting-style" &&
                        record.oldValue !== null &&
                        !has;
                    const ended =
                        name === "data-ending-style" &&
                        record.oldValue === null &&
                        has;
                    if (!started && !ended) {
                        continue;
                    }
                    moments.push({
                        moment: started ? "start" : "end",
                        size: element.style.getPropertyValue(variable).trim(),
                        height: Number.parseFloat(
                            getComputedStyle(element).height,
                        ),
                        running: element.getAnimations().length,
                    });
                }
            });
            observer.observe(document, {
                subtree: true,
                attributes: true,
                attributeOldValue: true,
                attributeFilter: ["data-starting-style", "data-ending-style"],
            });
            (
                window as unknown as { __panelMoments: PanelMoment[] }
            ).__panelMoments = moments;
        },
        { part, variable },
    );
    return () =>
        page.evaluate(
            () =>
                (window as unknown as { __panelMoments: PanelMoment[] })
                    .__panelMoments,
        );
}

/** The inline value of a size variable on the element. */
export function sizeVariable(
    locator: Locator,
    variable: string,
): Promise<string> {
    return locator.evaluate(
        (element, variable) =>
            (element as HTMLElement).style.getPropertyValue(variable).trim(),
        variable,
    );
}

/**
 * Finds `text` in the page as the browser's find-in-page does, through a text fragment
 * (`#:~:text=`, Chromium): a match inside a `hidden="until-found"` panel fires `beforematch` on it
 * (spec/collapsible.md, "Find in page").
 */
export async function findInPage(page: Page, text: string): Promise<void> {
    await page.evaluate((text) => {
        location.hash = `:~:text=${encodeURIComponent(text)}`;
    }, text);
}
