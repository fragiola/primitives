import { useState } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { SelectGroupContext } from "./select-context.ts";

/** A `group` of items, named by its GroupLabel (spec/select.md). */
export function SelectGroup(props: PartProps<Record<string, never>>) {
    const [labelId, setLabelId] = useState<string>();
    return (
        <SelectGroupContext.Provider value={setLabelId}>
            {renderElement(
                "div",
                props,
                {},
                {
                    role: "group",
                    "aria-labelledby": labelId,
                    "data-primitives-part": "select-group",
                },
            )}
        </SelectGroupContext.Provider>
    );
}
