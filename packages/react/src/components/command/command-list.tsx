import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { mergeRefs } from "../../utils/merge-refs.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CommandContext } from "./command-context.ts";

export interface CommandListState {
    empty: boolean;
    loading: boolean;
}

/** The `listbox` of Items, always displayed (spec/command.md). */
export function CommandList({ ref, ...props }: PartProps<CommandListState>) {
    const context = useRequiredContext(CommandContext, "Command.List");
    const empty = context.shownCount === 0;
    const { loading } = context;
    return renderElement(
        "div",
        props,
        { empty, loading },
        {
            role: "listbox",
            id: context.listId,
            // a scrolling list is no Tab stop of its own (Chromium's focusable scrollers): the
            // Input keeps the focus
            tabIndex: -1,
            "aria-busy": loading ? "true" : undefined,
            "data-primitives-part": "command-list",
            ...stateAttributes({ empty, loading }),
        },
        mergeRefs(context.setList, ref),
    );
}
