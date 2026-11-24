import { useId, useLayoutEffect, useState } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { CommandContext, CommandGroupContext } from "./command-context.ts";

/** A `group` of Items, named by its GroupLabel, hidden while it shows none (spec/command.md). */
export function CommandGroup(props: PartProps<{ hidden: boolean }>) {
    // the Group renders again with every new text (the context), so its check runs after its
    // Items rendered for it
    useRequiredContext(CommandContext, "Command.Group");
    const labelId = `${useId()}-label`;
    const [element, ref] = useElement<HTMLElement>();
    const [hidden, setHidden] = useState(false);
    // hidden while it shows no Item: its Items' effects ran before its own
    useLayoutEffect(() => {
        if (element !== null) {
            setHidden(
                element.querySelector('[role="option"]:not([hidden])') === null,
            );
        }
    });
    return (
        <CommandGroupContext.Provider value={{ labelId }}>
            {renderElement(
                "div",
                props,
                { hidden },
                {
                    role: "group",
                    "aria-labelledby": labelId,
                    hidden: hidden || undefined,
                    "data-primitives-part": "command-group",
                },
                ref,
            )}
        </CommandGroupContext.Provider>
    );
}
