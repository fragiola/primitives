import { createContext } from "react";

export interface MeterState {
    /** The value, clamped to `[min, max]`. */
    value: number;
    min: number;
    max: number;
}

export interface MeterContextValue extends MeterState {
    /** From 0 to 100. */
    percent: number;
    /** The value as `format` writes it. */
    formattedValue: string;
    setLabelId: (id: string | undefined) => void;
}

export const MeterContext = createContext<MeterContextValue | null>(null);

/** The state the parts render with. */
export function meterState(context: MeterContextValue): MeterState {
    return { value: context.value, min: context.min, max: context.max };
}
