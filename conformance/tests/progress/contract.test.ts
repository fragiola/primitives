import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/progress.md: anatomy, the status on every part, the Label's id, the Indicator's style
const STATUSES = ["indeterminate", "progressing", "complete"] as const;

test("progress / basic: parts, the status, the label and the indicator's structural style", async ({
    page,
}) => {
    await openScenario(page, "/progress/basic");
    const roots = part(page, "progress", "root");
    await expect(roots).toHaveCount(2);
    const upload = roots.nth(0);
    await expect(upload).toHaveAttribute("role", "progressbar");
    for (const name of ["label", "value", "track", "indicator"]) {
        await expect(part(upload, "progress", name)).toHaveCount(1);
    }
    const label = part(upload, "progress", "label");
    const id = await label.getAttribute("id");
    expect(id).toBeTruthy();
    await expect(upload).toHaveAttribute("aria-labelledby", id as string);
    expect(await label.evaluate((element) => element.localName)).toBe("span");

    /** Every part of the first progress has exactly this status. */
    const expectStatus = async (status: (typeof STATUSES)[number]) => {
        for (const element of [
            upload,
            ...(await parts(upload, "progress").all()),
        ]) {
            for (const other of STATUSES) {
                if (other === status) {
                    await expect(element).toHaveAttribute(`data-${other}`, "");
                } else {
                    await expect(element).not.toHaveAttribute(`data-${other}`);
                }
            }
        }
    };
    await expectStatus("progressing");
    const indicator = part(upload, "progress", "indicator");
    const style = (name: string) =>
        indicator.evaluate(
            (element, property) =>
                (element as HTMLElement).style.getPropertyValue(property),
            name,
        );
    expect(await style("inset-inline-start")).toBe("0px");
    expect(await style("inline-size")).toBe("40%");
    expect(await style("--progress-indicator-size")).toBe("40%");
    expect(
        await part(roots.nth(1), "progress", "indicator").evaluate((element) =>
            (element as HTMLElement).style.getPropertyValue("inline-size"),
        ),
    ).toBe("25%");

    await page.getByRole("button", { name: "Complete" }).click();
    await expectStatus("complete");
    expect(await style("inline-size")).toBe("100%");

    await page.getByRole("button", { name: "Unknown" }).click();
    await expectStatus("indeterminate");
    await expect(upload).not.toHaveAttribute("aria-valuenow");
    await expect(upload).toHaveAttribute("aria-valuemin", "0");
    await expect(upload).toHaveAttribute("aria-valuemax", "100");
    // no structural style while indeterminate
    expect(await style("inline-size")).toBe("");
    expect(await style("--progress-indicator-size")).toBe("");
    await expectNoFalseStates(parts(page, "progress"));
});
