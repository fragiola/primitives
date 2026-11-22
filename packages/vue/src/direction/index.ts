// The entry of @fragiola/primitives-vue/direction: the reading direction for the components
// inside a provider (spec/direction.md). A global provider: it references no component.

export type { Direction } from "@fragiola/primitives/direction";
export {
    DirectionProvider,
    type DirectionProviderProps,
} from "./direction-provider.ts";
export { useDirection } from "./use-direction.ts";
