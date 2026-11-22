import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ProgressKey,
    type ProgressState,
    progressState,
    statusAttributes,
} from "./progress-context.ts";

/** The rail the Indicator fills (spec/progress.md). */
export const ProgressTrack: PartComponent<
    Record<never, never>,
    ProgressState
> = publicComponent(
    defineComponent({
        name: "ProgressTrack",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(ProgressKey, "Progress.Track");
            return () => {
                const current = context.current.value;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    progressState(current),
                    {
                        "data-primitives-part": "progress-track",
                        ...stateAttributes(statusAttributes(current.status)),
                    },
                );
            };
        },
    }),
);
