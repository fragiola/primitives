import { useContext, useId, useLayoutEffect } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { ListboxGroupContext } from "./listbox-context.ts";

/** Names its Group (spec/listbox.md). */
export function ListboxGroupLabel(props: PartProps<Record<string, never>>) {
    const register = useContext(ListboxGroupContext);
    const generated = useId();
    const id = (props.id as string | undefined) ?? generated;
    useLayoutEffect(() => {
        register?.(id);
        return () => register?.(undefined);
    }, [id, register]);
    return renderElement(
        "div",
        props,
        {},
        { id, "data-primitives-part": "listbox-group-label" },
    );
}
