import { bridgeForm } from "@fragiola/primitives/form";
import {
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    PasswordInputContext,
    type PasswordInputContextValue,
    type PasswordInputState,
} from "./password-input-context.ts";

export interface PasswordInputRootProps extends PartProps<PasswordInputState> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string, details: ChangeDetails) => void;
    /** Whether the text is shown. */
    visible?: boolean;
    defaultVisible?: boolean;
    onVisibleChange?: (visible: boolean, details: ChangeDetails) => void;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    name?: string;
    /** The Input's `id`. */
    id?: string;
}

interface Selection {
    start: number | null;
    end: number | null;
    direction: "forward" | "backward" | "none" | null;
}

/**
 * Holds a PasswordInput's text and whether it is shown (spec/password-input.md): its Input is the
 * form control, its VisibilityTrigger a toggle button.
 */
export function PasswordInputRoot({
    value: valueProp,
    defaultValue = "",
    onValueChange,
    visible: visibleProp,
    defaultVisible = false,
    onVisibleChange,
    disabled: disabledProp = false,
    readOnly = false,
    required = false,
    name,
    id: idProp,
    children,
    ...props
}: PasswordInputRootProps) {
    const generated = useId();
    const inputId = idProp ?? generated;
    const [value, setValue] = useControllableState(
        valueProp,
        defaultValue,
        onValueChange,
    );
    const [visible, setVisible] = useControllableState(
        visibleProp,
        defaultVisible,
        onVisibleChange,
    );
    const [input, setInputElement] = useState<HTMLInputElement | null>(null);
    const field = useFieldControl({
        id: inputId,
        labelable: true,
        value,
        filled: value !== "",
        input: () => input,
        focusTarget: () => input,
    });
    const disabled = disabledProp || field.disabled;

    const latest = useRef({
        visible,
        disabled,
        defaultValue,
        defaultVisible,
        setValue,
        setVisible,
        reset: field.reset,
    });
    latest.current = {
        visible,
        disabled,
        defaultValue,
        defaultVisible,
        setValue,
        setVisible,
        reset: field.reset,
    };

    // the Input's selection before its type changed, put back once it rendered
    // (spec/password-input.md, "Focus")
    const selection = useRef<Selection | null>(null);
    // biome-ignore lint/correctness/useExhaustiveDependencies: runs once the type changed
    useLayoutEffect(() => {
        const saved = selection.current;
        selection.current = null;
        if (saved === null || input === null || saved.start === null) {
            return;
        }
        input.setSelectionRange(
            saved.start,
            saved.end ?? saved.start,
            saved.direction ?? undefined,
        );
    }, [visible]);

    // a form reset returns the text and the visibility to their defaults; a submission hides the
    // text, so the browser reads a password field (spec/password-input.md, "Forms")
    useEffect(() => {
        if (input === null) {
            return undefined;
        }
        const cleanup = bridgeForm(input, {
            reset: () => {
                const current = latest.current;
                current.reset();
                current.setValue(current.defaultValue, { reason: "none" });
                current.setVisible(current.defaultVisible, { reason: "none" });
            },
        });
        const form = input.form;
        const onSubmit = (event: Event) => {
            if (latest.current.visible) {
                latest.current.setVisible(false, { reason: "none", event });
            }
        };
        form?.addEventListener("submit", onSubmit);
        return () => {
            cleanup();
            form?.removeEventListener("submit", onSubmit);
        };
    }, [input]);

    const onInputText = useCallback((text: string, event: Event) => {
        latest.current.setValue(text, { reason: "input-change", event });
    }, []);
    const toggle = useCallback(
        (event: Event) => {
            const current = latest.current;
            if (current.disabled) {
                return;
            }
            selection.current =
                input === null
                    ? null
                    : {
                          start: input.selectionStart,
                          end: input.selectionEnd,
                          direction: input.selectionDirection,
                      };
            current.setVisible(!current.visible, {
                reason: "trigger-press",
                event,
            });
        },
        [input],
    );

    const state: PasswordInputState = {
        value,
        visible,
        disabled,
        readOnly,
        required,
    };
    const attributes = useMemo(
        () =>
            stateAttributes({
                visible,
                disabled,
                readonly: readOnly,
                required,
            }),
        [visible, disabled, readOnly, required],
    );
    const context = useMemo<PasswordInputContextValue>(
        () => ({
            value,
            visible,
            disabled,
            readOnly,
            required,
            inputId,
            name: field.name ?? name,
            field,
            attributes,
            onInputText,
            toggle,
            setInputElement,
        }),
        [
            value,
            visible,
            disabled,
            readOnly,
            required,
            inputId,
            name,
            field,
            attributes,
            onInputText,
            toggle,
        ],
    );
    return (
        <PasswordInputContext.Provider value={context}>
            {renderElement("div", { ...props, children }, state, {
                "data-primitives-part": "password-input-root",
                ...attributes,
                ...field.attributes,
            })}
        </PasswordInputContext.Provider>
    );
}
