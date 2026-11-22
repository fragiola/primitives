import { computed, defineComponent, provide, shallowRef } from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    checkedAttributes,
    type MenuCheckableItemState,
    MenuCheckboxItemKey,
    MenuKey,
} from "./menu-context.ts";
import { useCheckableItem } from "./use-checkable-item.ts";
import { useMenuItem } from "./use-menu-item.ts";

/** A `menuitemcheckbox` (`v-model:checked`; spec/menu.md): toggles its checked state. */
export type MenuCheckboxItemState = MenuCheckableItemState;

export interface MenuCheckboxItemProps {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    /** The text typeahead matches (default: the item's text). */
    label?: string;
    /** A click closes every menu level (default `false`; Enter always closes, Space never). */
    closeOnClick?: boolean;
}

export type MenuCheckboxItemEmits = {
    "update:checked": (checked: boolean) => true;
    checkedChange: (checked: boolean, details: ChangeDetails) => true;
};

export const MenuCheckboxItem: PartComponent<
    MenuCheckboxItemProps,
    MenuCheckboxItemState,
    MenuCheckboxItemEmits
> = publicComponent(
    defineComponent({
        name: "MenuCheckboxItem",
        inheritAttrs: false,
        props: {
            ...asProp,
            checked: { type: Boolean, default: undefined },
            defaultChecked: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
            /** The text typeahead matches (default: the item's text). */
            label: { type: String, default: undefined },
            /** A click closes every menu level (default `false`). */
            closeOnClick: { type: Boolean, default: false },
        },
        emits: {
            "update:checked": (_checked: boolean) => true,
            checkedChange: (_checked: boolean, _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const context = useRequiredContext(MenuKey, "Menu.CheckboxItem");
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const item = useMenuItem(
                context,
                element,
                () => props.label,
                false,
            );
            const checked = useControllable<boolean, ChangeDetails>(
                () => props.checked,
                props.defaultChecked,
                (next, details) => {
                    emit("update:checked", next);
                    emit("checkedChange", next, details);
                },
            );
            const activation = useCheckableItem(context, {
                disabled: () => props.disabled,
                closeOnClick: () => props.closeOnClick,
                change: (event) =>
                    checked.set(!checked.value.value, {
                        reason: "item-press",
                        event,
                    }),
            });
            const state = computed(() => ({
                checked: checked.value.value,
                highlighted: item.highlighted.value,
                disabled: props.disabled,
            }));
            provide(MenuCheckboxItemKey, state);
            return () => {
                const { onClick, ...rest } = attrs;
                const consumer = props.disabled ? rest : attrs;
                void onClick;
                return renderPart(
                    "div",
                    { attrs: consumer, slots },
                    props.as,
                    state.value,
                    {
                        role: "menuitemcheckbox",
                        tabindex: -1,
                        "aria-checked": state.value.checked ? "true" : "false",
                        "aria-disabled": props.disabled ? "true" : undefined,
                        "data-primitives-part": `${context.component}-checkbox-item`,
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
