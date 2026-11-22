import type { OpenChangeDetails } from "@fragiola/primitives-vue/dialog";
import { reactive } from "vue";

/**
 * What every lifecycle scenario prints and does (spec/README.md, "The lifecycle scenarios"): the
 * open state that happened, the last reason, `open-change-complete`'s last value, and, with
 * `?cancel`, the reason of the last close it canceled.
 */
export function useLifecycle(cancel: boolean | undefined) {
    const values = reactive<{
        open: boolean;
        reason: string | undefined;
        complete: boolean | undefined;
        canceled: string | undefined;
    }>({
        open: false,
        reason: undefined,
        complete: undefined,
        canceled: undefined,
    });
    return {
        values,
        onOpenChange: (next: boolean, details: OpenChangeDetails) => {
            values.reason = details.reason;
            if (cancel === true && !next) {
                details.cancel();
                values.canceled = details.reason;
                return;
            }
            values.open = next;
        },
        onOpenChangeComplete: (next: boolean) => {
            values.complete = next;
        },
    };
}
