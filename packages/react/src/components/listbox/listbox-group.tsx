import { useState } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { ListboxGroupContext } from "./listbox-context.ts";

/** A `group` of items, named by its GroupLabel (spec/listbox.md). */
export function ListboxGroup(props: PartProps<Record<string, never>>) {
    const [labelId, setLabelId] = useState<string>();
    return (
        <ListboxGroupContext.Provider value={setLabelId}>
            {renderElement(
                "div",
                props,
                {},
                {
                    role: "group",
                    "aria-labelledby": labelId,
                    "data-primitives-part": "listbox-group",
                },
            )}
        </ListboxGroupContext.Provider>
    );
}
