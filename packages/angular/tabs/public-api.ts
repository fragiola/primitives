// The entry of @fragiola/primitives-angular/tabs: tabs and their panels (spec/tabs.md, the APG's
// tabs pattern), as standalone attribute directives on the consumer's own elements.

export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export {
    TabsIndicator,
    type TabsIndicatorState,
} from "./directives/tabs-indicator.directive.ts";
export { TabsList } from "./directives/tabs-list.directive.ts";
export {
    TabsPanel,
    type TabsPanelState,
} from "./directives/tabs-panel.directive.ts";
export {
    type TabInfo,
    TabsRoot,
    type TabsRootState,
} from "./directives/tabs-root.directive.ts";
export {
    TabsTab,
    type TabsTabState,
} from "./directives/tabs-tab.directive.ts";
export { injectTabs } from "./inject/inject-tabs.ts";
