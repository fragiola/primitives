import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Tabs } from "../src/components/tabs/index.ts";

afterEach(cleanup);

// spec/tabs.md: a tab's value is any string; the ids built from it stay valid IDREFs.
describe("Tabs ids", () => {
    it("link a tab and its panel when the value holds spaces", () => {
        render(
            <Tabs.Root defaultValue="my account">
                <Tabs.List aria-label="Settings">
                    <Tabs.Tab value="my account">My account</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="my account">Account settings</Tabs.Panel>
            </Tabs.Root>,
        );
        const tab = screen.getByRole("tab", { name: "My account" });
        const panel = screen.getByRole("tabpanel");
        expect(tab.id).not.toMatch(/\s/);
        expect(panel.id).not.toMatch(/\s/);
        expect(tab.getAttribute("aria-controls")).toBe(panel.id);
        expect(panel.getAttribute("aria-labelledby")).toBe(tab.id);
    });
});
