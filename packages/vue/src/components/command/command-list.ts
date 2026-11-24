import { defineComponent } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CommandKey } from "./command-context.ts";

export interface CommandListState {
    empty: boolean;
    loading: boolean;
}

/** The `listbox` of Items, always displayed (spec/command.md). */
export const CommandList: PartComponent<
    Record<never, never>,
    CommandListState
> = publicComponent(
    defineComponent({
        name: "CommandList",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(CommandKey, "Command.List");
            const setList = elementSetter(context.list);
            return () => {
                const empty = context.shownCount.value === 0;
                const loading = context.loading();
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { empty, loading },
                    {
                        role: "listbox",
                        id: context.listId,
                        // a scrolling list is no Tab stop of its own (Chromium's focusable
                        // scrollers): the Input keeps the focus
                        tabindex: -1,
                        "aria-busy": loading ? "true" : undefined,
                        "data-primitives-part": "command-list",
                        ...stateAttributes({ empty, loading }),
                        ref: setList,
                    },
                );
            };
        },
    }),
);
