import type { DateSegment } from "@fragiola/primitives/segments";
import {
    type FocusEvent,
    type KeyboardEvent as ReactKeyboardEvent,
    useEffect,
    useId,
    useRef,
} from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    DateFieldContext,
    type DateFieldSegmentState,
} from "./date-field-context.ts";

export interface DateFieldSegmentProps
    extends PartProps<DateFieldSegmentState> {
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
export function DateFieldSegment({
    segment,
    children,
    ...props
}: DateFieldSegmentProps) {
    const context = useRequiredContext(DateFieldContext, "DateField.Segment");
    const id = useId();
    const element = useRef<HTMLElement | null>(null);
    const latest = useRef({ context, segment });
    latest.current = { context, segment };
    const { disabled, readOnly, required, invalid, field, labelId } = context;
    const editable = segment.editable;
    const writable = editable && !disabled && !readOnly;

    // every edit the browser would make is cancelled: the field writes the text from its state
    // (a native listener: React's `onBeforeInput` is not the native event)
    useEffect(() => {
        const node = element.current;
        if (node === null || !writable) {
            return undefined;
        }
        const onBeforeInput = (event: InputEvent) => {
            event.preventDefault();
            const { context: current, segment: shown } = latest.current;
            if (event.inputType === "deleteContentBackward") {
                current.onSegmentKey(
                    shown,
                    new KeyboardEvent("keydown", { key: "Backspace" }),
                    node,
                );
                return;
            }
            if (event.data !== null && event.data !== "") {
                current.onSegmentText(shown, event.data, event, node);
            }
        };
        node.addEventListener("beforeinput", onBeforeInput);
        return () => node.removeEventListener("beforeinput", onBeforeInput);
    }, [writable]);

    const state: DateFieldSegmentState = {
        disabled,
        readOnly,
        required,
        invalid,
        type: segment.type,
        placeholder: segment.placeholder,
    };
    const content = children ?? segment.text;
    const textual = segment.type === "dayPeriod" || segment.type === "era";
    if (!editable) {
        return renderElement("span", { ...props, children: content }, state, {
            "aria-hidden": segment.type === "literal" ? "true" : undefined,
            "data-primitives-part": `${context.component}-segment`,
            "data-type": segment.type,
            ...context.attributes,
        });
    }
    return renderElement(
        "span",
        { ...props, children: content },
        state,
        {
            id,
            role: "spinbutton",
            tabIndex: disabled ? undefined : 0,
            "aria-label": segment.label ?? undefined,
            "aria-labelledby":
                labelId === undefined ? undefined : `${labelId} ${id}`,
            "aria-valuenow": segment.value ?? undefined,
            "aria-valuetext": segment.valueText ?? undefined,
            "aria-valuemin": segment.min ?? undefined,
            "aria-valuemax": segment.max ?? undefined,
            "aria-invalid": invalid ? "true" : undefined,
            "aria-required": required ? "true" : undefined,
            "aria-readonly": readOnly ? "true" : undefined,
            "aria-disabled": disabled ? "true" : undefined,
            contentEditable: writable ? true : undefined,
            suppressContentEditableWarning: true,
            // a day period and an era take letters
            inputMode: textual ? "text" : "numeric",
            spellCheck: "false",
            autoCorrect: "off",
            autoCapitalize: "off",
            enterKeyHint: "next",
            style: textual ? undefined : NUMERIC_STYLE,
            "data-primitives-part": `${context.component}-segment`,
            "data-type": segment.type,
            "data-placeholder": segment.placeholder ? "" : undefined,
            ...context.attributes,
            onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
                const { context: current, segment: shown } = latest.current;
                if (
                    current.onSegmentKey(
                        shown,
                        event.nativeEvent,
                        event.currentTarget,
                    )
                ) {
                    event.preventDefault();
                }
            },
            onFocus: () => field.onFocus(),
            onBlur: (event: FocusEvent<HTMLElement>) => {
                const { context: current, segment: shown } = latest.current;
                current.onSegmentBlur(
                    shown,
                    event.nativeEvent,
                    event.currentTarget,
                );
            },
        },
        (node: HTMLElement | null) => {
            element.current = node;
        },
    );
}
