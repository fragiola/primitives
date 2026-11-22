import type { Direction } from "@fragiola/primitives/direction";
import { defineComponent, type PropType, provide } from "vue";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../utils/public-component.ts";
import { DirectionKey } from "./direction-context.ts";

export interface DirectionProviderProps {
    /** The reading direction of everything inside it (default `"ltr"`). */
    direction?: Direction;
}

/**
 * Gives the components inside it their reading direction (spec/direction.md). Renders only its
 * default slot: no element, no `dir`. A nested provider wins inside it.
 */
export const DirectionProvider: PublicComponent<
    DirectionProviderProps,
    ContentSlots
> = publicComponent(
    defineComponent({
        name: "DirectionProvider",
        props: {
            /** The reading direction of everything inside it (default `"ltr"`). */
            direction: {
                type: String as PropType<Direction>,
                default: "ltr",
            },
        },
        setup(props, { slots }) {
            provide(DirectionKey, () => props.direction);
            return () => slots.default?.();
        },
    }),
);
