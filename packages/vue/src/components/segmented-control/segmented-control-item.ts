import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    provide,
    shallowRef,
} from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    SegmentedControlItemKey,
    type SegmentedControlItemState,
    SegmentedControlKey,
} from "./segmented-control-context.ts";

export type { SegmentedControlItemState } from "./segmented-control-context.ts";

export interface SegmentedControlItemProps {
    /** Its value in the control. */
    value: string;
    disabled?: boolean;
    id?: string;
}

/** A segment: a `radio` of the control (spec/segmented-control.md). */
export const SegmentedControlItem: PartComponent<
    SegmentedControlItemProps,
    SegmentedControlItemState
> = publicComponent(
    defineComponent({
        name: "SegmentedControlItem",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: { type: String, required: true },
            disabled: { type: Boolean, default: false },
            id: { type: String, default: undefined },
        },
        setup(props, { attrs, slots }) {
            const control = useRequiredContext(
                SegmentedControlKey,
                "SegmentedControl.Item",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const state = computed<SegmentedControlItemState>(() => ({
                checked: control.value.value === props.value,
                disabled: props.disabled || control.disabled(),
                orientation: control.orientation(),
            }));
            provide(SegmentedControlItemKey, state);

            // registered once mounted, cleared on unmount (never on a server)
            let unregister: (() => void) | null = null;
            onMounted(() => {
                const node = element.value;
                if (node !== null) {
                    unregister = control.register({
                        value: () => props.value,
                        disabled: () => state.value.disabled,
                        element: node,
                    });
                }
            });
            onBeforeUnmount(() => {
                unregister?.();
                unregister = null;
            });

            const onClick = (event: MouseEvent) => {
                if (state.value.disabled) {
                    return;
                }
                // a press (or a press on its label) checks and focuses it
                (event.currentTarget as HTMLElement).focus();
                control.select(props.value, "item-press", event);
            };
            const onKeydown = (event: KeyboardEvent) => {
                // a native radio does not check on Enter (a button would click)
                if (event.key === "Enter") {
                    event.preventDefault();
                    return;
                }
                // Space checks it here, as a key: its click on key up is prevented
                if (event.key === " ") {
                    event.preventDefault();
                    if (!state.value.disabled) {
                        control.select(props.value, "keyboard", event);
                    }
                    return;
                }
                if (
                    control.navigate(
                        event.key,
                        event.currentTarget as HTMLElement,
                        event,
                    )
                ) {
                    event.preventDefault();
                }
            };
            const onKeyup = (event: KeyboardEvent) => {
                if (event.key === " ") {
                    event.preventDefault();
                }
            };

            return () => {
                const current = state.value;
                const { checked, disabled, orientation } = current;
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    current,
                    {
                        type: "button",
                        role: "radio",
                        id: props.id,
                        disabled,
                        "aria-checked": checked ? "true" : "false",
                        // the roving tab stop: before the Items registered (on a server), the
                        // checked one
                        tabindex:
                            control.tabStop.value === props.value && !disabled
                                ? 0
                                : -1,
                        "data-primitives-part": "segmented-control-item",
                        ...stateAttributes({
                            checked,
                            unchecked: !checked,
                            disabled,
                            orientation,
                        }),
                        onClick,
                        onKeydown,
                        onKeyup,
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
