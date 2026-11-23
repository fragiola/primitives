import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { ListboxContext } from "./listbox-context.ts";

/**
 * Between items or groups; no role of its own (a `listbox` owns only groups and options), across
 * the list's orientation (spec/listbox.md).
 */
export function ListboxSeparator(props: PartProps<Record<string, never>>) {
    const context = useRequiredContext(ListboxContext, "Listbox.Separator");
    return renderElement(
        "div",
        props,
        {},
        {
            role: "presentation",
            "data-orientation":
                context.orientation === "vertical" ? "horizontal" : "vertical",
            "data-primitives-part": "listbox-separator",
        },
    );
}
