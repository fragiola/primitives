import { defineComponent, inject, provide } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { RovingKey } from "../../utils/roving-context.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { type ToolbarItemState, ToolbarKey } from "./toolbar-context.ts";

export interface ToolbarGroupProps {
    /** Every item in it is disabled. */
    disabled?: boolean;
}

/**
 * A group of a toolbar's items (spec/toolbar.md): no focus of its own; it passes its `disabled`
 * on to the items inside it through the toolbar's roving scope ("Nested composites").
 */
export const ToolbarGroup: PartComponent<ToolbarGroupProps, ToolbarItemState> =
    publicComponent(
        defineComponent({
            name: "ToolbarGroup",
            inheritAttrs: false,
            props: {
                ...asProp,
                disabled: { type: Boolean, default: false },
            },
            setup(props, { attrs, slots }) {
                const toolbar = useRequiredContext(ToolbarKey, "Toolbar.Group");
                const scope = inject(RovingKey, null);
                const disabled = () =>
                    props.disabled || (scope?.disabled() ?? false);
                if (scope !== null) {
                    provide(RovingKey, { ...scope, disabled });
                }
                return () => {
                    const orientation = toolbar.orientation();
                    const isDisabled = disabled();
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        { orientation, disabled: isDisabled },
                        {
                            role: "group",
                            "data-primitives-part": "toolbar-group",
                            ...stateAttributes({
                                orientation,
                                disabled: isDisabled,
                            }),
                        },
                    );
                };
            },
        }),
    );
