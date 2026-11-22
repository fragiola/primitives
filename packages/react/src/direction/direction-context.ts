import type { Direction } from "@fragiola/primitives/direction";
import { createContext } from "react";

/**
 * The direction a DirectionProvider gives (spec/direction.md), `null` without one. The components
 * read it here, so they never import the provider's entry: the context is utility code, and a
 * component without a provider around it reads the element's computed direction.
 */
export const DirectionContext = createContext<Direction | null>(null);
