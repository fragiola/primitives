import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import { defineComponent, onBeforeUnmount, shallowRef, watch } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { RatingKey } from "./rating-context.ts";
import type { RatingRootState } from "./rating-root.ts";

/**
 * The Rating's form value (spec/rating.md, "Forms"): a visually hidden input with the score as
 * text, its `name` only while there is one, validated by the browser.
 */
export const RatingHiddenInput: PartComponent<
    Record<never, never>,
    RatingRootState
> = publicComponent(
    defineComponent({
        name: "RatingHiddenInput",
        inheritAttrs: false,
        props: { ...asProp },
        setup(props, { attrs, slots }) {
            const rating = useRequiredContext(RatingKey, "Rating.HiddenInput");
            const input = shallowRef<HTMLInputElement | null>(null);
            watch(
                input,
                (element, _, onCleanup) => {
                    rating.setHiddenInput(element);
                    if (element === null) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(element, {
                            reset: () => {
                                rating.reset();
                                // the browser reset the input to its default: write the
                                // rendered value back (a patch follows a change)
                                const value = rating.value.value;
                                element.value = value > 0 ? String(value) : "";
                            },
                            invalid: () => rating.tabStopElement(),
                        }),
                    );
                },
                { flush: "post" },
            );
            onBeforeUnmount(() => rating.setHiddenInput(null));
            const setInput = (node: unknown) => {
                input.value = node as HTMLInputElement | null;
            };
            return () => {
                const value = rating.value.value;
                const state: RatingRootState = {
                    value,
                    disabled: rating.disabled(),
                    readOnly: rating.readOnly(),
                    required: rating.required(),
                };
                return renderPart("input", { attrs, slots }, props.as, state, {
                    "aria-hidden": "true",
                    tabindex: -1,
                    name: value > 0 ? rating.name() : undefined,
                    value: value > 0 ? String(value) : "",
                    required: state.required,
                    disabled: state.disabled,
                    style: VISUALLY_HIDDEN_INPUT_STYLE,
                    "data-primitives-part": "rating-hidden-input",
                    ref: setInput,
                });
            };
        },
    }),
);
