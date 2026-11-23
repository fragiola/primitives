import { getDirection } from "@fragiola/primitives/direction";
import {
    fractionAlong,
    ratingItemState,
    ratingValueAt,
} from "@fragiola/primitives/range";
import {
    defineComponent,
    type SlotsType,
    shallowRef,
    type VNode,
    watch,
} from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
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
import { RatingKey } from "./rating-context.ts";

/** A star's state (spec/rating.md, "API"). */
export interface RatingItemState {
    index: number;
    checked: boolean;
    highlighted: boolean;
    half: boolean;
    disabled: boolean;
    readOnly: boolean;
}

/** Its default scoped slot receives its state (`v-slot="state"`), its `render` slot as a part's. */
export interface RatingItemSlots {
    default?: (state: RatingItemState) => VNode[];
    render?: (scope: RenderSlotProps<RatingItemState>) => VNode[];
}

export interface RatingItemProps {
    as?: AsProp;
    /** The star's number, `1` to `count`: its whole value. */
    index: number;
}

/** The value under the pointer on a star (spec/rating.md, "Pointer"). */
function valueAt(event: MouseEvent, index: number, allowHalf: boolean): number {
    const star = event.currentTarget as HTMLElement;
    const fraction = fractionAlong(
        star.getBoundingClientRect(),
        { x: event.clientX, y: event.clientY },
        "horizontal",
        getDirection(star) === "rtl",
    );
    return ratingValueAt(index, fraction, allowHalf);
}

/** A star: a `radio` of the Rating (spec/rating.md). */
export const RatingItem: PublicComponent<RatingItemProps, RatingItemSlots> =
    publicComponent(
        defineComponent({
            name: "RatingItem",
            inheritAttrs: false,
            props: {
                ...asProp,
                index: { type: Number, required: true },
            },
            slots: Object as SlotsType<RatingItemSlots>,
            setup(props, { attrs, slots }) {
                const rating = useRequiredContext(RatingKey, "Rating.Item");
                const element = shallowRef<HTMLElement | null>(null);
                const setElement = elementSetter(element);
                // registered once its element is (never on a server), again when its index changes
                watch(
                    () => [element.value, props.index] as const,
                    ([node, index], _, onCleanup) => {
                        if (node !== null) {
                            onCleanup(rating.registerItem(index, node));
                        }
                    },
                    { flush: "post", immediate: true },
                );

                const interactive = () =>
                    !rating.disabled() && !rating.readOnly();
                const onPointermove = (event: PointerEvent) => {
                    // a mouse or a pen previews the value under it; a touch has no hover
                    if (interactive() && event.pointerType !== "touch") {
                        rating.preview(
                            valueAt(event, props.index, rating.allowHalf()),
                        );
                    }
                };
                const onClick = (event: MouseEvent) => {
                    if (!interactive()) {
                        return;
                    }
                    (event.currentTarget as HTMLElement).focus();
                    // a click with no pointer (a label's, a script's) chooses the whole star
                    const next =
                        event.detail === 0
                            ? props.index
                            : valueAt(event, props.index, rating.allowHalf());
                    if (next !== rating.value.value) {
                        rating.choose(next, "item-press", event);
                    } else if (rating.allowClear()) {
                        rating.choose(0, "item-press", event);
                    }
                };
                const onKeydown = (event: KeyboardEvent) => {
                    // a native radio does not check on Enter (a button would click)
                    if (event.key === "Enter") {
                        event.preventDefault();
                        return;
                    }
                    if (event.key === " ") {
                        // Space is a key, not a press: its click on key up is prevented
                        event.preventDefault();
                    }
                    if (rating.keyDown(event.key, props.index, event)) {
                        event.preventDefault();
                    }
                };
                const onKeyup = (event: KeyboardEvent) => {
                    if (event.key === " ") {
                        event.preventDefault();
                    }
                };

                return () => {
                    const { index } = props;
                    const disabled = rating.disabled();
                    const readOnly = rating.readOnly();
                    const state: RatingItemState = {
                        index,
                        ...ratingItemState(
                            index,
                            rating.value.value,
                            rating.displayed.value,
                        ),
                        disabled,
                        readOnly,
                    };
                    return renderPart(
                        "button",
                        { attrs, slots },
                        props.as,
                        state,
                        {
                            type: "button",
                            role: "radio",
                            disabled,
                            "aria-checked": state.checked ? "true" : "false",
                            tabindex: rating.tabStop.value === index ? 0 : -1,
                            "data-primitives-part": "rating-item",
                            ...stateAttributes({
                                checked: state.checked,
                                unchecked: !state.checked,
                                highlighted: state.highlighted,
                                half: state.half,
                                disabled,
                                readonly: readOnly,
                            }),
                            onPointermove,
                            onClick,
                            onKeydown,
                            onKeyup,
                            ref: setElement,
                        },
                        () => slots.default?.(state),
                    );
                };
            },
        }),
    );
