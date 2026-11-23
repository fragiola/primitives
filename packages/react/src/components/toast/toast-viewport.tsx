import {
    type ToastViewportWatch,
    watchToastViewport,
} from "@fragiola/primitives/toast";
import {
    type CSSProperties,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToastProviderContext, ToastViewportContext } from "./toast-context.ts";

export interface ToastViewportState {
    expanded: boolean;
}

/**
 * The `region` landmark of the toasts (spec/toast.md, "Viewport"): F6 reaches it, the pointer and
 * the keyboard in it pause the queue, and its live regions announce the toasts.
 */
export function ToastViewport(props: PartProps<ToastViewportState>) {
    const { manager, toasts } = useRequiredContext(
        ToastProviderContext,
        "Toast.Viewport",
    );
    const [element, setElement] = useState<HTMLElement | null>(null);
    const [expanded, setExpanded] = useState(false);
    const watch = useRef<ToastViewportWatch | null>(null);
    useEffect(() => {
        if (element === null) {
            return undefined;
        }
        const watched = watchToastViewport(element, manager, {
            onExpandedChange: setExpanded,
        });
        watch.current = watched;
        return () => {
            watched.stop();
            watch.current = null;
            setExpanded(false);
        };
    }, [element, manager]);
    const focusAfterClose = useCallback((root: HTMLElement) => {
        watch.current?.focusAfterClose(root);
    }, []);
    const value = useMemo(
        () => ({ expanded, focusAfterClose }),
        [expanded, focusAfterClose],
    );
    const frontmost = toasts.find((toast) => !toast.closing)?.height ?? 0;
    return (
        <ToastViewportContext.Provider value={value}>
            {renderElement(
                "div",
                props,
                { expanded },
                {
                    role: "region",
                    tabIndex: -1,
                    "data-primitives-part": "toast-viewport",
                    ...stateAttributes({ expanded }),
                    style: {
                        "--toast-frontmost-height":
                            frontmost > 0 ? `${frontmost}px` : undefined,
                    } as CSSProperties,
                },
                setElement,
            )}
        </ToastViewportContext.Provider>
    );
}
