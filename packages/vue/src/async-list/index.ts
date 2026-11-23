// The entry of @fragiola/primitives-vue/async-list: `useAsyncList`, the toolkit's async list
// (`@fragiola/primitives/async-list`) in Vue state, for the virtual lists' async loading
// (spec/virtual-lists.md). A utility: it holds no component's code.

export type {
    AsyncListLoad,
    AsyncListPage,
    AsyncListRequest,
    AsyncListState,
    AsyncListStatus,
} from "@fragiola/primitives/async-list";
export {
    type AsyncListResult,
    type UseAsyncListOptions,
    useAsyncList,
} from "./use-async-list.ts";
