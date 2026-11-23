import { h, type VNode } from "vue";

/** A stroked 24×24 icon, hidden from the accessibility tree (the fixtures' React `<svg>`s). */
export function icon(className: string, children: VNode[]): VNode {
    return h(
        "svg",
        {
            class: className,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "aria-hidden": "true",
        },
        children,
    );
}
