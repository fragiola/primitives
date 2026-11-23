import { createContext } from "react";

/** A Clipboard's status (spec/clipboard.md, "API"). */
export type ClipboardStatus = "idle" | "copied" | "failed";

/** The state every part renders with. */
export interface ClipboardState {
    status: ClipboardStatus;
    copied: boolean;
    failed: boolean;
}

export interface ClipboardContextValue extends ClipboardState {
    value: string;
    /** The state attributes, for every part. */
    attributes: Record<`data-${string}`, string>;
    /** The Trigger's press. */
    copy: (event: Event) => void;
    setInputElement: (element: HTMLInputElement | null) => void;
}

export const ClipboardContext = createContext<ClipboardContextValue | null>(
    null,
);

export function clipboardState(context: ClipboardContextValue): ClipboardState {
    return {
        status: context.status,
        copied: context.copied,
        failed: context.failed,
    };
}
