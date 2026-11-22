import type { Placement } from "@floating-ui/dom";
import type { Direction } from "../direction/direction.ts";

/**
 * The side of the anchor an overlay sits on (spec/README.md, `data-side`; Base UI's names, D4 §3
 * "Naming"): `inline-start` and `inline-end` follow the direction (`inline-end` is the right in
 * LTR, the left in RTL), `left` and `right` are physical.
 */
export type Side =
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "inline-start"
    | "inline-end";
export type Align = "start" | "center" | "end";

type PhysicalSide = "top" | "bottom" | "left" | "right";

function physicalSide(side: Side, direction: Direction): PhysicalSide {
    switch (side) {
        case "inline-start":
            return direction === "rtl" ? "right" : "left";
        case "inline-end":
            return direction === "rtl" ? "left" : "right";
        default:
            return side;
    }
}

/** The Floating UI placement of a side and align, in a direction. */
export function toPlacement(
    side: Side,
    align: Align,
    direction: Direction,
): Placement {
    const physical = physicalSide(side, direction);
    if (align === "center") {
        return physical;
    }
    // Floating UI's -start/-end follow the physical axis: on top/bottom, -start is the left edge
    const flipAlign =
        direction === "rtl" && (physical === "top" || physical === "bottom");
    const physicalAlign = flipAlign
        ? align === "start"
            ? "end"
            : "start"
        : align;
    return `${physical}-${physicalAlign}`;
}

/**
 * The side and align of a resolved Floating UI placement. A horizontal side is named as it was
 * asked: logically (`inline-start` / `inline-end`) when `requested` is a logical side, physically
 * (`left` / `right`) otherwise, so a flipped `inline-end` reports `inline-start`.
 */
export function fromPlacement(
    placement: Placement,
    direction: Direction,
    requested: Side = "bottom",
): { side: Side; align: Align } {
    const [physical, edge] = placement.split("-") as [
        PhysicalSide,
        "start" | "end" | undefined,
    ];
    const logical = requested === "inline-start" || requested === "inline-end";
    const side: Side =
        logical && (physical === "left" || physical === "right")
            ? (physical === "left") === (direction === "rtl")
                ? "inline-end"
                : "inline-start"
            : physical;
    if (edge === undefined) {
        return { side, align: "center" };
    }
    const flipAlign =
        direction === "rtl" && (physical === "top" || physical === "bottom");
    return {
        side,
        align: flipAlign ? (edge === "start" ? "end" : "start") : edge,
    };
}
