// The entry of @fragiola/primitives-vue/tabs: tabs and their panels (spec/tabs.md, the APG's tabs
// pattern).

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { Tabs } from "./parts.ts";
export type {
    TabsIndicatorProps,
    TabsIndicatorState,
} from "./tabs-indicator.ts";
export type { TabsListState } from "./tabs-list.ts";
export type { TabsPanelProps, TabsPanelState } from "./tabs-panel.ts";
export type {
    TabsRootEmits,
    TabsRootProps,
    TabsRootState,
} from "./tabs-root.ts";
export type { TabsTabProps, TabsTabState } from "./tabs-tab.ts";
