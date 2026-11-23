import type { RovingOrientation } from "@fragiola/primitives/collection";
import { defineComponent, inject, type PropType, provide } from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useRovingComposite } from "../../composables/use-roving-composite.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import {
    forwardingScope,
    RovingKey,
    scopeOfElement,
} from "../../utils/roving-context.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToggleGroupKey } from "../toggle/toggle-group-context.ts";

export interface ToggleGroupState {
    value: string[];
    disabled: boolean;
    multiple: boolean;
    orientation: RovingOrientation;
}

export interface ToggleGroupProps {
    /** The values of the pressed toggles (controlled). */
    value?: readonly string[];
    /** The values pressed at first (default `[]`). */
    defaultValue?: readonly string[];
    /** Several toggles may be pressed (default `false`). */
    multiple?: boolean;
    /** Every toggle is disabled. */
    disabled?: boolean;
    /** The arrow keys' axis (default `"horizontal"`); a Toolbar's inside one. */
    orientation?: RovingOrientation;
    /** The arrows wrap from the last toggle to the first and back (default `true`). */
    loopFocus?: boolean;
}

export type ToggleGroupEmits = {
    /** The values of the pressed toggles (`v-model:value`). */
    "update:value": (value: string[]) => true;
    /** Every change of the pressed values (reason `none`). */
    valueChange: (value: string[], details: ChangeDetails) => true;
};

/**
 * Toggles sharing one value (`v-model:value`; spec/toggle-group.md, Base UI's ToggleGroup with
 * the APG toolbar's keys): one tab stop, the arrows move the focus. Inside a Toolbar it opens no
 * roving focus of its own: its Toggles are the toolbar's items (spec/toolbar.md, "Nested
 * composites").
 */
export const ToggleGroup: PartComponent<
    ToggleGroupProps,
    ToggleGroupState,
    ToggleGroupEmits
> = publicComponent(
    defineComponent({
        name: "ToggleGroup",
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
            multiple: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
            orientation: {
                type: String as PropType<RovingOrientation>,
                default: "horizontal",
            },
            loopFocus: { type: Boolean, default: true },
        },
        emits: {
            "update:value": (_value: string[]) => true,
            valueChange: (_value: string[], _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const own = useControllable<readonly string[], ChangeDetails>(
                () => props.value,
                props.defaultValue,
                (next, details) => {
                    emit("update:value", [...next]);
                    emit("valueChange", [...next], details);
                },
            );
            const around = inject(RovingKey, null);
            const composite = useRovingComposite({
                orientation: () => props.orientation,
                loopFocus: () => props.loopFocus,
                disabled: () => false,
            });
            // a Toolbar's scope around it, unless the group is outside the toolbar's element (in
            // a popup a Teleport renders from the toolbar: "Nested composites", 6)
            const outer = () => scopeOfElement(around, composite.scope.root());
            const disabled = () =>
                props.disabled || (outer()?.disabled() ?? false);
            const orientation = () =>
                outer()?.orientation() ?? props.orientation;
            provide(
                RovingKey,
                forwardingScope(() => outer() ?? composite.scope),
            );
            provide(ToggleGroupKey, {
                value: () => own.value.value,
                disabled,
                setPressed: (item, pressed, details) => {
                    const others = own.value.value.filter(
                        (entry: string) => entry !== item,
                    );
                    const next = pressed
                        ? props.multiple
                            ? [...others, item]
                            : [item]
                        : others;
                    own.set(next, details);
                },
            });
            return () => {
                const isDisabled = disabled();
                const { multiple } = props;
                const currentOrientation = orientation();
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {
                        value: [...own.value.value],
                        disabled: isDisabled,
                        multiple,
                        orientation: currentOrientation,
                    },
                    {
                        role: "group",
                        "data-primitives-part": "toggle-group-root",
                        ...stateAttributes({
                            orientation: currentOrientation,
                            multiple,
                            disabled: isDisabled,
                        }),
                        // inside a Toolbar, the toolbar's root handles the keys
                        onKeydown:
                            outer() === null ? composite.onKeydown : undefined,
                        ref: composite.ref,
                    },
                );
            };
        },
    }),
);
