import type { ProgressStatus } from "@fragiola/primitives/range";
import type { ComputedRef, InjectionKey, Ref } from "vue";

export interface ProgressState {
    /** The clamped value, `null` when indeterminate. */
    value: number | null;
    min: number;
    max: number;
    status: ProgressStatus;
}

export interface ProgressComputed extends ProgressState {
    /** From 0 to 100; `null` when indeterminate. */
    percent: number | null;
    /** The value as `format` writes it; `""` when indeterminate. */
    formattedValue: string;
}

export interface ProgressContext {
    current: ComputedRef<ProgressComputed>;
    /** The rendered Label's id: the Root's `aria-labelledby`. */
    labelId: Ref<string | undefined>;
}

export const ProgressKey: InjectionKey<ProgressContext> = Symbol("Progress");

/** The state the parts render with. */
export function progressState(current: ProgressComputed): ProgressState {
    return {
        value: current.value,
        min: current.min,
        max: current.max,
        status: current.status,
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
