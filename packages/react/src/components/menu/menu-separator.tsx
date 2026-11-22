import { useContext } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { MenuContext } from "./menu-context.ts";

export function MenuSeparator(props: PartProps<Record<string, never>>) {
    const component = useContext(MenuContext)?.component ?? "menu";
    return renderElement(
        "div",
        props,
        {},
        {
            role: "separator",
            "aria-orientation": "horizontal",
            "data-primitives-part": `${component}-separator`,
        },
    );
}
