import { stepCarouselPage } from "@fragiola/primitives/carousel";
import { type SetupContext, shallowRef, type VNode } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { type AsProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CarouselKey, carouselGroupId } from "./carousel-context.ts";
import { useNativeListener } from "./use-native-listener.ts";

/** What a PrevTrigger or a NextTrigger renders with. */
export interface CarouselStepTriggerState {
    /** The page it moves to, `null` at an edge. */
    page: number | null;
    disabled: boolean;
}

/**
 * The setup of a PrevTrigger or a NextTrigger (spec/carousel.md): disabled at its edge unless
 * `loop`. Its press is a native listener (the rotation's checks run under a fixed clock).
 */
export function setupCarouselStepTrigger(
    kind: "prev" | "next",
    name: string,
    props: { as?: AsProp | undefined },
    { attrs, slots }: Pick<SetupContext, "attrs" | "slots">,
): () => VNode {
    const context = useRequiredContext(CarouselKey, name);
    const target = () => {
        const { page, pageCount } = context.state();
        return stepCarouselPage(
            page,
            pageCount,
            kind === "prev" ? -1 : 1,
            context.loop(),
        );
    };
    const element = shallowRef<HTMLElement | null>(null);
    const setElement = elementSetter(element);
    useNativeListener(element, "click", (event) => {
        const next = target();
        if (next === null) {
            return;
        }
        context.setPage(next, {
            reason: kind === "prev" ? "previous-press" : "next-press",
            event,
        });
    });
    return () => {
        const page = target();
        const disabled = page === null;
        return renderPart(
            "button",
            { attrs, slots },
            props.as,
            { page, disabled },
            {
                type: "button",
                disabled: disabled || undefined,
                "aria-controls": carouselGroupId(context.baseId),
                "data-primitives-part": `carousel-${kind}-trigger`,
                ...stateAttributes({ disabled }),
                ref: setElement,
            },
        );
    };
}
