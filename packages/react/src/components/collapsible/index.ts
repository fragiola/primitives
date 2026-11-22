// The entry of @fragiola/primitives-react/collapsible: a button that shows and hides a panel
// (spec/collapsible.md, the APG's disclosure).

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type { CollapsibleState } from "./collapsible-context.ts";
export type {
    CollapsiblePanelProps,
    CollapsiblePanelState,
} from "./collapsible-panel.tsx";
export type { CollapsibleRootProps } from "./collapsible-root.tsx";
export type { CollapsibleTriggerProps } from "./collapsible-trigger.tsx";
export { Collapsible } from "./parts.ts";
