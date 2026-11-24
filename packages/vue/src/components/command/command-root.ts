import {
    bestMatch,
    type CommandFilter,
    commandItemScore,
    commandScore,
} from "@fragiola/primitives/command";
import {
    computed,
    defineComponent,
    type PropType,
    provide,
    ref,
    shallowRef,
    useId,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import {
    type CommandContext,
    CommandKey,
    shownItems,
} from "./command-context.ts";

export interface CommandRootState {
    loading: boolean;
    /** The current page (the last of `pages`), `null` on the root page. */
    page: string | null;
}

export interface CommandRootProps {
    /** The text (controlled). */
    inputValue?: string;
    /** The text at first (default `""`). */
    defaultInputValue?: string;
    /** An Item's score for the text (default `commandScore`); `null` turns filtering off. */
    filter?: CommandFilter | null;
    /** The stack of page keys, the last the current page (controlled). */
    pages?: string[];
    /** The pages at first (default `[]`). */
    defaultPages?: string[];
    /** Results are loading (default `false`). */
    loading?: boolean;
    /** The arrow keys wrap (default `true`). */
    loopFocus?: boolean;
}

export type CommandRootEmits = {
    "update:inputValue": (value: string) => true;
    inputValueChange: (value: string, details: ChangeDetails) => true;
    "update:pages": (pages: string[]) => true;
    pagesChange: (pages: string[], details: ChangeDetails) => true;
};

/**
 * A command palette (spec/command.md): the text (`v-model:input-value`), the highlight and the
 * pages (`v-model:pages`).
 */
export const CommandRoot: PartComponent<
    CommandRootProps,
    CommandRootState,
    CommandRootEmits
> = publicComponent(
    defineComponent({
        name: "CommandRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            inputValue: { type: String, default: undefined },
            defaultInputValue: { type: String, default: "" },
            filter: {
                type: Function as PropType<CommandFilter | null>,
                default: undefined,
            },
            pages: {
                type: Array as PropType<string[]>,
                default: undefined,
            },
            defaultPages: {
                type: Array as PropType<string[]>,
                default: () => [],
            },
            loading: { type: Boolean, default: false },
            loopFocus: { type: Boolean, default: true },
        },
        emits: {
            "update:inputValue": (_value: string) => true,
            inputValueChange: (_value: string, _details: ChangeDetails) => true,
            "update:pages": (_pages: string[]) => true,
            pagesChange: (_pages: string[], _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const searchState = useControllable<string, ChangeDetails>(
                () => props.inputValue,
                props.defaultInputValue,
                (next, details) => {
                    emit("update:inputValue", next);
                    emit("inputValueChange", next, details);
                },
            );
            const pagesState = useControllable<string[], ChangeDetails>(
                () => props.pages,
                props.defaultPages,
                (next, details) => {
                    emit("update:pages", next);
                    emit("pagesChange", next, details);
                },
            );
            const filter = (): CommandFilter | null =>
                props.filter === undefined ? commandScore : props.filter;
            const search = computed(() => searchState.value.value);
            const pages = computed(() => pagesState.value.value);
            const root = shallowRef<HTMLElement | null>(null);
            const setRoot = elementSetter(root);
            const context: CommandContext = {
                search,
                setSearch: (value, details) => searchState.set(value, details),
                filter,
                pages,
                setPages: (next, details) => pagesState.set(next, details),
                loading: () => props.loading,
                loopFocus: () => props.loopFocus,
                highlighted: ref<string | null>(null),
                items: new Map(),
                version: ref(0),
                shownCount: ref<number | null>(null),
                root,
                list: shallowRef<HTMLElement | null>(null),
                listId: `${useId()}-list`,
            };
            provide(CommandKey, context);

            // the highlight follows the shown Items (spec/command.md, "Keyboard"): a new text or
            // page highlights the best match, a highlight whose Item is gone the best one left
            let seen: { search: string; pageKey: string } | null = null;
            watch(
                () =>
                    [
                        search.value,
                        pages.value.join("\u0000"),
                        context.version.value,
                        context.list.value,
                        filter(),
                        context.highlighted.value,
                    ] as const,
                ([text, pageKey, , , currentFilter, highlighted]) => {
                    const previous = seen;
                    seen = { search: text, pageKey };
                    if (
                        previous !== null &&
                        previous.pageKey !== pageKey &&
                        text !== ""
                    ) {
                        // a new page starts with no text; the next run highlights its best Item
                        context.setSearch("", { reason: "page-change" });
                        return;
                    }
                    const shown = shownItems(context);
                    context.shownCount.value = shown.length;
                    const changed =
                        previous === null ||
                        previous.search !== text ||
                        previous.pageKey !== pageKey;
                    if (
                        !changed &&
                        shown.some(({ info }) => info.value === highlighted)
                    ) {
                        return;
                    }
                    const scores = shown.map(({ info }) =>
                        commandItemScore(
                            info.value,
                            text,
                            info.keywords,
                            currentFilter,
                            info.forceMount,
                        ),
                    );
                    const best = bestMatch(
                        scores,
                        (index) => shown[index]?.info.disabled ?? true,
                    );
                    context.highlighted.value =
                        best === -1 ? null : (shown[best]?.info.value ?? null);
                },
                { flush: "post", immediate: true },
            );

            return () => {
                const current = pages.value;
                const state: CommandRootState = {
                    loading: props.loading,
                    page:
                        current.length > 0
                            ? (current[current.length - 1] ?? null)
                            : null,
                };
                return renderPart("div", { attrs, slots }, props.as, state, {
                    "data-primitives-part": "command-root",
                    ref: setRoot,
                });
            };
        },
    }),
);
