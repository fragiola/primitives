import {
    containsFilter,
    filterItems,
    type ItemFilter,
    type ItemGroup,
    itemLabel,
} from "@fragiola/primitives/collection";
import { bridgeForm } from "@fragiola/primitives/form";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    computed,
    defineComponent,
    nextTick,
    type PropType,
    provide,
    ref,
    shallowRef,
    useId,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useFieldControl } from "../../composables/use-field-control.ts";
import {
    overlayRootEmits,
    overlayRootProps,
    useOverlayRoot,
} from "../../composables/use-overlay-root.ts";
import type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
} from "../../utils/change-details.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    type AutocompleteContext,
    type AutocompleteItemInfo,
    AutocompleteKey,
    type AutocompleteMode,
    type AutocompleteShown,
} from "./autocomplete-context.ts";

const NONE: readonly unknown[] = [];

/**
 * `filter` over the consumer's own items: `never` for the item and `unknown` for what
 * `itemToString` takes, so a filter typed for them binds with no cast (as Combobox's).
 */
export type AutocompleteFilter = (
    item: never,
    query: string,
    itemToString: (item: unknown) => string,
) => boolean;

/** `itemToStringValue` over the consumer's own items. */
export type AutocompleteItemToString = (item: never) => string;

export interface AutocompleteRootProps {
    open?: boolean;
    defaultOpen?: boolean;
    /** The text (controlled). */
    value?: string;
    /** The text at first (default `""`). */
    defaultValue?: string;
    /** The suggestions, or groups of them: the autocomplete filters them (`list`, `both`). */
    items?: readonly unknown[];
    /** `list` (default), `both`, `inline` or `none` (spec/autocomplete.md). */
    mode?: AutocompleteMode;
    /** Whether a suggestion matches the query; `null` turns filtering off. */
    filter?: AutocompleteFilter | null;
    /** The most suggestions the list renders; `-1` for no limit. */
    limit?: number;
    locale?: string;
    /** A suggestion's text, written into the input when chosen. */
    itemToStringValue?: AutocompleteItemToString;
    /** A press on the input opens the list (default `false`). */
    openOnInputClick?: boolean;
    /** Typing highlights the first suggestion (`list`, `none`; default `false`). */
    autoHighlight?: boolean;
    name?: string;
    required?: boolean;
    disabled?: boolean;
}

export type AutocompleteRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: OpenChangeDetails) => true;
    openChangeComplete: (open: boolean) => true;
    "update:value": (value: string) => true;
    valueChange: (value: string, details: ChangeDetails) => true;
};

/**
 * Holds the autocomplete's state (`v-model:value`, the text; `v-model:open`), spec/autocomplete.md.
 */
export const AutocompleteRoot: PublicComponent<
    AutocompleteRootProps,
    ContentSlots,
    AutocompleteRootEmits
> = publicComponent(
    defineComponent({
        name: "AutocompleteRoot",
        props: {
            ...overlayRootProps,
            /** The text (controlled). */
            value: { type: String, default: undefined },
            /** The text at first (default `""`). */
            defaultValue: { type: String, default: undefined },
            /** The suggestions, or groups of them. */
            items: {
                type: Array as PropType<
                    readonly (unknown | ItemGroup<unknown>)[]
                >,
                default: undefined,
            },
            mode: {
                type: String as PropType<AutocompleteMode>,
                default: "list",
            },
            filter: {
                type: Function as PropType<AutocompleteFilter | null>,
                default: undefined,
            },
            limit: { type: Number, default: -1 },
            locale: { type: String, default: undefined },
            itemToStringValue: {
                type: Function as PropType<AutocompleteItemToString>,
                default: undefined,
            },
            openOnInputClick: { type: Boolean, default: false },
            autoHighlight: { type: Boolean, default: false },
            name: { type: String, default: undefined },
            required: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
        },
        emits: {
            ...overlayRootEmits,
            "update:value": (_value: string) => true,
            valueChange: (_value: string, _details: ChangeDetails) => true,
        },
        setup(props, { emit, slots, expose }) {
            const root = useOverlayRoot(props, emit);
            // a template ref on the Root: `close()` and `unmount()` (spec/README.md, "Lifecycle")
            expose(root.actions);
            const label = (item: unknown) =>
                itemLabel(
                    item,
                    props.itemToStringValue as
                        | ((item: unknown) => string)
                        | undefined,
                );
            const valueState = useControllable<string, ChangeDetails>(
                () => props.value,
                props.defaultValue ?? "",
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            const value = computed(() => valueState.value.value);
            const setValue = (next: string, details: ChangeDetails) =>
                valueState.set(next, details);
            const inline = () =>
                props.mode === "both" || props.mode === "inline";
            const filters = () =>
                props.mode === "list" || props.mode === "both";

            const field = useFieldControl({
                id: () => root.trigger.value?.id || root.triggerId,
                labelable: true,
                value: () => value.value,
                filled: () => value.value !== "",
                input: () => root.trigger.value as HTMLInputElement | null,
                focusTarget: () => root.trigger.value,
            });
            const disabled = () => props.disabled || field.disabled();
            const highlighted = ref<string | null>(null);
            const shown = shallowRef<AutocompleteShown | null>(null);
            const items = new Map<HTMLElement, AutocompleteItemInfo>();
            const pending: AutocompleteContext["pending"] = { current: null };
            const pendingTick = ref(0);
            const requestHighlight: AutocompleteContext["requestHighlight"] = (
                next,
            ) => {
                pending.current = next;
                pendingTick.value++;
            };

            const setOpen = (
                next: boolean,
                reason: ChangeReason,
                event?: Event,
            ): boolean => {
                const completion = shown.value;
                const changed = root.setOpen(next, reason, event);
                if (next || !changed) {
                    return changed;
                }
                // leaving the input accepts the inline completion (APG, spec/autocomplete.md)
                if (
                    inline() &&
                    completion !== null &&
                    !completion.disabled &&
                    (reason === "focus-out" || reason === "outside-press")
                ) {
                    setValue(label(completion.item), {
                        reason: "input-blur",
                        event,
                    });
                }
                shown.value = null;
                highlighted.value = null;
                pending.current = null;
                return changed;
            };

            const filter = computed<ItemFilter<unknown> | null>(() =>
                props.filter === undefined
                    ? containsFilter<unknown>(props.locale)
                    : (props.filter as ItemFilter<unknown> | null),
            );
            const entries = computed<readonly unknown[]>(() => {
                const list = props.items;
                if (list === undefined) {
                    return NONE;
                }
                return filterItems(list, filters() ? value.value.trim() : "", {
                    filter: filters() ? filter.value : null,
                    limit: props.limit,
                    itemToString: label,
                });
            });

            const context: AutocompleteContext = {
                ...root,
                setOpen,
                field,
                mode: () => props.mode,
                value,
                shown,
                text: () => shown.value?.text ?? value.value,
                type(text, addition, event) {
                    setValue(text, { reason: "input-change", event });
                    shown.value = null;
                    highlighted.value = null;
                    pending.current = null;
                    const filled = text.trim() !== "";
                    if (filled && !root.open.value) {
                        // an opening the consumer refused asks for no highlight later
                        if (!setOpen(true, "input-change", event)) {
                            return;
                        }
                    } else if (
                        !filled &&
                        root.open.value &&
                        !props.openOnInputClick
                    ) {
                        setOpen(false, "input-clear", event);
                        return;
                    }
                    if (!filled) {
                        return;
                    }
                    if (inline()) {
                        if (addition) {
                            requestHighlight("complete");
                        }
                    } else if (props.autoHighlight) {
                        requestHighlight("first");
                    }
                },
                disabled,
                name: () => field.name() ?? props.name,
                required: () => props.required,
                openOnInputClick: () => props.openOnInputClick,
                highlighted,
                highlight(id, from) {
                    highlighted.value = id;
                    if (!inline()) {
                        return;
                    }
                    // a hover completes nothing: the input shows the value again
                    if (from === "pointer") {
                        shown.value = null;
                        return;
                    }
                    const item = [...items.values()].find(
                        (entry) => entry.id === id,
                    );
                    shown.value =
                        item === undefined
                            ? null
                            : {
                                  item: item.value,
                                  text: label(item.value),
                                  selectFrom: null,
                                  disabled: item.disabled,
                              };
                },
                complete(item) {
                    // the suggestion's whole text, the part after the typed characters selected (APG)
                    highlighted.value = item.id;
                    shown.value = {
                        item: item.value,
                        text: label(item.value),
                        selectFrom: value.value.length,
                        disabled: item.disabled,
                    };
                },
                choose(item, event) {
                    shown.value = null;
                    highlighted.value = null;
                    setValue(label(item), { reason: "item-press", event });
                    setOpen(false, "item-press", event);
                },
                clear(reason, event) {
                    shown.value = null;
                    highlighted.value = null;
                    setValue("", { reason, event });
                },
                label,
                hasItems: () => props.items !== undefined,
                entries,
                items,
                list: shallowRef(null),
                button: shallowRef(null),
                inputGroup: shallowRef(null),
                clearButton: shallowRef(null),
                listId: `${useId()}-list`,
                pending,
                pendingTick,
                requestHighlight,
                placed: ref<{ side: Side; align: Align }>({
                    side: "bottom",
                    align: "start",
                }),
                itemCount: ref(0),
            };
            provide(AutocompleteKey, context);

            watch(
                root.trigger,
                (element, _, onCleanup) => {
                    if (!(element instanceof HTMLInputElement)) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(element, {
                            reset: () => {
                                field.reset();
                                shown.value = null;
                                highlighted.value = null;
                                setValue(props.defaultValue ?? "", {
                                    reason: "none",
                                });
                                setOpen(false, "none");
                                // the browser reset the input: write the text back once rendered
                                void nextTick().then(() => {
                                    if (element.value !== context.text()) {
                                        element.value = context.text();
                                    }
                                });
                            },
                        }),
                    );
                },
                { flush: "post", immediate: true },
            );

            return () => slots.default?.();
        },
    }),
);
