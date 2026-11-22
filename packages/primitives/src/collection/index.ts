// The entry of @fragiola/primitives/collection: list navigation, the key maps of tabs, menus and radio groups, typeahead, the combobox's item helpers and chip keys, the Tabs Indicator's placement before hydration.

export {
    type ChipKeyAction,
    chipArrows,
    chipKeyTarget,
} from "./chip-keys.ts";
export {
    containsFilter,
    type FilterItemsOptions,
    filterItems,
    flattenItems,
    type ItemEquality,
    type ItemFilter,
    type ItemGroup,
    includesItem,
    isItemGroup,
    itemFormValue,
    itemLabel,
    itemsEqual,
    queryIsLabel,
    textContains,
    toggleItem,
} from "./combobox-items.ts";
export {
    menuKeyTarget,
    type RadioKeyOptions,
    radioKeyTarget,
    submenuKeys,
    type TabsKeyOptions,
    tabsKeyTarget,
} from "./key-maps.ts";
export {
    edgeIndex,
    type NavigationOptions,
    stepIndex,
    stepThroughNone,
} from "./list-navigation.ts";
export { scrollIntoViewWithin } from "./scroll-into-view.ts";
export { placeTabsIndicator } from "./tabs-indicator.ts";
export { createTypeahead } from "./typeahead.ts";
