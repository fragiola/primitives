import {
    computed,
    defineComponent,
    type PropType,
    provide,
    ref,
    shallowRef,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import {
    OUTSIDE_FIELD,
    useFieldControl,
} from "../../composables/use-field-control.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CheckboxGroupKey } from "./checkbox-group-context.ts";

export interface CheckboxGroupState {
    disabled: boolean;
}

export interface CheckboxGroupProps {
    value?: readonly string[];
    defaultValue?: readonly string[];
    /** Every child value: what the parent checkbox checks. */
    allValues?: readonly string[];
    disabled?: boolean;
}

export type CheckboxGroupEmits = {
    "update:value": (value: string[]) => true;
    valueChange: (value: string[], details: ChangeDetails) => true;
};

/** Checkboxes sharing one array value (`v-model:value`), with an optional parent (spec/checkbox.md). */
export const CheckboxGroup: PartComponent<
    CheckboxGroupProps,
    CheckboxGroupState,
    CheckboxGroupEmits
> = publicComponent(
    defineComponent({
        name: "CheckboxGroup",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: {
                type: Array as PropType<readonly string[]>,
                default: undefined,
            },
            defaultValue: {
                type: Array as PropType<readonly string[]>,
                default: () => [],
            },
            /** Every child value: what the parent checkbox checks. */
            allValues: {
                type: Array as PropType<readonly string[]>,
                default: () => [],
            },
            disabled: { type: Boolean, default: false },
        },
        emits: {
            "update:value": (_value: string[]) => true,
            valueChange: (_value: string[], _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const state = useControllable<readonly string[], ChangeDetails>(
                () => props.value,
                props.defaultValue,
                (next, details) => {
                    emit("update:value", [...next]);
                    emit("valueChange", [...next], details);
                },
            );
            const value = computed(() => state.value.value);
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            // inside a Field, the group is its control (spec/field.md, "Integration contract")
            const field = useFieldControl({
                id: () => undefined,
                labelable: false,
                value: () => [...value.value],
                filled: () => value.value.length > 0,
                // nothing the browser validates: `validate` decides
                input: () => null,
                // the first enabled checkbox
                focusTarget: () =>
                    element.value?.querySelector<HTMLElement>(
                        '[role="checkbox"]:not([disabled])',
                    ) ?? null,
            });
            const disabled = () => props.disabled || field.disabled();
            const order = (values: readonly string[]) =>
                props.allValues.length === 0
                    ? [...values]
                    : [
                          ...props.allValues.filter((entry) =>
                              values.includes(entry),
                          ),
                          ...values.filter(
                              (entry) => !props.allValues.includes(entry),
                          ),
                      ];
            provide(CheckboxGroupKey, {
                value,
                allValues: () => props.allValues,
                disabled,
                toggle(entry, checked) {
                    const current = value.value;
                    state.set(
                        checked
                            ? order([
                                  ...current.filter(
                                      (item: string) => item !== entry,
                                  ),
                                  entry,
                              ])
                            : current.filter((item: string) => item !== entry),
                        { reason: "none" },
                    );
                },
                setAll(checked) {
                    state.set(checked ? [...props.allValues] : [], {
                        reason: "none",
                    });
                },
                reset() {
                    state.set(props.defaultValue, { reason: "none" });
                },
                ids: ref({}),
                field: field.inField
                    ? {
                          ...OUTSIDE_FIELD,
                          name: field.name,
                          disabled: field.disabled,
                      }
                    : null,
            });
            // focus within the group: touched once focus leaves it
            const onFocusin = () => field.onFocus();
            const onFocusout = (event: FocusEvent) => {
                const next = event.relatedTarget as Node | null;
                if (next === null || !element.value?.contains(next)) {
                    field.onBlur();
                }
            };
            return () => {
                const isDisabled = disabled();
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { disabled: isDisabled },
                    {
                        role: "group",
                        ...field.aria(),
                        "data-primitives-part": "checkbox-group-root",
                        ...field.attributes(),
                        ...stateAttributes({ disabled: isDisabled }),
                        onFocusin,
                        onFocusout,
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
