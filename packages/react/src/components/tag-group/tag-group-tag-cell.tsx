import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { TagGroupTagContext } from "./tag-group-context.ts";

/** A Tag's one `gridcell`: holds its content and its RemoveButton (spec/tag-group.md). */
export function TagGroupTagCell(props: PartProps<Record<string, never>>) {
    useRequiredContext(TagGroupTagContext, "TagGroup.TagCell");
    return renderElement(
        "div",
        props,
        {},
        { role: "gridcell", "data-primitives-part": "tag-group-tag-cell" },
    );
}
