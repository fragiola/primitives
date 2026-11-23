import type { OpenChangeDetails } from "@fragiola/primitives-vue/menu";
import { reactive } from "vue";

/** The open menu's name, the last reason and the last clicked item a menubar scenario prints. */
export function useMenubarOutput() {
    const values = reactive<{
        menu?: string;
        reason?: string;
        action?: string;
    }>({});
    return {
        values,
        onOpenChange:
            (name: string) => (open: boolean, details: OpenChangeDetails) => {
                if (open) {
                    values.menu = name;
                } else if (values.menu === name) {
                    values.menu = undefined;
                }
                values.reason = details.reason;
            },
        select: (label: string) => () => {
            values.action = label;
        },
    };
}
