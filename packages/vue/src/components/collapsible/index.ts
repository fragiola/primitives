// The entry of @fragiola/primitives-vue/collapsible: a button that shows and hides a panel
// (spec/collapsible.md, the APG's disclosure).

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { CollapsibleState } from "./collapsible-context.ts";
export type {
    CollapsiblePanelProps,
    CollapsiblePanelState,
} from "./collapsible-panel.ts";
export type {
    CollapsibleRootEmits,
    CollapsibleRootProps,
} from "./collapsible-root.ts";
export { Collapsible } from "./parts.ts";
