// The entry of @fragiola/primitives-react/accordion: stacked headers that show and hide their
// sections (spec/accordion.md, the APG's accordion).

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type {
    AccordionItemState,
    AccordionOrientation,
    AccordionRootState,
} from "./accordion-context.ts";
export type { AccordionHeaderProps } from "./accordion-header.tsx";
export type { AccordionItemProps } from "./accordion-item.tsx";
export type {
    AccordionPanelProps,
    AccordionPanelState,
} from "./accordion-panel.tsx";
export type { AccordionRootProps } from "./accordion-root.tsx";
export type { AccordionTriggerProps } from "./accordion-trigger.tsx";
export { Accordion } from "./parts.ts";
