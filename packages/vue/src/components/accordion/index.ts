// The entry of @fragiola/primitives-vue/accordion: stacked headers that show and hide their
// sections (spec/accordion.md, the APG's accordion).

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    AccordionItemState,
    AccordionOrientation,
    AccordionRootState,
} from "./accordion-context.ts";
export type { AccordionItemProps } from "./accordion-item.ts";
export type {
    AccordionPanelProps,
    AccordionPanelState,
} from "./accordion-panel.ts";
export type {
    AccordionRootEmits,
    AccordionRootProps,
} from "./accordion-root.ts";
export { Accordion } from "./parts.ts";
