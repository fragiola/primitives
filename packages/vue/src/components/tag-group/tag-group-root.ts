import {
    removalFocusIndex,
    rovingTabStop,
    tagGroupKeyTarget,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    applySelection,
    createListModel,
    listPressSelection,
    type SelectionChange,
    sameSelection,
} from "@fragiola/primitives/selection";
import {
    computed,
    defineComponent,
    getCurrentInstance,
    nextTick,
    onMounted,
    type PropType,
    provide,
    shallowRef,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useFieldControl } from "../../composables/use-field-control.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagGroupKey, type TagGroupTagEntry } from "./tag-group-context.ts";

/** How many tags a TagGroup selects (spec/tag-group.md, "API"). */
export type TagGroupSelectionMode = "none" | "single" | "multiple";

export interface TagGroupRootState {
    disabled: boolean;
    empty: boolean;
}

export interface TagGroupRootProps {
    /** How many tags can be selected (default `"none"`). */
    selectionMode?: TagGroupSelectionMode;
    /** The selected tags' values, in the tags' order (an array in every mode; `v-model:value`). */
    value?: readonly string[];
    defaultValue?: readonly string[];
    /** The values of the disabled tags. */
    disabledKeys?: readonly string[];
    /** Every tag is disabled. */
    disabled?: boolean;
    /** The arrows wrap from the last tag to the first and back (default `true`). */
    loopFocus?: boolean;
}

export type TagGroupRootEmits = {
    "update:value": (value: string[]) => true;
    valueChange: (value: string[], details: ChangeDetails) => true;
    /** A tag asks to be removed: remove it in the listener, or keep it. Without a listener, no tag is removable. */
    remove: (value: string, details: ChangeDetails) => true;
};

const NONE: readonly string[] = [];
const NO_MODIFIERS = { shiftKey: false, ctrlKey: false, metaKey: false };

interface OrderedTag {
    element: HTMLElement;
    value: string;
    disabled: boolean;
}

/** The tags in document order, read now. */
function inOrder(entries: readonly TagGroupTagEntry[]): OrderedTag[] {
    return entries
        .map((entry) => ({
            element: entry.element,
            value: entry.value(),
            disabled: entry.disabled(),
        }))
        .sort((a, b) =>
            a.element.compareDocumentPosition(b.element) &
            Node.DOCUMENT_POSITION_FOLLOWING
                ? -1
                : 1,
        );
}

/**
 * A focusable group of tags (spec/tag-group.md, React Aria's grid of tags): the selection, the
 * roving focus, the removal and its focus rule, the Field binding.
 */
export const TagGroupRoot: PartComponent<
    TagGroupRootProps,
    TagGroupRootState,
    TagGroupRootEmits
> = publicComponent(
    defineComponent({
        name: "TagGroupRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            selectionMode: {
                type: String as PropType<TagGroupSelectionMode>,
                default: "none",
            },
            value: {
                type: Array as PropType<readonly string[]>,
                default: undefined,
            },
            defaultValue: {
                type: Array as PropType<readonly string[]>,
                default: undefined,
            },
            disabledKeys: {
                type: Array as PropType<readonly string[]>,
                default: undefined,
            },
            disabled: { type: Boolean, default: false },
            loopFocus: { type: Boolean, default: true },
        },
        emits: {
            "update:value": (_value: string[]) => true,
            valueChange: (_value: string[], _details: ChangeDetails) => true,
            remove: (_value: string, _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const instance = getCurrentInstance();
            const own = useControllable<readonly string[], ChangeDetails>(
                () => props.value,
                props.defaultValue ?? NONE,
                (next, details) => {
                    emit("update:value", [...next]);
                    emit("valueChange", [...next], details);
                },
            );
            const selected = computed(() => own.value.value);
            const direction = useProvidedDirection();
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const list = shallowRef<HTMLElement | null>(null);
            const setList = elementSetter(list);
            const entries = shallowRef<readonly TagGroupTagEntry[]>([]);
            const active = shallowRef<HTMLElement | null>(null);
            const labelId = shallowRef<string>();
            // a server render knows no tag: it never says "empty" (spec/tag-group.md, "Empty state")
            const mounted = shallowRef(false);
            onMounted(() => {
                mounted.value = true;
            });
            let anchor: string | null = null;

            /** A listener of `remove` is bound: the tags are removable. */
            const removable = () => {
                const bound = instance?.vnode.props ?? {};
                return (
                    bound.onRemove !== undefined ||
                    bound.onRemoveOnce !== undefined
                );
            };
            const disabledKeys = () => props.disabledKeys ?? NONE;

            // the Field focuses the tab stop: none when every tag is disabled (`disabledKeys`,
            // the group's or the field's `disabled` included)
            const tabStopElement = (): HTMLElement | null => tabStop.value;

            // inside a Field, the List is the field's control (spec/tag-group.md, "Forms")
            const field = useFieldControl({
                id: () => undefined,
                labelable: false,
                value: () => [...selected.value],
                filled: () => selected.value.length > 0,
                input: () => null,
                element: () => element.value,
                focusTarget: tabStopElement,
            });
            const disabled = () => props.disabled || field.disabled();
            const isDisabled = (entry: OrderedTag) =>
                disabled() ||
                entry.disabled ||
                disabledKeys().includes(entry.value);
            const mode = () => props.selectionMode;

            const select = (
                change: SelectionChange | null,
                reason: ChangeReason,
                event: Event,
            ) => {
                const current = mode();
                if (change === null || current === "none") {
                    return;
                }
                const items = inOrder(entries.value);
                const model = createListModel(
                    items.map((entry) => ({
                        key: entry.value,
                        textValue: "",
                        disabled: isDisabled(entry),
                    })),
                );
                const next = applySelection(
                    model,
                    { selected: selected.value, anchor },
                    change,
                    { mode: current, behavior: "toggle" },
                );
                anchor = next.anchor;
                if (!sameSelection(next.selected, selected.value)) {
                    own.set([...next.selected], { reason, event });
                }
            };

            const remove = (
                item: HTMLElement,
                reason: ChangeReason,
                event?: Event,
            ) => {
                const items = inOrder(entries.value);
                const index = items.findIndex(
                    (entry) => entry.element === item,
                );
                const entry = items[index];
                if (entry === undefined || isDisabled(entry) || !removable()) {
                    return;
                }
                emit("remove", entry.value, { reason, event });
                // once the app's change has rendered (spec/tag-group.md, "Focus")
                void nextTick().then(() => {
                    // the app kept it: it keeps the focus
                    if (item.isConnected) {
                        item.focus();
                        return;
                    }
                    const target = removalFocusIndex(
                        items.length,
                        index,
                        (candidate) => {
                            const other = items[candidate];
                            return (
                                other === undefined ||
                                !other.element.isConnected ||
                                isDisabled(other)
                            );
                        },
                    );
                    (target === -1
                        ? list.value
                        : items[target]?.element
                    )?.focus();
                });
            };

            const onListKeydown = (event: KeyboardEvent) => {
                if (disabled() || event.defaultPrevented) {
                    return;
                }
                const items = inOrder(entries.value);
                const index = items.findIndex(
                    (entry) => entry.element === event.target,
                );
                const entry = items[index];
                const current = event.currentTarget as HTMLElement;
                if (entry === undefined) {
                    return;
                }
                const action = tagGroupKeyTarget(event, index, items.length, {
                    rtl: getDirection(current, direction()) === "rtl",
                    loop: props.loopFocus,
                    skip: (candidate) => {
                        const other = items[candidate];
                        return other === undefined || isDisabled(other);
                    },
                    selectable: mode() !== "none",
                    removable: removable(),
                });
                if (action === null) {
                    return;
                }
                event.preventDefault();
                if (action.type === "focus") {
                    items[action.index]?.element.focus();
                } else if (action.type === "select") {
                    select(
                        listPressSelection(entry.value, NO_MODIFIERS, {
                            mode: mode(),
                            behavior: "toggle",
                        }),
                        "keyboard",
                        event,
                    );
                } else {
                    remove(entry.element, "keyboard", event);
                }
            };

            const register = (entry: TagGroupTagEntry) => {
                entries.value = [...entries.value, entry];
                return () => {
                    entries.value = entries.value.filter(
                        (item) => item !== entry,
                    );
                };
            };
            const focused = (item: HTMLElement) => {
                active.value = item;
            };
            const press = (item: HTMLElement, event: MouseEvent) => {
                const entry = inOrder(entries.value).find(
                    (candidate) => candidate.element === item,
                );
                if (entry === undefined || isDisabled(entry)) {
                    return;
                }
                select(
                    listPressSelection(entry.value, NO_MODIFIERS, {
                        mode: mode(),
                        behavior: "toggle",
                    }),
                    "item-press",
                    event,
                );
            };
            const onListFocusout = (event: FocusEvent) => {
                const next = event.relatedTarget;
                const container = event.currentTarget as HTMLElement;
                if (!(next instanceof Node) || !container.contains(next)) {
                    field.onBlur();
                }
            };

            const empty = computed(
                () => mounted.value && entries.value.length === 0,
            );
            const tabStop = computed(() => {
                const ordered = inOrder(entries.value);
                const index = rovingTabStop(
                    ordered.length,
                    ordered.findIndex(
                        (entry) => entry.element === active.value,
                    ),
                    (candidate) => {
                        const other = ordered[candidate];
                        return other === undefined || isDisabled(other);
                    },
                );
                return ordered[index]?.element ?? null;
            });
            provide(TagGroupKey, {
                selectable: () => mode() !== "none",
                multiple: () => mode() === "multiple",
                disabled,
                disabledKeys,
                selected,
                empty,
                tabStop,
                labelledBy: () =>
                    field.aria()["aria-labelledby"] ?? labelId.value,
                setLabelId: (id) => {
                    labelId.value = id;
                },
                setList,
                fieldAria: field.aria,
                fieldAttributes: field.attributes,
                onListKeydown,
                onListFocusin: () => field.onFocus(),
                onListFocusout,
                register,
                focused,
                press,
                remove,
            });

            return () => {
                const state = { disabled: disabled(), empty: empty.value };
                return renderPart("div", { attrs, slots }, props.as, state, {
                    "data-primitives-part": "tag-group-root",
                    ...stateAttributes(state),
                    ref: setElement,
                });
            };
        },
    }),
);
