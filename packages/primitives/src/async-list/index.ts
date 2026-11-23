// The entry of @fragiola/primitives/async-list: the async list (spec/README.md, "Async lists"):
// the first page, the next pages and the pages of a filter text through the consumer's loader, a
// stale load aborted, the loading and error states. Framework-free; only the async lists import it.

export {
    type AsyncList,
    type AsyncListLoad,
    type AsyncListOptions,
    type AsyncListPage,
    type AsyncListRequest,
    type AsyncListState,
    type AsyncListStatus,
    createAsyncList,
} from "./async-list.ts";
