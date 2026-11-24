// A command palette's scorer (spec/command.md, "The scorer"): how well an item's text matches
// the typed text, from 0 (no match) to 1. Pure.

/** An item's score for the typed text: `0` hides it. */
export type CommandFilter = (
    value: string,
    search: string,
    keywords: readonly string[],
) => number;

/** A keyword's match ranks just under the same match on the value. */
const KEYWORD_WEIGHT = 0.95;

const WORD_SEPARATORS = /[\s\-_/.:]+/;

/** Case- and accent-insensitive text: NFD, the combining marks removed, lower case. */
function fold(text: string): string {
    return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function words(text: string): string[] {
    return text.split(WORD_SEPARATORS).filter((word) => word !== "");
}

/** Every word of the search starts a word of the text, in order. */
function wordPrefixes(text: readonly string[], search: readonly string[]) {
    let from = 0;
    for (const part of search) {
        let found = -1;
        for (let index = from; index < text.length; index += 1) {
            if (text[index]?.startsWith(part)) {
                found = index;
                break;
            }
        }
        if (found === -1) {
            return false;
        }
        from = found + 1;
    }
    return true;
}

/** The score of one text (already folded) for the search (folded, trimmed, not empty). */
function textScore(text: string, search: string): number {
    if (text === search) {
        return 1;
    }
    if (text.startsWith(search)) {
        return 0.9;
    }
    const textWords = words(text);
    if (textWords.some((word) => word.startsWith(search))) {
        return 0.8;
    }
    const searchWords = words(search);
    if (searchWords.length > 1 && wordPrefixes(textWords, searchWords)) {
        return 0.7;
    }
    return text.includes(search) ? 0.6 : 0;
}

/**
 * The default scorer: the whole text `1`, a prefix `0.9`, a word's prefix `0.8`, every search
 * word starting a word in order `0.7`, a substring `0.6`, else `0`; a keyword's score is
 * `0.95` of the same match on the value. An empty search scores `1`.
 */
export function commandScore(
    value: string,
    search: string,
    keywords: readonly string[] = [],
): number {
    const query = fold(search.trim());
    if (query === "") {
        return 1;
    }
    let best = textScore(fold(value), query);
    for (const keyword of keywords) {
        if (best === 1) {
            break;
        }
        best = Math.max(best, textScore(fold(keyword), query) * KEYWORD_WEIGHT);
    }
    return best;
}

/** An item's score as a Command shows it: forced items and an empty search or no filter, `1`. */
export function commandItemScore(
    value: string,
    search: string,
    keywords: readonly string[],
    filter: CommandFilter | null,
    forceMount = false,
): number {
    const query = search.trim();
    if (forceMount || filter === null || query === "") {
        return 1;
    }
    return filter(value, query, keywords);
}

/** An entry of a list the toolkit filters (a virtual Command list's `items`). */
export interface CommandEntry {
    value: string;
    keywords?: readonly string[];
    disabled?: boolean;
}

export interface CommandMatches<Entry> {
    /** The matching entries, in their order. */
    entries: Entry[];
    /** Each matching entry's score. */
    scores: number[];
}

/** The entries matching the search, in order, with their scores. */
export function commandMatches<Entry extends CommandEntry>(
    entries: readonly Entry[],
    search: string,
    filter: CommandFilter | null,
): CommandMatches<Entry> {
    const matching: Entry[] = [];
    const scores: number[] = [];
    for (const entry of entries) {
        const score = commandItemScore(
            entry.value,
            search,
            entry.keywords ?? [],
            filter,
        );
        if (score > 0) {
            matching.push(entry);
            scores.push(score);
        }
    }
    return { entries: matching, scores };
}

/** The index of the best-scoring enabled entry (the first among equals), or `-1`. */
export function bestMatch(
    scores: readonly number[],
    disabled: (index: number) => boolean = () => false,
): number {
    let best = -1;
    let bestScore = 0;
    scores.forEach((score, index) => {
        if (score > bestScore && !disabled(index)) {
            best = index;
            bestScore = score;
        }
    });
    return best;
}
