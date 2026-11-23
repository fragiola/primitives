import {
    placeSegmentIndicator,
    segmentIndicatorBox,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import { defineComponent, h, ref, watch } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { SegmentedControlKey } from "./segmented-control-context.ts";

export interface SegmentedControlIndicatorState {
    orientation: "horizontal" | "vertical";
    disabled: boolean;
}

export interface SegmentedControlIndicatorProps {
    /**
     * Places it before hydration in a server render (Base UI's name, as the Tabs Indicator): the
     * server writes a small inline script inside it that measures the checked Item as the page
     * parses, then removes itself (spec/segmented-control.md, "Server rendering"). Default `false`.
     */
    renderBeforeHydration?: boolean;
    /** The `nonce` of the `renderBeforeHydration` script (a Content Security Policy's). */
    nonce?: string;
}

/** The inline script of a server-rendered Indicator (`renderBeforeHydration`). */
const BEFORE_HYDRATION = `(${placeSegmentIndicator.toString()})(document.currentScript)`;

/**
 * Follows the checked Item through CSS variables measured from the Root's padding box
 * (spec/segmented-control.md). It is rendered once the checked Item is measured (at once with
 * `renderBeforeHydration`), and measured again on a resize of the Root or of the Item.
 */
export const SegmentedControlIndicator: PartComponent<
    SegmentedControlIndicatorProps,
    SegmentedControlIndicatorState
> = publicComponent(
    defineComponent({
        name: "SegmentedControlIndicator",
        inheritAttrs: false,
        props: {
            ...asProp,
            renderBeforeHydration: { type: Boolean, default: false },
            nonce: { type: String, default: undefined },
        },
        setup(props, { attrs, slots }) {
            const control = useRequiredContext(
                SegmentedControlKey,
                "SegmentedControl.Indicator",
            );
            const provided = useProvidedDirection();
            const box = ref<Record<string, string> | null>(null);
            // measured again when the checked Item changes and when a provider's direction does
            watch(
                () =>
                    [
                        control.root.value,
                        control.checkedElement.value,
                        provided(),
                    ] as const,
                ([root, item], _, onCleanup) => {
                    if (root === null || item === null) {
                        box.value = null;
                        return;
                    }
                    const measure = () => {
                        box.value = segmentIndicatorBox(
                            root,
                            item,
                            getDirection(root) === "rtl",
                        );
                    };
                    measure();
                    const view = root.ownerDocument.defaultView;
                    const observer = view?.ResizeObserver
                        ? new view.ResizeObserver(measure)
                        : null;
                    observer?.observe(root);
                    observer?.observe(item);
                    onCleanup(() => observer?.disconnect());
                },
                { flush: "post", immediate: true },
            );
            return () => {
                // rendered once measured, so it first appears in place; with
                // `renderBeforeHydration` at once (a server measures nothing: its script does)
                if (
                    control.value.value === null ||
                    (box.value === null && !props.renderBeforeHydration)
                ) {
                    return null;
                }
                const state = {
                    orientation: control.orientation(),
                    disabled: control.disabled(),
                };
                // only a server writes the script, which removes itself before the browser
                // hydrates
                const script =
                    props.renderBeforeHydration && typeof window === "undefined"
                        ? h("script", {
                              nonce: props.nonce,
                              innerHTML: BEFORE_HYDRATION,
                          })
                        : null;
                return renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        "aria-hidden": "true",
                        "data-primitives-part": "segmented-control-indicator",
                        ...stateAttributes(state),
                        // no style until measured: a server's script may have set one, which the
                        // hydration must not read as a mismatch
                        ...(box.value === null ? {} : { style: box.value }),
                    },
                    script === null
                        ? undefined
                        : () => [...(slots.default?.({ state }) ?? []), script],
                );
            };
        },
    }),
);
