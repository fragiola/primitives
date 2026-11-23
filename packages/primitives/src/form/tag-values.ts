/** Why a text was refused as a tag (spec/tags-input.md, "Adding tags"). */
export type TagRefusal = "duplicate" | "max" | "invalid";

/** The rules a TagsInput's tags follow (spec/tags-input.md, "API"). */
export interface TagRules {
    /** Ends a tag while typing and splits a paste; `null` for none. */
    delimiter: string | null;
    /** The most tags (`Infinity` for no limit). */
    max: number;
    /** A text equal to a tag is accepted. */
    allowDuplicates: boolean;
    /** `false` refuses a trimmed text; `value` is the tags it would join. */
    validate?: ((tag: string, value: readonly string[]) => boolean) | undefined;
}

/** A refused text: trimmed, and why. */
export interface RefusedTag {
    text: string;
    cause: TagRefusal;
}

/** What offering a text as tags gives (`takeTags`). */
export interface TakenTags {
    /** The tags after it (the same array when nothing was added). */
    value: readonly string[];
    /** The tags it added, in order. */
    added: string[];
    refused: RefusedTag[];
    /** What the Input holds after it: the refused texts and the text still typed. */
    text: string;
}

/** The parts of `text` between the delimiters (the whole text with none). */
function split(text: string, delimiter: string | null): string[] {
    return delimiter === null || delimiter === ""
        ? [text]
        : text.split(delimiter);
}

/** Why `tag` (trimmed, not empty) cannot join `value`, or `null` when it can. */
function refusal(
    tag: string,
    value: readonly string[],
    rules: TagRules,
): TagRefusal | null {
    if (!rules.allowDuplicates && value.includes(tag)) {
        return "duplicate";
    }
    if (value.length >= rules.max) {
        return "max";
    }
    if (rules.validate !== undefined && !rules.validate(tag, value)) {
        return "invalid";
    }
    return null;
}

/**
 * Offers `text` as tags (spec/tags-input.md, "Adding tags"): split by the delimiter, each part
 * trimmed (an empty part dropped), each added at the end unless it is a duplicate (unless
 * `allowDuplicates`), past `max`, or refused by `validate`, checked against the tags so far.
 * `whole`: every part is offered (Enter, a paste, a blur); otherwise the part after the last
 * delimiter is still being typed: it is not offered and stays, untrimmed, after the refused texts
 * in the Input's text, which joins them with the delimiter.
 */
export function takeTags(
    value: readonly string[],
    text: string,
    rules: TagRules,
    whole: boolean,
): TakenTags {
    const parts = split(text, rules.delimiter);
    const typing = whole ? undefined : parts.pop();
    let next = value;
    const added: string[] = [];
    const refused: RefusedTag[] = [];
    for (const part of parts) {
        const tag = part.trim();
        if (tag === "") {
            continue;
        }
        const cause = refusal(tag, next, rules);
        if (cause === null) {
            next = [...next, tag];
            added.push(tag);
        } else {
            refused.push({ text: tag, cause });
        }
    }
    const kept = refused.map((entry) => entry.text);
    if (typing !== undefined && typing !== "") {
        kept.push(typing);
    }
    return {
        value: next,
        added,
        refused,
        text: kept.join(rules.delimiter ?? ""),
    };
}

/** How many times `delimiter` (not empty) is in `text`. */
function occurrences(text: string, delimiter: string): number {
    return text.split(delimiter).length - 1;
}

/**
 * Whether an input that changed the Input's text from `previous` to `next` typed the delimiter
 * (spec/tags-input.md, "Adding tags"): `next` holds it and either the inserted text (an
 * `InputEvent`'s `data`) holds it or `next` holds it more times than `previous`. Any other input
 * (a character, a deletion) only changes the text: the refused texts left in the Input are not
 * offered again on every keystroke.
 */
export function typesDelimiter(
    previous: string,
    next: string,
    delimiter: string | null,
    inserted?: string | null,
): boolean {
    if (delimiter === null || delimiter === "" || !next.includes(delimiter)) {
        return false;
    }
    if (inserted?.includes(delimiter)) {
        return true;
    }
    return occurrences(next, delimiter) > occurrences(previous, delimiter);
}

/** What ending a tag's edit gives (`editTag`). */
export type EditedTag =
    | { type: "unchanged" }
    | { type: "replaced"; value: readonly string[] }
    | { type: "removed"; value: readonly string[] }
    | { type: "refused"; text: string; cause: Exclude<TagRefusal, "max"> };

/**
 * Ends the edit of the tag at `index` with `text` (spec/tags-input.md, "Editing a tag"): trimmed,
 * an empty text removes the tag, the same text changes nothing, a duplicate of another tag (unless
 * `allowDuplicates`) or a text `validate` refuses (with the other tags) is refused, any other text
 * replaces it.
 */
export function editTag(
    value: readonly string[],
    index: number,
    text: string,
    rules: TagRules,
): EditedTag {
    const tag = text.trim();
    const others = value.filter((_, position) => position !== index);
    if (tag === "") {
        return { type: "removed", value: others };
    }
    if (tag === value[index]) {
        return { type: "unchanged" };
    }
    if (!rules.allowDuplicates && others.includes(tag)) {
        return { type: "refused", text: tag, cause: "duplicate" };
    }
    if (rules.validate !== undefined && !rules.validate(tag, others)) {
        return { type: "refused", text: tag, cause: "invalid" };
    }
    return {
        type: "replaced",
        value: value.map((current, position) =>
            position === index ? tag : current,
        ),
    };
}
