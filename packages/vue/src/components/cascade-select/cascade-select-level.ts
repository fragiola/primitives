import type { CascadeItem } from "@fragiola/primitives/cascade";
import { defineComponent, provide, type VNode } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    type AsProp,
    asProp,
    type RenderSlotProps,
    renderPart,
} from "../../utils/render-part.ts";
import {
    CascadeSelectKey,
    CascadeSelectLevelKey,
} from "./cascade-select-context.ts";

export interface CascadeSelectLevelState {
    open: boolean;
    depth: number;
}

export interface CascadeSelectLevelProps {
    /** The level's depth, `0` for the first. */
    depth: number;
}

export interface CascadeSelectLevelSlots {
    default?: (scope: {
        items: readonly CascadeItem[];
        state: CascadeSelectLevelState;
    }) => VNode[];
    render?: (scope: RenderSlotProps<CascadeSelectLevelState>) => VNode[];
}

const NO_ITEMS: readonly CascadeItem[] = [];

/**
 * The `listbox` of one depth; `hidden` while that depth is not open. Its default scoped slot gets
 * `{ items }`: an Item per entry, in order (none while the level is not open;
 * spec/cascade-select.md).
 */
export const CascadeSelectLevel: PublicComponent<
    CascadeSelectLevelProps & { as?: AsProp },
    CascadeSelectLevelSlots
> = publicComponent(
    defineComponent({
        name: "CascadeSelectLevel",
        inheritAttrs: false,
        props: {
            ...asProp,
            /** The level's depth, `0` for the first. */
            depth: { type: Number, required: true },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CascadeSelectKey,
                "CascadeSelect.Level",
            );
            const items = () => context.levels.value[props.depth] ?? NO_ITEMS;
            provide(CascadeSelectLevelKey, {
                depth: () => props.depth,
                items,
            });
            return () => {
                const depth = props.depth;
                const open = depth < context.levels.value.length;
                const parent =
                    depth > 0 ? context.active.value[depth - 1] : undefined;
                const state = { open, depth };
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        role: "listbox",
                        id: context.levelId(depth),
                        hidden: open ? undefined : true,
                        "aria-labelledby":
                            depth === 0
                                ? context.trigger.value?.id
                                : parent === undefined
                                  ? undefined
                                  : context.itemId(depth - 1, parent),
                        "data-depth": String(depth),
                        "data-primitives-part": "cascade-select-level",
                    },
                    () =>
                        slots.default?.({
                            items: open ? items() : NO_ITEMS,
                            state,
                        }),
                );
            };
        },
    }),
);
