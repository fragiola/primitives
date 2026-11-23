import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagGroupKey, TagGroupTagKey } from "./tag-group-context.ts";

export interface TagGroupRemoveButtonState {
    disabled: boolean;
}

/** Removes its Tag (spec/tag-group.md, "Pointer"); a press never takes the focus. */
export const TagGroupRemoveButton: PartComponent<
    Record<never, never>,
    TagGroupRemoveButtonState
> = publicComponent(
    defineComponent({
        name: "TagGroupRemoveButton",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                TagGroupKey,
                "TagGroup.RemoveButton",
            );
            const tag = useRequiredContext(
                TagGroupTagKey,
                "TagGroup.RemoveButton",
            );
            return () => {
                const disabled = tag.disabled();
                const state = { disabled };
                return renderPart("button", { attrs, slots }, props.as, state, {
                    type: "button",
                    tabindex: -1,
                    disabled,
                    "data-primitives-part": "tag-group-remove-button",
                    ...stateAttributes(state),
                    onMousedown: (event: MouseEvent) => event.preventDefault(),
                    onClick: (event: MouseEvent) => {
                        // the Tag's own click selects nothing for it
                        event.preventDefault();
                        const element = tag.element();
                        if (element !== null) {
                            context.remove(element, "chip-remove-press", event);
                        }
                    },
                });
            };
        },
    }),
);
