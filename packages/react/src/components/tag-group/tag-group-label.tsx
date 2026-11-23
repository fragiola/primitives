import { useId, useLayoutEffect } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { TagGroupContext } from "./tag-group-context.ts";

/** Names the List (spec/tag-group.md); in a Field, the `Field.Label` does. */
export function TagGroupLabel(props: PartProps<Record<string, never>>) {
    const { setLabelId } = useRequiredContext(
        TagGroupContext,
        "TagGroup.Label",
    );
    const generated = useId();
    const id = (props.id as string | undefined) ?? generated;
    useLayoutEffect(() => {
        setLabelId(id);
        return () => setLabelId(undefined);
    }, [id, setLabelId]);
    return renderElement(
        "span",
        props,
        {},
        { id, "data-primitives-part": "tag-group-label" },
    );
}
