import { describe, expect, it } from "vitest";
import {
    bestMatch,
    commandItemScore,
    commandMatches,
    commandScore,
} from "../../src/command/command-score.ts";

describe("commandScore", () => {
    it("scores an empty search 1", () => {
        expect(commandScore("Calendar", "")).toBe(1);
        expect(commandScore("Calendar", "   ")).toBe(1);
    });

    it("ranks the whole text, a prefix, a word's prefix, word prefixes in order and a substring", () => {
        expect(commandScore("Archive", "archive")).toBe(1);
        expect(commandScore("Archive", "ar")).toBe(0.9);
        expect(commandScore("Search Emoji", "emo")).toBe(0.8);
        expect(commandScore("open-file", "fi")).toBe(0.8);
        expect(commandScore("Git checkout branch", "git br")).toBe(0.7);
        expect(commandScore("Git checkout branch", "br git")).toBe(0);
        expect(commandScore("Calendar", "ar")).toBe(0.6);
        expect(commandScore("Calendar", "xyz")).toBe(0);
    });

    it("ignores case, accents and the search's surrounding spaces", () => {
        expect(commandScore("Café", " CAFE ")).toBe(1);
        expect(commandScore("crème brûlée", "brul")).toBe(0.8);
    });

    it("scores a keyword just under the same match on the value", () => {
        expect(commandScore("Profile", "acc", ["account"])).toBeCloseTo(0.855);
        expect(commandScore("Profile", "pro", ["profile settings"])).toBe(0.9);
        expect(commandScore("Profile", "xyz", ["account"])).toBe(0);
    });
});

describe("commandItemScore", () => {
    const filter = (value: string, search: string) =>
        value.toLowerCase().startsWith(search.toLowerCase()) ? 1 : 0;

    it("is 1 for a forced item, no filter or an empty search", () => {
        expect(commandItemScore("Ask AI", "zzz", [], commandScore, true)).toBe(
            1,
        );
        expect(commandItemScore("Billing", "zzz", [], null)).toBe(1);
        expect(commandItemScore("Billing", " ", [], filter)).toBe(1);
    });

    it("calls the filter with the trimmed search and the keywords", () => {
        const calls: unknown[] = [];
        commandItemScore(" Billing", " bi ", ["pay"], (...args) => {
            calls.push(args);
            return 0.5;
        });
        expect(calls).toEqual([[" Billing", "bi", ["pay"]]]);
        expect(commandItemScore("Billing", "bi", [], filter)).toBe(1);
        expect(commandItemScore("Billing", "il", [], filter)).toBe(0);
    });
});

describe("commandMatches and bestMatch", () => {
    const entries = [
        { value: "Calendar" },
        { value: "Search Emoji" },
        { value: "Archive", disabled: true },
        { value: "Arcade" },
    ];

    it("keeps the matching entries in order with their scores", () => {
        const matches = commandMatches(entries, "ar", commandScore);
        expect(matches.entries.map((entry) => entry.value)).toEqual([
            "Calendar",
            "Search Emoji",
            "Archive",
            "Arcade",
        ]);
        expect(matches.scores).toEqual([0.6, 0.6, 0.9, 0.9]);
        expect(commandMatches(entries, "", commandScore).scores).toEqual([
            1, 1, 1, 1,
        ]);
        expect(commandMatches(entries, "zzz", commandScore).entries).toEqual(
            [],
        );
    });

    it("finds the best enabled entry, the first among equals", () => {
        const { entries: matching, scores } = commandMatches(
            entries,
            "ar",
            commandScore,
        );
        expect(bestMatch(scores, (index) => !!matching[index]?.disabled)).toBe(
            3,
        );
        expect(bestMatch(scores)).toBe(2);
        expect(bestMatch([1, 1, 1])).toBe(0);
        expect(bestMatch([1], () => true)).toBe(-1);
        expect(bestMatch([])).toBe(-1);
    });
});
