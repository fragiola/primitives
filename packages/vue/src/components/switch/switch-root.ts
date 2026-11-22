import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    computed,
    defineComponent,
    Fragment,
    h,
    provide,
    shallowRef,
    useId,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useFieldControl } from "../../composables/use-field-control.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    SwitchKey,
    type SwitchState,
    switchAttributes,
} from "./switch-context.ts";

export interface SwitchRootProps {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    required?: boolean;
    /** Focusable and submitted, but a press or a key does not toggle it. */
    readOnly?: boolean;
    name?: string;
    /** Submitted while on (`"on"`). */
    value?: string;
    /** Submitted while off, when given (Base UI); nothing is submitted while off without it. */
    uncheckedValue?: string;
    id?: string;
}

export type SwitchRootEmits = {
    "update:checked": (checked: boolean) => true;
    checkedChange: (checked: boolean, details: ChangeDetails) => true;
};

/** A `switch` (`v-model:checked`) with its hidden form inputs (spec/switch.md, the APG switch). */
export const SwitchRoot: PartComponent<
    SwitchRootProps,
    SwitchState,
    SwitchRootEmits
> = publicComponent(
    defineComponent({
        name: "SwitchRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            checked: { type: Boolean, default: undefined },
            defaultChecked: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
            required: { type: Boolean, default: false },
            /** Focusable and submitted, but a press or a key does not toggle it. */
            readOnly: { type: Boolean, default: false },
            name: { type: String, default: undefined },
            /** Submitted while on (`"on"`). */
            value: { type: String, default: "on" },
            /** Submitted while off, when given (Base UI). */
            uncheckedValue: { type: String, default: undefined },
            id: { type: String, default: undefined },
        },
        emits: {
            "update:checked": (_checked: boolean) => true,
            checkedChange: (_checked: boolean, _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const generatedId = useId();
            const id = computed(() => props.id ?? generatedId);
            const own = useControllable<boolean, ChangeDetails>(
                () => props.checked,
                props.defaultChecked,
                (next, details) => {
                    emit("update:checked", next);
                    emit("checkedChange", next, details);
                },
            );
            const button = shallowRef<HTMLElement | null>(null);
            const setButton = elementSetter(button);
            const input = shallowRef<HTMLInputElement | null>(null);
            const field = useFieldControl({
                id: () => id.value,
                labelable: true,
                value: () => own.value.value,
                filled: () => own.value.value,
                input: () => input.value,
                focusTarget: () => button.value,
            });
            const state = computed<SwitchState>(() => ({
                checked: own.value.value,
                disabled: props.disabled || field.disabled(),
                readOnly: props.readOnly,
                required: props.required,
            }));
            provide(SwitchKey, state);

            watch(
                input,
                (element, _, onCleanup) => {
                    if (element === null) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(element, {
                            reset: () => {
                                const checked = own.value.value;
                                field.reset();
                                own.set(props.defaultChecked, {
                                    reason: "none",
                                });
                                // the rendered state, which a patch follows (a controlled
                                // switch that refuses the reset keeps its input)
                                element.checked = checked;
                            },
                            invalid: () => button.value,
                        }),
                    );
                },
                { flush: "post" },
            );

            // Space and Enter click a native button: both toggle (APG, Base UI)
            const toggle = () => {
                const current = state.value;
                if (!current.disabled && !current.readOnly) {
                    own.set(!current.checked, { reason: "none" });
                }
            };

            return () => {
                const current = state.value;
                const formName = field.name() ?? props.name;
                return h(Fragment, [
                    renderPart("button", { attrs, slots }, props.as, current, {
                        type: "button",
                        role: "switch",
                        id: id.value,
                        disabled: current.disabled,
                        "aria-checked": current.checked ? "true" : "false",
                        "aria-required": current.required ? "true" : undefined,
                        "aria-readonly": current.readOnly ? "true" : undefined,
                        ...field.aria(),
                        "data-primitives-part": "switch-root",
                        ...field.attributes(),
                        ...stateAttributes(switchAttributes(current)),
                        onClick: toggle,
                        onFocus: field.onFocus,
                        onBlur: field.onBlur,
                        ref: setButton,
                    }),
                    h("input", {
                        ref: (element: unknown) => {
                            input.value = element as HTMLInputElement | null;
                        },
                        type: "checkbox",
                        "aria-hidden": "true",
                        tabindex: -1,
                        name: formName,
                        value: props.value,
                        checked: current.checked,
                        required: current.required,
                        disabled: current.disabled,
                        style: VISUALLY_HIDDEN_INPUT_STYLE,
                        "data-primitives-part": "switch-input",
                    }),
                    !current.checked && props.uncheckedValue !== undefined
                        ? h("input", {
                              type: "hidden",
                              name: formName,
                              value: props.uncheckedValue,
                              disabled: current.disabled,
                              "data-primitives-part": "switch-unchecked-input",
                          })
                        : null,
                ]);
            };
        },
    }),
);
