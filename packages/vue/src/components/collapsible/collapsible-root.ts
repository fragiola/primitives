import { computed, defineComponent, provide, useId } from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CollapsibleKey,
    type CollapsibleState,
    collapsibleAttributes,
} from "./collapsible-context.ts";

export interface CollapsibleRootProps {
    open?: boolean;
    defaultOpen?: boolean;
    /** Nothing but a controlled `open` opens or closes it (default `false`). */
    disabled?: boolean;
}

export type CollapsibleRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: ChangeDetails) => true;
};

/** spec/collapsible.md (the APG disclosure, `v-model:open`) */
export const CollapsibleRoot: PartComponent<
    CollapsibleRootProps,
    CollapsibleState,
    CollapsibleRootEmits
> = publicComponent(
    defineComponent({
        name: "CollapsibleRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            open: { type: Boolean, default: undefined },
            defaultOpen: { type: Boolean, default: false },
            /** Nothing but a controlled `open` opens or closes it. */
            disabled: { type: Boolean, default: false },
        },
        emits: {
            "update:open": (_open: boolean) => true,
            openChange: (_open: boolean, _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const own = useControllable<boolean, ChangeDetails>(
                () => props.open,
                props.defaultOpen,
                (next, details) => {
                    emit("update:open", next);
                    emit("openChange", next, details);
                },
            );
            const state = computed<CollapsibleState>(() => ({
                open: own.value.value,
                disabled: props.disabled,
            }));
            provide(CollapsibleKey, {
                state,
                setOpen: (next, reason) => own.set(next, { reason }),
                panelId: `${useId()}-panel`,
            });
            return () =>
                renderPart("div", { attrs, slots }, props.as, state.value, {
                    "data-primitives-part": "collapsible-root",
                    ...stateAttributes(collapsibleAttributes(state.value)),
                });
        },
    }),
);
