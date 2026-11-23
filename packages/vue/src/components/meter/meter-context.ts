import type { ComputedRef, InjectionKey, Ref } from "vue";

export interface MeterState {
    /** The value, clamped to `[min, max]`. */
    value: number;
    min: number;
    max: number;
}

export interface MeterComputed extends MeterState {
    /** From 0 to 100. */
    percent: number;
    /** The value as `format` writes it. */
    formattedValue: string;
}

export interface MeterContext {
    current: ComputedRef<MeterComputed>;
    /** The rendered Label's id: the Root's `aria-labelledby`. */
    labelId: Ref<string | undefined>;
}

export const MeterKey: InjectionKey<MeterContext> = Symbol("Meter");

/** The state the parts render with. */
export function meterState(current: MeterComputed): MeterState {
    return { value: current.value, min: current.min, max: current.max };
}
