import type {
    DefineSetupFnComponent,
    ObjectEmitsOptions,
    SlotsType,
    VNode,
} from "vue";
import type { AsProp, RenderSlotProps } from "./render-part.ts";

/** No events: every listener a part takes is a fallthrough attribute. */
export type NoEmits = Record<never, never>;

/**
 * A component's public type, declared rather than inferred from `defineComponent`'s options: its
 * props, its events and its slots. Vue's inferred type spells its internals with `any`, which the
 * built declarations must not have (scripts/check-dts.ts), as Tree's and Dockable's `TreeComponent`
 * (fragiola/tree, packages/vue/src/utils/primitive.ts).
 */
export type PublicComponent<
    Props extends object,
    Slots extends object,
    Emits extends ObjectEmitsOptions = NoEmits,
> = DefineSetupFnComponent<Props, Emits, SlotsType<Slots>>;

/** The slots of a part: its content (with its state), or `render` in place of its element. */
export interface PartSlots<State> {
    default?: (scope: { state: State }) => VNode[];
    render?: (scope: RenderSlotProps<State>) => VNode[];
}

/** A part: its own props plus `as`, the part slots, and its events. */
export type PartComponent<
    Props extends object,
    State,
    Emits extends ObjectEmitsOptions = NoEmits,
> = PublicComponent<Props & { as?: AsProp }, PartSlots<State>, Emits>;

/** The slots of a part that renders no element (a root, a portal). */
export interface ContentSlots {
    default?: () => VNode[];
}

/** Gives a component the public type its declaration states (see `PublicComponent`). */
export function publicComponent<T>(component: unknown): T {
    return component as T;
}
