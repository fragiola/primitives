import { useContext, useId, useLayoutEffect } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { SelectGroupContext } from "./select-context.ts";

/** Names its Group (spec/select.md). */
export function SelectGroupLabel(props: PartProps<Record<string, never>>) {
    const register = useContext(SelectGroupContext);
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
        { id, "data-primitives-part": "select-group-label" },
    );
}
