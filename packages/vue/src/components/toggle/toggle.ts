import { defineComponent, inject } from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useRovingItem } from "../../composables/use-roving-item.ts";
import { buttonAttributes } from "../../utils/button-attributes.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToggleGroupKey } from "./toggle-group-context.ts";

export interface ToggleState {
    pressed: boolean;
    disabled: boolean;
}

export interface ToggleProps {
    /** Whether it is pressed (controlled); ignored inside a ToggleGroup. */
    pressed?: boolean;
    /** Pressed at first (default `false`); ignored inside a ToggleGroup. */
    defaultPressed?: boolean;
    /** Its value in a ToggleGroup (required there). */
    value?: string;
    /** It ignores presses and keys. */
    disabled?: boolean;
    /**
     * Whether the rendered element is a native `<button>` (default `true`). `false` when `as` or
     * the `render` slot gives another element: the Toggle adds `role="button"`, the tab order and
     * the keys.
     */
    nativeButton?: boolean;
}

export type ToggleEmits = {
    /** Its new state (`v-model:pressed`); not inside a ToggleGroup. */
    "update:pressed": (pressed: boolean) => true;
    /** Every press, before a group's `value-change` (reason `none`). */
    pressedChange: (pressed: boolean, details: ChangeDetails) => true;
};

/**
 * A two-state button (spec/toggle.md, the APG's toggle button): `aria-pressed`, Button's
 * behaviour, one of a ToggleGroup's values inside one, and an item of the nearest roving-focus
 * scope (a ToggleGroup's, a Toolbar's) inside one.
 */
export const Toggle: PartComponent<ToggleProps, ToggleState, ToggleEmits> =
    publicComponent(
        defineComponent({
            name: "ToggleRoot",
            inheritAttrs: false,
            props: {
                ...asProp,
                pressed: { type: Boolean, default: undefined },
                defaultPressed: { type: Boolean, default: false },
                value: { type: String, default: undefined },
                disabled: { type: Boolean, default: false },
                nativeButton: { type: Boolean, default: true },
            },
            emits: {
                "update:pressed": (_pressed: boolean) => true,
                pressedChange: (_pressed: boolean, _details: ChangeDetails) =>
                    true,
            },
            setup(props, { attrs, slots, emit }) {
                const group = inject(ToggleGroupKey, null);
                const own = useControllable<boolean, ChangeDetails>(
                    () => props.pressed,
                    props.defaultPressed,
                    (next, details) => {
                        emit("update:pressed", next);
                        emit("pressedChange", next, details);
                    },
                );
                const pressed = () =>
                    group === null
                        ? own.value.value
                        : props.value !== undefined &&
                          group.value().includes(props.value);
                // a disabled Toggle is natively disabled: it cannot take focus (Base UI)
                const item = useRovingItem(() => !disabled());
                const disabled = () =>
                    props.disabled ||
                    (group?.disabled() ?? false) ||
                    (item?.scope()?.disabled() ?? false);

                const press = (event: MouseEvent) => {
                    const next = !pressed();
                    const details: ChangeDetails = { reason: "none", event };
                    if (group === null) {
                        own.set(next, details);
                    } else {
                        emit("pressedChange", next, details);
                        if (props.value !== undefined) {
                            group.setPressed(props.value, next, details);
                        }
                    }
                };
                const onFocus = () => item?.onFocus();
                return () => {
                    const isPressed = pressed();
                    const isDisabled = disabled();
                    const { rest, internal } = buttonAttributes(
                        {
                            disabled: isDisabled,
                            focusableWhenDisabled: false,
                            nativeButton: props.nativeButton,
                            // a Toggle never submits a form
                            type: props.nativeButton ? "button" : undefined,
                            tabIndex: item?.tabIndex(),
                            composite: (item?.scope() ?? null) !== null,
                            onPress: press,
                        },
                        attrs,
                    );
                    return renderPart(
                        "button",
                        { attrs: rest, slots },
                        props.as,
                        { pressed: isPressed, disabled: isDisabled },
                        {
                            ...internal,
                            "aria-pressed": isPressed ? "true" : "false",
                            "data-primitives-part": "toggle-root",
                            ...stateAttributes({
                                pressed: isPressed,
                                disabled: isDisabled,
                            }),
                            onFocus,
                            ...(item === null ? {} : { ref: item.ref }),
                        },
                    );
                };
            },
        }),
    );
