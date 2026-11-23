import type { ComputedRef, InjectionKey } from "vue";

/** A Clipboard's status (spec/clipboard.md, "API"). */
export type ClipboardStatus = "idle" | "copied" | "failed";

/** The state every part renders with. */
export interface ClipboardState {
    status: ClipboardStatus;
    copied: boolean;
    failed: boolean;
}

export interface ClipboardContext {
    state: ComputedRef<ClipboardState>;
    value: () => string;
    /** The state attributes, for every part. */
    attributes: ComputedRef<Record<string, string>>;
    /** The Trigger's press. */
    copy: (event: Event) => void;
    setInput: (element: unknown) => void;
}

export const ClipboardKey: InjectionKey<ClipboardContext> = Symbol("Clipboard");
