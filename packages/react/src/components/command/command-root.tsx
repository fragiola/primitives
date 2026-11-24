import {
    bestMatch,
    type CommandFilter,
    commandItemScore,
    commandScore,
} from "@fragiola/primitives/command";
import {
    useCallback,
    useId,
    useLayoutEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { mergeRefs } from "../../utils/merge-refs.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    CommandContext,
    type CommandItemInfo,
    shownItems,
} from "./command-context.ts";

export interface CommandRootState {
    loading: boolean;
    /** The current page (the last of `pages`), `null` on the root page. */
    page: string | null;
}

export interface CommandRootProps extends PartProps<CommandRootState> {
    /** The text (controlled). */
    inputValue?: string;
    /** The text at first (default `""`). */
    defaultInputValue?: string;
    onInputValueChange?: (value: string, details: ChangeDetails) => void;
    /** An Item's score for the text (default `commandScore`); `null` turns filtering off. */
    filter?: CommandFilter | null;
    /** The stack of page keys, the last the current page (controlled). */
    pages?: string[];
    /** The pages at first (default `[]`). */
    defaultPages?: string[];
    onPagesChange?: (pages: string[], details: ChangeDetails) => void;
    /** Results are loading (default `false`). */
    loading?: boolean;
    /** The arrow keys wrap (default `true`). */
    loopFocus?: boolean;
}

const NO_PAGES: string[] = [];

/** A command palette (spec/command.md): the text, the highlight and the pages. */
export function CommandRoot({
    inputValue,
    defaultInputValue = "",
    onInputValueChange,
    filter: filterProp,
    pages: pagesProp,
    defaultPages = NO_PAGES,
    onPagesChange,
    loading = false,
    loopFocus = true,
    ref,
    ...props
}: CommandRootProps) {
    const [search, setSearch] = useControllableState<string, ChangeDetails>(
        inputValue,
        defaultInputValue,
        onInputValueChange,
    );
    const [pages, setPages] = useControllableState<string[], ChangeDetails>(
        pagesProp,
        defaultPages,
        onPagesChange,
    );
    const filter = filterProp === undefined ? commandScore : filterProp;
    const [highlighted, setHighlighted] = useState<string | null>(null);
    const [shownCount, setShownCount] = useState<number | null>(null);
    const [version, registered] = useReducer((count: number) => count + 1, 0);
    const items = useMemo(() => new Map<HTMLElement, CommandItemInfo>(), []);
    const [root, setRoot] = useElement<HTMLElement>();
    const [list, setList] = useElement<HTMLElement>();
    const listId = `${useId()}-list`;
    const page = pages.length > 0 ? (pages[pages.length - 1] ?? null) : null;
    const pageKey = pages.join("\u0000");

    // the highlight follows the shown Items (spec/command.md, "Keyboard"): a new text or page
    // highlights the best match, a highlight whose Item is gone the best one left
    const seen = useRef<{ search: string; pageKey: string } | null>(null);
    // biome-ignore lint/correctness/useExhaustiveDependencies: runs again whenever an Item mounts or unmounts (version)
    useLayoutEffect(() => {
        const previous = seen.current;
        seen.current = { search, pageKey };
        if (
            previous !== null &&
            previous.pageKey !== pageKey &&
            search !== ""
        ) {
            // a new page starts with no text; the next render highlights its best Item
            setSearch("", { reason: "page-change" });
            return;
        }
        const shown = shownItems({ list, items });
        setShownCount(shown.length);
        const changed =
            previous === null ||
            previous.search !== search ||
            previous.pageKey !== pageKey;
        if (!changed && shown.some(({ info }) => info.value === highlighted)) {
            return;
        }
        const scores = shown.map(({ info }) =>
            commandItemScore(
                info.value,
                search,
                info.keywords,
                filter,
                info.forceMount,
            ),
        );
        const best = bestMatch(
            scores,
            (index) => shown[index]?.info.disabled ?? true,
        );
        setHighlighted(best === -1 ? null : (shown[best]?.info.value ?? null));
    }, [search, pageKey, version, list, items, filter, highlighted, setSearch]);

    const highlight = useCallback(
        (value: string | null) => setHighlighted(value),
        [],
    );
    const context = useMemo(
        () => ({
            search,
            setSearch,
            filter,
            pages,
            setPages,
            loading,
            loopFocus,
            highlighted,
            highlight,
            items,
            registered,
            shownCount,
            root,
            list,
            setList,
            listId,
        }),
        [
            search,
            setSearch,
            filter,
            pages,
            setPages,
            loading,
            loopFocus,
            highlighted,
            highlight,
            items,
            shownCount,
            root,
            list,
            setList,
            listId,
        ],
    );
    const state = { loading, page };
    return (
        <CommandContext.Provider value={context}>
            {renderElement(
                "div",
                props,
                state,
                { "data-primitives-part": "command-root" },
                mergeRefs(setRoot, ref),
            )}
        </CommandContext.Provider>
    );
}
