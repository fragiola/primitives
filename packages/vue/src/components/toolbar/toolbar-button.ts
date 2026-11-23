import { defineComponent, type PropType } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { useRovingItem } from "../../composables/use-roving-item.ts";
import { buttonAttributes } from "../../utils/button-attributes.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { type ToolbarItemState, ToolbarKey } from "./toolbar-context.ts";

export interface ToolbarButtonProps {
    /** The button ignores presses and keys. */
    disabled?: boolean;
    /** A disabled button the arrows still reach (spec/toolbar.md, "Disabled items"). */
    focusableWhenDisabled?: boolean;
    /** Whether the rendered element is a native `<button>` (default `true`), as Button's. */
    nativeButton?: boolean;
    /** Forwarded; a native button is `type="button"` unless given. */
    type?: "button" | "submit" | "reset";
}

/** A button of a toolbar (spec/toolbar.md): Button's behaviour, an item of the toolbar's focus. */
export const ToolbarButton: PartComponent<
    ToolbarButtonProps,
    ToolbarItemState
> = publicComponent(
    defineComponent({
        name: "ToolbarButton",
        inheritAttrs: false,
        props: {
            ...asProp,
            disabled: { type: Boolean, default: false },
            focusableWhenDisabled: { type: Boolean, default: false },
            nativeButton: { type: Boolean, default: true },
            type: {
                type: String as PropType<"button" | "submit" | "reset">,
                default: undefined,
            },
        },
        setup(props, { attrs, slots }) {
            const toolbar = useRequiredContext(ToolbarKey, "Toolbar.Button");
            const item = useRovingItem(
                () => !disabled() || props.focusableWhenDisabled,
            );
            const disabled = () =>
                props.disabled || (item?.scope()?.disabled() ?? false);
            const onFocus = () => item?.onFocus();
            return () => {
                const orientation = toolbar.orientation();
                const isDisabled = disabled();
                const { rest, internal } = buttonAttributes(
                    {
                        disabled: isDisabled,
                        focusableWhenDisabled: props.focusableWhenDisabled,
                        nativeButton: props.nativeButton,
                        type: props.type,
                        tabIndex: item?.tabIndex(),
                        composite: true,
                    },
                    attrs,
                );
                return renderPart(
                    "button",
                    { attrs: rest, slots },
                    props.as,
                    { orientation, disabled: isDisabled },
                    {
                        ...internal,
                        "data-primitives-part": "toolbar-button",
                        ...stateAttributes({
                            orientation,
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
