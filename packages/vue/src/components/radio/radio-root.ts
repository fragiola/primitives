import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    computed,
    defineComponent,
    Fragment,
    h,
    onBeforeUnmount,
    onMounted,
    provide,
    shallowRef,
    watch,
} from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { RadioGroupKey } from "../radio-group/radio-group-context.ts";
import { RadioKey, type RadioState, radioAttributes } from "./radio-context.ts";

export interface RadioRootProps {
    /** Its value in the group. */
    value: string;
    disabled?: boolean;
    id?: string;
}

/** A `radio` of a RadioGroup, with its hidden form input (spec/radio-group.md). */
export const RadioRoot: PartComponent<RadioRootProps, RadioState> =
    publicComponent(
        defineComponent({
            name: "RadioRoot",
            inheritAttrs: false,
            props: {
                ...asProp,
                /** Its value in the group. */
                value: { type: String, required: true },
                disabled: { type: Boolean, default: false },
                id: { type: String, default: undefined },
            },
            setup(props, { attrs, slots }) {
                const group = useRequiredContext(RadioGroupKey, "Radio.Root");
                const button = shallowRef<HTMLElement | null>(null);
                const setButton = elementSetter(button);
                const input = shallowRef<HTMLInputElement | null>(null);
                const state = computed<RadioState>(() => ({
                    checked: group.value.value === props.value,
                    disabled: props.disabled || group.disabled(),
                    required: group.required(),
                }));
                provide(RadioKey, state);

                // registered once mounted, cleared on unmount (never on a server)
                let unregister: (() => void) | null = null;
                onMounted(() => {
                    unregister = group.register({
                        value: () => props.value,
                        disabled: () => state.value.disabled,
                        element: () => button.value,
                    });
                });
                onBeforeUnmount(() => {
                    unregister?.();
                    unregister = null;
                });

                watch(
                    input,
                    (element, _, onCleanup) => {
                        if (element === null) {
                            return;
                        }
                        onCleanup(
                            bridgeForm(element, {
                                // every radio of the group reports the reset; the group
                                // returns to its default once
                                reset: () => group.reset(),
                                invalid: () => group.tabStopElement(),
                            }),
                        );
                    },
                    { flush: "post" },
                );

                const onClick = (event: MouseEvent) => {
                    if (state.value.disabled) {
                        return;
                    }
                    // a press on its label checks and focuses it
                    (event.currentTarget as HTMLElement).focus();
                    group.select(props.value);
                };
                const onKeydown = (event: KeyboardEvent) => {
                    // a native radio does not check on Enter (a button would click)
                    if (event.key === "Enter") {
                        event.preventDefault();
                        return;
                    }
                    if (
                        group.navigate(
                            event.key,
                            event.currentTarget as HTMLElement,
                        )
                    ) {
                        event.preventDefault();
                    }
                };

                return () => {
                    const current = state.value;
                    // the roving tab stop: before the radios registered (on a server), the
                    // checked one
                    const holdsTabStop =
                        group.tabStop.value === props.value &&
                        !current.disabled;
                    return h(Fragment, [
                        renderPart(
                            "button",
                            { attrs, slots },
                            props.as,
                            current,
                            {
                                type: "button",
                                role: "radio",
                                id: props.id,
                                disabled: current.disabled,
                                "aria-checked": current.checked
                                    ? "true"
                                    : "false",
                                tabindex: holdsTabStop ? 0 : -1,
                                "data-primitives-part": "radio-root",
                                ...stateAttributes({
                                    ...radioAttributes(current),
                                    required: current.required,
                                }),
                                onClick,
                                onKeydown,
                                ref: setButton,
                            },
                        ),
                        h("input", {
                            ref: (element: unknown) => {
                                input.value =
                                    element as HTMLInputElement | null;
                            },
                            type: "radio",
                            "aria-hidden": "true",
                            tabindex: -1,
                            name: group.name(),
                            value: props.value,
                            checked: current.checked,
                            required: current.required,
                            disabled: current.disabled,
                            style: VISUALLY_HIDDEN_INPUT_STYLE,
                            "data-primitives-part": "radio-input",
                        }),
                    ]);
                };
            },
        }),
    );
