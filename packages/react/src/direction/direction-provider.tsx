import type { Direction } from "@fragiola/primitives/direction";
import type { ReactNode } from "react";
import { DirectionContext } from "./direction-context.ts";

export interface DirectionProviderProps {
    /** The reading direction of everything inside it (default `"ltr"`). */
    direction?: Direction;
    children?: ReactNode;
}

/**
 * Tells the components inside it the reading direction (spec/direction.md). It renders only its
 * children: no element, no `dir`. A nested provider wins inside it.
 */
export function DirectionProvider({
    direction = "ltr",
    children,
}: DirectionProviderProps) {
    return (
        <DirectionContext.Provider value={direction}>
            {children}
        </DirectionContext.Provider>
    );
}
