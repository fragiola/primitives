import { defineComponent, type SlotsType, type VNode } from "vue";
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
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ProgressKey,
    type ProgressState,
    progressState,
    statusAttributes,
} from "./progress-context.ts";

/** What the Value's default scoped slot receives. */
export interface ProgressValueSlotProps {
    /** The value as `format` writes it; `""` when indeterminate. */
    formattedValue: string;
    /** The clamped value, `null` when indeterminate. */
    value: number | null;
    state: ProgressState;
}

export interface ProgressValueSlots {
    default?: (scope: ProgressValueSlotProps) => VNode[];
    render?: (scope: RenderSlotProps<ProgressState>) => VNode[];
}

/**
 * Shows the formatted value, empty while indeterminate, or the default scoped slot
 * `{ formattedValue, value }` (spec/progress.md).
 */
export const ProgressValue: PublicComponent<
    { as?: AsProp },
    ProgressValueSlots
> = publicComponent(
    defineComponent({
        name: "ProgressValue",
        inheritAttrs: false,
        props: asProp,
        slots: Object as SlotsType<ProgressValueSlots>,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(ProgressKey, "Progress.Value");
            return () => {
                const current = context.current.value;
                const state = progressState(current);
                const { formattedValue, value } = current;
                return renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        "data-primitives-part": "progress-value",
                        ...stateAttributes(statusAttributes(current.status)),
                    },
                    () =>
                        slots.default
                            ? slots.default({ formattedValue, value, state })
                            : // no text node while indeterminate, as React renders `""`
                              formattedValue || undefined,
                );
            };
        },
    }),
);
