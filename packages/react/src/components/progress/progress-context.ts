import type { ProgressStatus } from "@fragiola/primitives/range";
import { createContext } from "react";

export interface ProgressState {
    /** The clamped value, `null` when indeterminate. */
    value: number | null;
    min: number;
    max: number;
    status: ProgressStatus;
}

export interface ProgressContextValue extends ProgressState {
    /** From 0 to 100; `null` when indeterminate. */
    percent: number | null;
    /** The value as `format` writes it; `""` when indeterminate. */
    formattedValue: string;
    setLabelId: (id: string | undefined) => void;
}

export const ProgressContext = createContext<ProgressContextValue | null>(null);

/** The state the parts render with. */
export function progressState(context: ProgressContextValue): ProgressState {
    return {
        value: context.value,
        min: context.min,
        max: context.max,
        status: context.status,
    };
}

/** Exactly one of `data-indeterminate`, `data-progressing`, `data-complete` (spec/progress.md). */
export function statusAttributes(status: ProgressStatus) {
    return {
        indeterminate: status === "indeterminate",
        progressing: status === "progressing",
        complete: status === "complete",
    };
}
