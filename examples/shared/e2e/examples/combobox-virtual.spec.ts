import { expect, type Locator, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    promoted,
    requireExamples,
} from "../helpers.ts";

// combobox-virtual: an async user search (spec/virtual-lists.md). A Combobox over a made-up
// directory of 2 000 users ("Ada Abbott" … "Yusuf Zimmer"), searched by name as the text changes:
// pages of 20 after 400 ms, the next page when the list scrolls to its end. Non-modal: never
// promoted.

/** Scrolls a list to its end, as a wheel or a drag would. */
async function scrollToEnd(list: Locator): Promise<void> {
    await list.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
    });
}

test("the text searches the directory; the end of the list loads more", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "combobox-virtual" });
    const input = frame.getByRole("combobox", { name: "Assign to" });
    await expect(input).toHaveAttribute(
        "data-primitives-part",
        "combobox-input",
    );
    await expect(frame.getByText("Nobody assigned.")).toBeVisible();
    // the first page loads once mounted: the Status says so until it arrives
    const status = frame.locator(part("combobox-status"));
    await expect(status).toHaveText("");
    await input.click();
    await page.keyboard.type("ka");
    const listbox = frame.getByRole("listbox");
    // the search loads: the list shows the last page, busy, until the new one arrives
    await expect(listbox).toHaveAttribute("aria-busy", "true");
    await expect(status).toHaveText("Loading users…");
    expect(await promoted(page)).toBe(false);
    const options = frame.getByRole("option");
    await expect(options.first()).toHaveText("Ada KaurFinance");
    await expect(listbox).not.toHaveAttribute("aria-busy", "true");
    await expect(options.first()).toHaveAttribute("aria-setsize", "20");

    // the end of the list loads the next page of the same search
    await scrollToEnd(listbox);
    await expect(options.first()).toHaveAttribute("aria-setsize", "40");

    // a narrower search, then the keyboard chooses a user
    await page.keyboard.type("ur");
    // once its page arrives, only the users named Kaur show
    await expect
        .poll(async () =>
            (await options.allTextContents()).every((text) =>
                text.includes("Kaur"),
            ),
        )
        .toBe(true);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    const highlighted = frame.locator('[role="option"][data-highlighted]');
    await expect(highlighted).toHaveText("Alan KaurMarketing");
    await expect(highlighted).toHaveAttribute("aria-posinset", "2");
    await expect(input).toHaveAttribute(
        "aria-activedescendant",
        (await highlighted.getAttribute("id")) as string,
    );
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("Alan Kaur");
    await expect(frame.getByText("Assigned to Alan Kaur")).toBeVisible();

    // a search with no match says so
    await input.press("ControlOrMeta+a");
    await page.keyboard.type("zzz");
    await expect(frame.getByText("No user found.")).toBeVisible();
    expect(errors).toEqual([]);
});

test("axe finds no violation with the list open", async ({ page }) => {
    requireExamples("combobox-virtual");
    await page.goto(`${EMBED_BASE}?id=combobox-virtual`);
    await page.getByRole("combobox", { name: "Assign to" }).click();
    await page.keyboard.type("ma");
    await expect(page.getByRole("option").first()).toHaveText(/^Ada Yilmaz/);
    expect(await axeViolations(page)).toEqual([]);
});
