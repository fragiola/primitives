// The entry of @fragiola/primitives/focus: tabbable elements, the focus trap, the initial focus, the keyboard modality.

export {
    type FocusTrapOptions,
    focusInitial,
    trapFocus,
} from "./focus-trap.ts";
export { isKeyboardModality } from "./focus-visible.ts";
export {
    getTabbables,
    nextTabbableAfter,
    previousTabbableBefore,
} from "./tabbable.ts";
