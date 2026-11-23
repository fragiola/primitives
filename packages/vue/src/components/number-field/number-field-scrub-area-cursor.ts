import { defineComponent, h, Teleport } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import {
    NumberFieldKey,
    type NumberFieldState,
} from "./number-field-context.ts";

/**
 * The virtual cursor of a locked scrub (spec/number-field.md, "Pointer"), teleported into `body`:
 * rendered only while a mouse scrubs with the pointer locked.
 */
export const NumberFieldScrubAreaCursor: PartComponent<
    Record<never, never>,
    NumberFieldState
> = publicComponent(
    defineComponent({
        name: "NumberFieldScrubAreaCursor",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                NumberFieldKey,
                "NumberField.ScrubAreaCursor",
            );
            return () => {
                const cursor = context.cursor.value;
                if (cursor === null) {
                    return null;
                }
                return h(Teleport, { to: "body" }, [
                    renderPart(
                        "span",
                        { attrs, slots },
                        props.as,
                        context.state.value,
                        {
                            style: {
                                position: "fixed",
                                top: 0,
                                left: 0,
                                pointerEvents: "none",
                                transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
                            },
                            "data-primitives-part":
                                "number-field-scrub-area-cursor",
                            ...context.attributes(),
                        },
                    ),
                ]);
            };
        },
    }),
);
