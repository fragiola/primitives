import {
    createScrollArea,
    initialScrollAreaState,
    normalizeScrollAreaThreshold,
    type ScrollAreaController,
    type ScrollAreaPart,
    type ScrollAreaThresholdInput,
} from "@fragiola/primitives/scroll-area";
import {
    defineComponent,
    onBeforeUnmount,
    onMounted,
    type PropType,
    provide,
    shallowRef,
    watch,
} from "vue";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    overflowAttributes,
    ScrollAreaKey,
    type ScrollAreaState,
    scrollAreaState,
} from "./scroll-area-context.ts";

export interface ScrollAreaRootProps {
    /**
     * How far, in pixels, the content must be scrolled from an edge before its `data-overflow-*`
     * attribute is set: one number, or `{ xStart, xEnd, yStart, yEnd }` (default `0`).
     */
    overflowEdgeThreshold?: ScrollAreaThresholdInput;
}

/**
 * The box of a scrolling area (spec/scroll-area.md): it holds the measured state, which the
 * toolkit's `createScrollArea` reports for the parts it registers.
 */
export const ScrollAreaRoot: PartComponent<
    ScrollAreaRootProps,
    ScrollAreaState
> = publicComponent(
    defineComponent({
        name: "ScrollAreaRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            overflowEdgeThreshold: {
                type: [Number, Object] as PropType<ScrollAreaThresholdInput>,
                default: undefined,
            },
        },
        setup(props, { attrs, slots }) {
            const measured = shallowRef(initialScrollAreaState());
            const direction = useProvidedDirection();
            const root = shallowRef<HTMLElement | null>(null);
            let controller: ScrollAreaController | null = null;
            // the parts register before the Root's own onMounted creates the controller
            const parts = new Map<ScrollAreaPart, HTMLElement | null>();
            const setPart = (
                part: ScrollAreaPart,
                element: HTMLElement | null,
            ) => {
                parts.set(part, element);
                controller?.setPart(part, element);
            };
            provide(ScrollAreaKey, { measured, setPart });
            onMounted(() => {
                if (root.value === null) {
                    return;
                }
                const created = createScrollArea(root.value, {
                    direction,
                    threshold: () =>
                        normalizeScrollAreaThreshold(
                            props.overflowEdgeThreshold,
                        ),
                    onStateChange: (state) => {
                        measured.value = state;
                    },
                });
                controller = created;
                for (const [part, element] of parts) {
                    created.setPart(part, element);
                }
            });
            onBeforeUnmount(() => {
                controller?.destroy();
                controller = null;
            });
            // a new direction or threshold measures again
            watch(
                () =>
                    `${direction()} ${JSON.stringify(
                        normalizeScrollAreaThreshold(
                            props.overflowEdgeThreshold,
                        ),
                    )}`,
                () => controller?.update(),
            );
            const setRoot = (value: unknown) => {
                const element =
                    value instanceof HTMLElement
                        ? value
                        : ((value as { $el?: HTMLElement } | null)?.$el ??
                          null);
                if (root.value !== element) {
                    root.value = element;
                }
            };
            return () => {
                const state = scrollAreaState(measured.value);
                return renderPart("div", { attrs, slots }, props.as, state, {
                    role: "presentation",
                    style: { position: "relative" },
                    "data-primitives-part": "scroll-area-root",
                    ...stateAttributes({
                        scrolling: state.scrolling,
                        ...overflowAttributes(state),
                    }),
                    ref: setRoot,
                });
            };
        },
    }),
);
