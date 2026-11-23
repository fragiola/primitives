import { createToastManager } from "@fragiola/primitives-react/toast";

/** spec/toast.md `/toast/basic`: a queue in a plain module, which the scenario adds to directly. */
export const notifications = createToastManager({ timeout: 3000 });
