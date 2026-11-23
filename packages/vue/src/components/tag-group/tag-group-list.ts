import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagGroupKey } from "./tag-group-context.ts";

export interface TagGroupListState {
    empty: boolean;
    disabled: boolean;
}

/**
 * The `grid` of tags, a `group` while it holds none (spec/tag-group.md): it takes the focus after
 * the last removal.
 */
export const TagGroupList: PartComponent<
    Record<never, never>,
    TagGroupListState
> = publicComponent(
    defineComponent({
        name: "TagGroupList",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(TagGroupKey, "TagGroup.List");
            return () => {
                const empty = context.empty.value;
                const disabled = context.disabled();
                const state = { empty, disabled };
                return renderPart("div", { attrs, slots }, props.as, state, {
                    role: empty ? "group" : "grid",
                    tabindex: empty ? -1 : undefined,
                    ...context.fieldAria(),
                    "aria-labelledby": context.labelledBy(),
                    "aria-multiselectable":
                        context.multiple() && !empty ? "true" : undefined,
                    "data-primitives-part": "tag-group-list",
                    ...context.fieldAttributes(),
                    ...stateAttributes(state),
                    onKeydown: context.onListKeydown,
                    onFocusin: context.onListFocusin,
                    onFocusout: context.onListFocusout,
                    ref: context.setList,
                });
            };
        },
    }),
);
