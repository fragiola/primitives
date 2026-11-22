// The entry of @fragiola/primitives-angular/accordion: stacked headers that show and hide their
// sections (spec/accordion.md, the APG's accordion), as standalone directives on the consumer's
// own elements.

export type {
    ChangeDetails,
    ChangeReason,
    TransitionStatus,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { AccordionHeader } from "./directives/accordion-header.directive.ts";
export {
    AccordionItem,
    type AccordionItemState,
} from "./directives/accordion-item.directive.ts";
export {
    AccordionPanel,
    type AccordionPanelOptions,
    type AccordionPanelState,
} from "./directives/accordion-panel.directive.ts";
export {
    type AccordionOrientation,
    AccordionRoot,
    type AccordionRootState,
} from "./directives/accordion-root.directive.ts";
export { AccordionTrigger } from "./directives/accordion-trigger.directive.ts";
