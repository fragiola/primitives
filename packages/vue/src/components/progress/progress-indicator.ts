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

/**
 * The filled part, from the inline start (spec/progress.md): its structural style sets its
 * inline size, and `--progress-indicator-size`; none while indeterminate.
 */
export const ProgressIndicator: PartComponent<
    Record<never, never>,
    ProgressState
> = publicComponent(
    defineComponent({
        name: "ProgressIndicator",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ProgressKey,
                "Progress.Indicator",
            );
            return () => {
                const current = context.current.value;
                const { percent } = current;
                const style =
                    percent === null
                        ? undefined
                        : {
                              insetInlineStart: 0,
                              inlineSize: `${percent}%`,
                              "--progress-indicator-size": `${percent}%`,
                          };
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    progressState(current),
                    {
                        style,
                        "data-primitives-part": "progress-indicator",
                        ...stateAttributes(statusAttributes(current.status)),
                    },
                );
            };
        },
    }),
);
