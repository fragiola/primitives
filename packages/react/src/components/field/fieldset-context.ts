import { createContext } from "react";

/**
 * What an enclosing Fieldset gives the fields inside it (spec/fieldset.md). It lives with the
 * field, so Fieldset is built on Field and never the other way round.
 */
export interface FieldsetContextValue {
    /** The fieldset, or one around it, is disabled. */
    disabled: boolean;
    /** The Legend's id, while one is rendered. */
    setLegendId: (id: string | undefined) => void;
}

export const FieldsetContext = createContext<FieldsetContextValue | null>(null);
