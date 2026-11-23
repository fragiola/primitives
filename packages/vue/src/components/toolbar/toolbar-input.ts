import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { useRovingItem } from "../../composables/use-roving-item.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { type ToolbarItemState, ToolbarKey } from "./toolbar-context.ts";

export interface ToolbarInputProps {
    /** The input ignores presses and typing. */
    disabled?: boolean;
    /** A disabled input the arrows still reach: `aria-disabled` and `readonly` (spec/toolbar.md). */
    focusableWhenDisabled?: boolean;
}

/**
 * A text input of a toolbar (spec/toolbar.md): an item of the toolbar's focus that keeps its caret
 * keys until the caret reaches the text's edge.
 */
export const ToolbarInput: PartComponent<ToolbarInputProps, ToolbarItemState> =
    publicComponent(
        defineComponent({
            name: "ToolbarInput",
            inheritAttrs: false,
            props: {
                ...asProp,
                disabled: { type: Boolean, default: false },
                focusableWhenDisabled: { type: Boolean, default: false },
            },
            setup(props, { attrs, slots }) {
                const toolbar = useRequiredContext(ToolbarKey, "Toolbar.Input");
                const item = useRovingItem(
                    () => !disabled() || props.focusableWhenDisabled,
                );
                const disabled = () =>
                    props.disabled || (item?.scope()?.disabled() ?? false);
                const preventWhenDisabled = (event: Event) => {
                    if (disabled()) {
                        event.preventDefault();
                    }
                };
                const onFocus = () => item?.onFocus();
                return () => {
                    const orientation = toolbar.orientation();
                    const isDisabled = disabled();
                    const { focusableWhenDisabled } = props;
                    return renderPart(
                        "input",
                        { attrs, slots },
                        props.as,
                        { orientation, disabled: isDisabled },
                        {
                            disabled:
                                isDisabled && !focusableWhenDisabled
                                    ? true
                                    : undefined,
                            "aria-disabled":
                                isDisabled && focusableWhenDisabled
                                    ? "true"
                                    : undefined,
                            readonly:
                                isDisabled && focusableWhenDisabled
                                    ? true
                                    : undefined,
                            tabindex: item?.tabIndex(),
                            "data-primitives-part": "toolbar-input",
                            ...stateAttributes({
                                orientation,
                                disabled: isDisabled,
                            }),
                            onClick: preventWhenDisabled,
                            onPointerdown: preventWhenDisabled,
                            onFocus,
                            ...(item === null ? {} : { ref: item.ref }),
                        },
                    );
                };
            },
        }),
    );
