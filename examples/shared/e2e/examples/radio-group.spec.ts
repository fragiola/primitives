import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// radio-group: contact settings (spec/radio-group.md, spec/switch.md, spec/field.md). A Form
// named "Contact settings": a field "Contact by" with a required RadioGroup of "Email", "Phone"
// and "Post" (described by "How we reach you."; "Choose how we reach you." when none is chosen),
// a field "Email alerts" with a Switch (`uncheckedValue="off"`, described by "A weekly
// digest."), a Button "Save" and a status that prints "Saved: <channel>, alerts <on|off>.".

test("saving with no channel focuses the first radio and shows the error", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "radio-group" });
    const group = frame.getByRole("radiogroup", { name: "Contact by" });
    await expect(group).toHaveAttribute(
        "data-primitives-part",
        "radio-group-root",
    );
    await expect(group).toHaveAccessibleDescription("How we reach you.");
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(frame.getByRole("radio", { name: "Email" })).toBeFocused();
    await expect(group).toHaveAttribute("aria-invalid", "true");
    await expect(frame.getByText("Choose how we reach you.")).toBeVisible();
    await expect(frame.getByRole("status")).toHaveText("");
    expect(errors).toEqual([]);
});

test("the arrows check a channel, the switch toggles, and the Form saves both", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "radio-group" });
    const radio = (name: string) => frame.getByRole("radio", { name });
    await radio("Email").focus();
    await page.keyboard.press("Space");
    await expect(radio("Email")).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("ArrowDown");
    await expect(radio("Phone")).toBeFocused();
    await expect(radio("Phone")).toHaveAttribute("aria-checked", "true");
    await expect(radio("Email")).toHaveAttribute("aria-checked", "false");
    const alerts = frame.getByRole("switch", { name: "Email alerts" });
    await expect(alerts).toHaveAccessibleDescription("A weekly digest.");
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(frame.getByRole("status")).toHaveText(
        "Saved: phone, alerts off.",
    );
    await alerts.focus();
    await page.keyboard.press("Space");
    await expect(alerts).toHaveAttribute("aria-checked", "true");
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(frame.getByRole("status")).toHaveText(
        "Saved: phone, alerts on.",
    );
});

test("axe finds no violation, before and after a failed save", async ({
    page,
}) => {
    requireExamples("radio-group");
    await page.goto(`${EMBED_BASE}?id=radio-group`);
    expect(await axeViolations(page)).toEqual([]);
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Choose how we reach you.")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
