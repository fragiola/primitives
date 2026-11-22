import { computed, defineComponent, provide, shallowRef } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    checkedAttributes,
    type MenuCheckableItemState,
    MenuKey,
    MenuRadioGroupKey,
    MenuRadioItemKey,
} from "./menu-context.ts";
import { useCheckableItem } from "./use-checkable-item.ts";
import { useMenuItem } from "./use-menu-item.ts";

/** A `menuitemradio` of its RadioGroup (spec/menu.md): checks its value. */
export type MenuRadioItemState = MenuCheckableItemState;

export interface MenuRadioItemProps {
    value: string;
    disabled?: boolean;
    /** The text typeahead matches (default: the item's text). */
    label?: string;
    /** A click closes every menu level (default `false`; Enter always closes, Space never). */
    closeOnClick?: boolean;
}

export const MenuRadioItem: PartComponent<
    MenuRadioItemProps,
    MenuRadioItemState
> = publicComponent(
    defineComponent({
        name: "MenuRadioItem",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: { type: String, required: true },
            disabled: { type: Boolean, default: false },
            /** The text typeahead matches (default: the item's text). */
            label: { type: String, default: undefined },
            /** A click closes every menu level (default `false`). */
            closeOnClick: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(MenuKey, "Menu.RadioItem");
            const group = useRequiredContext(
                MenuRadioGroupKey,
                "Menu.RadioItem",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const item = useMenuItem(
                context,
                element,
                () => props.label,
                false,
            );
            const disabled = () => props.disabled || group.disabled();
            const activation = useCheckableItem(context, {
                disabled,
                closeOnClick: () => props.closeOnClick,
                change: (event) => group.setValue(props.value, event),
            });
            const state = computed(() => ({
                checked: group.value.value === props.value,
                highlighted: item.highlighted.value,
                disabled: disabled(),
            }));
            provide(MenuRadioItemKey, state);
            return () => {
                const { onClick, ...rest } = attrs;
                const consumer = state.value.disabled ? rest : attrs;
                void onClick;
                return renderPart(
                    "div",
                    { attrs: consumer, slots },
                    props.as,
                    state.value,
                    {
                        role: "menuitemradio",
                        tabindex: -1,
                        "aria-checked": state.value.checked ? "true" : "false",
                        "aria-disabled": state.value.disabled
                            ? "true"
                            : undefined,
                        "data-primitives-part": `${context.component}-radio-item`,
                        ...stateAttributes(checkedAttributes(state.value)),
                        ...item.handlers,
                        ...activation,
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
