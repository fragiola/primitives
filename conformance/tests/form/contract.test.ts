import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/form.md: anatomy, `novalidate`, a field invalid by a server error

test("form / basic: the form, and a field invalid by the server", async ({
    page,
}) => {
    await openScenario(page, "/form/basic");
    const form = part(page, "form", "root");
    await expect(form).toHaveCount(1);
    await expect(form).toHaveJSProperty("tagName", "FORM");
    await expect(form).toHaveAttribute("novalidate", "");

    await page.getByRole("textbox", { name: "Email" }).fill("ada@example.com");
    await page.getByRole("textbox", { name: "Username" }).fill("admin");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("This username is taken.")).toBeVisible();
    const field = part(page, "field", "root").nth(1);
    await expect(field).toHaveAttribute("data-invalid", "");
    await expect(part(field, "field", "label")).toHaveAttribute(
        "data-invalid",
        "",
    );
    await expect(part(field, "field", "control")).toHaveAttribute(
        "data-invalid",
        "",
    );
    await expect(part(field, "field", "error")).toHaveAttribute(
        "data-invalid",
        "",
    );
    await expectNoFalseStates(
        page.locator(
            '[data-primitives-part^="form-"], [data-primitives-part^="field-"]',
        ),
    );
});
