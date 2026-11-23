import type { DateSegment } from "@fragiola/primitives/segments";
import {
    computed,
    defineComponent,
    type PropType,
    shallowRef,
    useId,
    watch,
} from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import {
    DateFieldKey,
    type DateFieldSegmentState,
} from "./date-field-context.ts";

export interface DateFieldSegmentProps {
    /** One of the Input's segments. */
    segment: DateSegment;
}

// numeric segments are one left-to-right run, so they keep the locale's order in any direction
// (spec/date-field.md, "Bidirectional text": structural, React Aria's fix)
const NUMERIC_STYLE = { unicodeBidi: "embed", direction: "ltr" } as const;

/**
 * One segment: a `spinbutton` the user types into or steps (the APG), or a literal hidden from
 * assistive technology (spec/date-field.md, "State attributes and ARIA").
 */
export const DateFieldSegment: PartComponent<
    DateFieldSegmentProps,
    DateFieldSegmentState
> = publicComponent(
    defineComponent({
        name: "DateFieldSegment",
        inheritAttrs: false,
        props: {
            ...asProp,
            segment: {
                type: Object as PropType<DateSegment>,
                required: true,
            },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                DateFieldKey,
                "DateField.Segment",
            );
            const id = useId();
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const writable = computed(() => {
                const { disabled, readOnly } = context.state.value;
                return props.segment.editable && !disabled && !readOnly;
            });

            // native listeners: Vue's invoker skips an event whose timestamp is not later than the
            // listener's, which the tests' fixed clock makes equal (docs/decisions.md). In the
            // capture phase, so the field's run before the consumer's listeners on the segment.
            // Every edit the browser would make is cancelled: the field writes the text from its
            // state.
            watch(
                [element, () => props.segment.editable, writable],
                ([node, editable, canWrite], _, onCleanup) => {
                    if (node === null || !editable) {
                        return;
                    }
                    const onKeydown = (event: KeyboardEvent) => {
                        if (context.onSegmentKey(props.segment, event, node)) {
                            event.preventDefault();
                        }
                    };
                    const onFocus = () => context.field.onFocus();
                    const onBlur = (event: FocusEvent) =>
                        context.onSegmentBlur(props.segment, event);
                    const onBeforeInput = (event: InputEvent) => {
                        if (!canWrite) {
                            return;
                        }
                        event.preventDefault();
                        if (event.inputType === "deleteContentBackward") {
                            context.onSegmentKey(
                                props.segment,
                                new KeyboardEvent("keydown", {
                                    key: "Backspace",
                                }),
                                node,
                            );
                            return;
                        }
                        if (event.data !== null && event.data !== "") {
                            context.onSegmentText(
                                props.segment,
                                event.data,
                                event,
                                node,
                            );
                        }
                    };
                    const capture = { capture: true };
                    node.addEventListener("keydown", onKeydown, capture);
                    node.addEventListener("focus", onFocus, capture);
                    node.addEventListener("blur", onBlur, capture);
                    node.addEventListener(
                        "beforeinput",
                        onBeforeInput,
                        capture,
                    );
                    onCleanup(() => {
                        node.removeEventListener("keydown", onKeydown, capture);
                        node.removeEventListener("focus", onFocus, capture);
                        node.removeEventListener("blur", onBlur, capture);
                        node.removeEventListener(
                            "beforeinput",
                            onBeforeInput,
                            capture,
                        );
                    });
                },
                { flush: "post", immediate: true },
            );

            return () => {
                const { segment } = props;
                const { disabled, readOnly, required, invalid } =
                    context.state.value;
                const state: DateFieldSegmentState = {
                    disabled,
                    readOnly,
                    required,
                    invalid,
                    type: segment.type,
                    placeholder: segment.placeholder,
                };
                const content = () =>
                    slots.default ? slots.default({ state }) : segment.text;
                if (!segment.editable) {
                    return renderPart(
                        "span",
                        { attrs, slots },
                        props.as,
                        state,
                        {
                            "aria-hidden":
                                segment.type === "literal" ? "true" : undefined,
                            "data-primitives-part": `${context.component}-segment`,
                            "data-type": segment.type,
                            ...context.attributes(),
                            ref: setElement,
                        },
                        content,
                    );
                }
                const labelId = context.labelId();
                const textual =
                    segment.type === "dayPeriod" || segment.type === "era";
                return renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        id,
                        role: "spinbutton",
                        tabindex: disabled ? undefined : 0,
                        "aria-label": segment.label ?? undefined,
                        "aria-labelledby":
                            labelId === undefined
                                ? undefined
                                : `${labelId} ${id}`,
                        "aria-valuenow": segment.value ?? undefined,
                        "aria-valuetext": segment.valueText ?? undefined,
                        "aria-valuemin": segment.min ?? undefined,
                        "aria-valuemax": segment.max ?? undefined,
                        "aria-invalid": invalid ? "true" : undefined,
                        "aria-required": required ? "true" : undefined,
                        "aria-readonly": readOnly ? "true" : undefined,
                        "aria-disabled": disabled ? "true" : undefined,
                        contenteditable: writable.value ? "true" : undefined,
                        // a day period and an era take letters
                        inputmode: textual ? "text" : "numeric",
                        spellcheck: "false",
                        autocorrect: "off",
                        autocapitalize: "off",
                        enterkeyhint: "next",
                        style: textual ? undefined : NUMERIC_STYLE,
                        "data-primitives-part": `${context.component}-segment`,
                        "data-type": segment.type,
                        "data-placeholder": segment.placeholder
                            ? ""
                            : undefined,
                        ...context.attributes(),
                        ref: setElement,
                    },
                    content,
                );
            };
        },
    }),
);
