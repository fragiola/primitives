import { radioKeyTarget } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    computed,
    defineComponent,
    h,
    type PropType,
    provide,
    shallowRef,
    watch,
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
import {
    type SegmentedControlItemEntry,
    SegmentedControlKey,
} from "./segmented-control-context.ts";

export interface SegmentedControlRootState {
    value: string | null;
    disabled: boolean;
    required: boolean;
    orientation: "horizontal" | "vertical";
}

export interface SegmentedControlRootProps {
    /** The checked Item's value; `null` for none (controlled). */
    value?: string | null;
    /** The Item checked at first (default: none). */
    defaultValue?: string | null;
    /** Disables every Item. */
    disabled?: boolean;
    /** The form's validation fails while no Item is checked. */
    required?: boolean;
    /** The hidden input's name. */
    name?: string;
    /** `aria-orientation` and `data-orientation` (default `"horizontal"`); it changes no key. */
    orientation?: "horizontal" | "vertical";
    /** The arrows wrap from the last Item to the first and back (default `true`). */
    loopFocus?: boolean;
}

export type SegmentedControlRootEmits = {
    /** The checked Item's value; `null` when a form reset returns the control to none. */
    "update:value": (value: string | null) => true;
    valueChange: (value: string | null, details: ChangeDetails) => true;
};

/** The Items in document order. */
function inOrder(entries: readonly SegmentedControlItemEntry[]) {
    return entries
        .map((entry) => ({
            value: entry.value(),
            disabled: entry.disabled(),
            element: entry.element,
        }))
        .sort((a, b) =>
            a.element.compareDocumentPosition(b.element) &
            Node.DOCUMENT_POSITION_FOLLOWING
                ? -1
                : 1,
        );
}

/** The Item holding the tab stop: the checked one when enabled, else the first enabled one. */
function tabStopOf(
    entries: readonly SegmentedControlItemEntry[],
    value: string | null,
) {
    const enabled = inOrder(entries).filter((entry) => !entry.disabled);
    return enabled.find((entry) => entry.value === value) ?? enabled[0];
}

/**
 * A single choice among segments, with an Indicator that follows the checked one
 * (`v-model:value`; spec/segmented-control.md, the APG radio group): the `radiogroup`, one tab
 * stop, the arrows move the focus and the check together, and a hidden input for native forms.
 */
export const SegmentedControlRoot: PartComponent<
    SegmentedControlRootProps,
    SegmentedControlRootState,
    SegmentedControlRootEmits
> = publicComponent(
    defineComponent({
        name: "SegmentedControlRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: {
                type: String as PropType<string | null>,
                default: undefined,
            },
            defaultValue: {
                type: String as PropType<string | null>,
                default: null,
            },
            disabled: { type: Boolean, default: false },
            required: { type: Boolean, default: false },
            name: { type: String, default: undefined },
            orientation: {
                type: String as PropType<"horizontal" | "vertical">,
                default: "horizontal",
            },
            loopFocus: { type: Boolean, default: true },
        },
        emits: {
            "update:value": (_value: string | null) => true,
            valueChange: (_value: string | null, _details: ChangeDetails) =>
                true,
        },
        setup(props, { attrs, slots, emit }) {
            const own = useControllable<string | null, ChangeDetails>(
                () => props.value,
                props.defaultValue,
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            const value = computed(() => own.value.value);
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const direction = useProvidedDirection();
            const items = shallowRef<readonly SegmentedControlItemEntry[]>([]);
            const input = shallowRef<HTMLInputElement | null>(null);

            const tabStopElement = () =>
                tabStopOf(items.value, value.value)?.element ?? null;
            // inside a Field, the Root is the field's control (spec/field.md, "Integration
            // contract"), as RadioGroup: no labelable element; the validated element is the
            // hidden input
            const field = useFieldControl({
                id: () => undefined,
                labelable: false,
                value: () => value.value,
                filled: () => value.value !== null,
                input: () => input.value,
                element: () => element.value,
                focusTarget: tabStopElement,
            });
            const disabled = () => props.disabled || field.disabled();

            const select = (next: string, reason: ChangeReason, event: Event) =>
                own.set(next, { reason, event });
            const navigate = (key: string, from: HTMLElement, event: Event) => {
                const ordered = inOrder(items.value);
                const index = ordered.findIndex(
                    (entry) => entry.element === from,
                );
                const root = element.value;
                if (index === -1 || root === null) {
                    return false;
                }
                const target = radioKeyTarget(key, index, ordered.length, {
                    rtl: getDirection(root, direction()) === "rtl",
                    loop: props.loopFocus,
                    skip: (candidate) => ordered[candidate]?.disabled ?? true,
                });
                const entry = target === null ? undefined : ordered[target];
                if (entry === undefined) {
                    return false;
                }
                entry.element.focus();
                select(entry.value, "keyboard", event);
                return true;
            };
            const register = (entry: SegmentedControlItemEntry) => {
                items.value = [...items.value, entry];
                return () => {
                    items.value = items.value.filter((item) => item !== entry);
                };
            };

            // a form reset returns the control to its default (spec/segmented-control.md,
            // "Forms")
            watch(
                input,
                (hidden, _, onCleanup) => {
                    if (hidden === null) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(hidden, {
                            reset: () => {
                                field.reset();
                                own.set(props.defaultValue, { reason: "none" });
                                // the browser reset the input to its default: write the
                                // rendered value back (a patch follows a change)
                                hidden.value = value.value ?? "";
                            },
                            invalid: tabStopElement,
                        }),
                    );
                },
                { flush: "post" },
            );

            // before the Items registered (on a server), only a checked Item holds the tab stop
            const tabStop = computed(() =>
                disabled()
                    ? null
                    : items.value.length === 0
                      ? value.value
                      : (tabStopOf(items.value, value.value)?.value ?? null),
            );
            const checkedElement = computed(() => {
                const current = value.value;
                return current === null
                    ? null
                    : (items.value.find((entry) => entry.value() === current)
                          ?.element ?? null);
            });
            provide(SegmentedControlKey, {
                value,
                disabled,
                orientation: () => props.orientation,
                tabStop,
                root: element,
                checkedElement,
                select,
                navigate,
                register,
            });

            // focus within the Root; touched once focus leaves it
            const onFocusin = () => field.onFocus();
            const onFocusout = (event: FocusEvent) => {
                const next = event.relatedTarget as Node | null;
                if (next === null || !element.value?.contains(next)) {
                    field.onBlur();
                }
            };
            const setInput = (node: unknown) => {
                input.value = node as HTMLInputElement | null;
            };
            return () => {
                const isDisabled = disabled();
                const { required, orientation } = props;
                const current = value.value;
                const fieldName = field.name() ?? props.name;
                const state = {
                    value: current,
                    disabled: isDisabled,
                    required,
                    orientation,
                };
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        role: "radiogroup",
                        "aria-orientation": orientation,
                        "aria-required": required ? "true" : undefined,
                        "aria-disabled": isDisabled ? "true" : undefined,
                        ...field.aria(),
                        "data-primitives-part": "segmented-control-root",
                        ...field.attributes(),
                        ...stateAttributes({
                            disabled: isDisabled,
                            required,
                            orientation,
                        }),
                        onFocusin,
                        onFocusout,
                        ref: setElement,
                    },
                    () => [
                        ...(slots.default?.({ state }) ?? []),
                        h("input", {
                            ref: setInput,
                            "aria-hidden": "true",
                            tabindex: -1,
                            name: current === null ? undefined : fieldName,
                            value: current ?? "",
                            required,
                            disabled: isDisabled,
                            style: VISUALLY_HIDDEN_INPUT_STYLE,
                            "data-primitives-part": "segmented-control-input",
                        }),
                    ],
                );
            };
        },
    }),
);
