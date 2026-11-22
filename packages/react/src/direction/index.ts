// The entry of @fragiola/primitives-react/direction: the reading direction provider (spec/
// direction.md). A global provider in its own entry (D8): it references no component.

export type { Direction } from "@fragiola/primitives/direction";
export {
    DirectionProvider,
    type DirectionProviderProps,
} from "./direction-provider.tsx";
export { useDirection } from "./use-direction.ts";
