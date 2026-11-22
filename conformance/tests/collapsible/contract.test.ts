import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/collapsible.md: anatomy, state attributes, the size variables
test("collapsible / basic: parts and states, closed and open", async ({
    page,
}) => {
    await openScenario(page, "/collapsible/basic");
    const roots = part(page, "collapsible", "root");
    await expect(roots).toHaveCount(2);
    const triggers = part(page, "collapsible", "trigger");
    await expect(triggers).toHaveCount(2);
    // the first one closed: no panel
    const recovery = roots.nth(0);
    await expect(recovery).toHaveAttribute("data-closed", "");
    await expect(recovery).not.toHaveAttribute("data-open");
    await expect(part(recovery, "collapsible", "panel")).toHaveCount(0);
    const trigger = triggers.nth(0);
    await expect(trigger).toHaveAttribute("type", "button");
    await expect(trigger).not.toHaveAttribute("data-panel-open");
    // the archived one: disabled and open
    const archived = roots.nth(1);
    await expect(archived).toHaveAttribute("data-open", "");
    await expect(archived).toHaveAttribute("data-disabled", "");
    await expect(triggers.nth(1)).toHaveAttribute("data-panel-open", "");
    await expect(triggers.nth(1)).toHaveAttribute("data-disabled", "");
    const archivedPanel = part(archived, "collapsible", "panel");
    await expect(archivedPanel).toHaveAttribute("data-open", "");
    await expect(archivedPanel).toHaveAttribute("data-disabled", "");
    await expect(archivedPanel).not.toHaveAttribute("data-starting-style");
    await expect(archivedPanel).not.toHaveAttribute("hidden");
    await expect(triggers.nth(1)).toHaveAttribute(
        "aria-controls",
        (await archivedPanel.getAttribute("id")) as string,
    );
    for (const name of [
        "--collapsible-panel-height",
        "--collapsible-panel-width",
    ]) {
        expect(
            await archivedPanel.evaluate(
                (element, name) => element.style.getPropertyValue(name),
                name,
            ),
        ).toBe("auto");
    }
    await expectNoFalseStates(parts(page, "collapsible"));

    await trigger.click();
    await expect(recovery).toHaveAttribute("data-open", "");
    await expect(trigger).toHaveAttribute("data-panel-open", "");
    const panel = part(recovery, "collapsible", "panel");
    await expect(panel).toHaveAttribute("data-open", "");
    await expect(panel).not.toHaveAttribute("data-closed");
    await expect(panel).not.toHaveAttribute("data-disabled");
    await expectNoFalseStates(parts(page, "collapsible"));
});

test("collapsible / hidden-until-found: closed kept-mounted panels", async ({
    page,
}) => {
    await openScenario(page, "/collapsible/hidden-until-found");
    const panels = part(page, "collapsible", "panel");
    await expect(panels).toHaveCount(2);
    for (const panel of await panels.all()) {
        await expect(panel).toHaveAttribute("data-closed", "");
        await expect(panel).not.toHaveAttribute("data-open");
    }
    await expect(panels.nth(0)).toHaveAttribute("hidden", "until-found");
    await expect(panels.nth(1)).toHaveAttribute("hidden", "");
    await expectNoFalseStates(parts(page, "collapsible"));
});
