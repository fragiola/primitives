import { defineComponent, onBeforeUnmount, onMounted, useId, watch } from "vue";
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

export interface ProgressLabelProps {
    id?: string;
}

/** Names the progress bar (`aria-labelledby`, spec/progress.md). */
export const ProgressLabel: PartComponent<ProgressLabelProps, ProgressState> =
    publicComponent(
        defineComponent({
            name: "ProgressLabel",
            inheritAttrs: false,
            props: { ...asProp, id: { type: String, default: undefined } },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(
                    ProgressKey,
                    "Progress.Label",
                );
                const generated = useId();
                const id = () => props.id ?? generated;
                // once mounted, as React's layout effect: a server render has no `aria-labelledby`
                onMounted(() => {
                    context.labelId.value = id();
                    watch(id, (next) => {
                        context.labelId.value = next;
                    });
                });
                onBeforeUnmount(() => {
                    context.labelId.value = undefined;
                });
                return () => {
                    const current = context.current.value;
                    return renderPart(
                        "span",
                        { attrs, slots },
                        props.as,
                        progressState(current),
                        {
                            id: id(),
                            "data-primitives-part": "progress-label",
                            ...stateAttributes(
                                statusAttributes(current.status),
                            ),
                        },
                    );
                };
            },
        }),
    );
