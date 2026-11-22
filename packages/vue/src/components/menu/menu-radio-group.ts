import { defineComponent, inject, type PropType, provide } from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { MenuKey, MenuRadioGroupKey } from "./menu-context.ts";

/** A `group` of RadioItems holding their value (`v-model:value`; spec/menu.md). */
export interface MenuRadioGroupProps {
    /** The checked RadioItem's value; `null` for none. */
    value?: string | null;
    defaultValue?: string | null;
    /** Disables every RadioItem of the group. */
    disabled?: boolean;
}

export type MenuRadioGroupEmits = {
    "update:value": (value: string | null) => true;
    valueChange: (value: string | null, details: ChangeDetails) => true;
};

export const MenuRadioGroup: PartComponent<
    MenuRadioGroupProps,
    { disabled: boolean },
    MenuRadioGroupEmits
> = publicComponent(
    defineComponent({
        name: "MenuRadioGroup",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: {
                type: [String, null] as PropType<string | null>,
                default: undefined,
            },
            defaultValue: {
                type: [String, null] as PropType<string | null>,
                default: null,
            },
            /** Disables every RadioItem of the group. */
            disabled: { type: Boolean, default: false },
        },
        emits: {
            "update:value": (_value: string | null) => true,
            valueChange: (_value: string | null, _details: ChangeDetails) =>
                true,
        },
        setup(props, { attrs, slots, emit }) {
            const component = inject(MenuKey, null)?.component ?? "menu";
            const state = useControllable<string | null, ChangeDetails>(
                () => props.value,
                props.defaultValue,
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            provide(MenuRadioGroupKey, {
                value: state.value,
                disabled: () => props.disabled,
                setValue: (next, event) =>
                    state.set(next, { reason: "item-press", event }),
            });
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { disabled: props.disabled },
                    {
                        role: "group",
                        "data-primitives-part": `${component}-radio-group`,
                        ...stateAttributes({ disabled: props.disabled }),
                    },
                );
        },
    }),
);
