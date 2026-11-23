// The entry of @fragiola/primitives-angular/async-list: an async list in signals (spec/virtual-lists.md,
// "The mechanisms"), on the toolkit's `/async-list`, for the virtual lists' loaded items. No
// component's code.

export type {
    AsyncListLoad,
    AsyncListPage,
    AsyncListRequest,
    AsyncListStatus,
} from "@fragiola/primitives/async-list";
export {
    type AsyncListRef,
    type InjectAsyncListOptions,
    injectAsyncList,
} from "./inject/inject-async-list.ts";
