import { announceText, writeClipboard } from "@fragiola/primitives/clipboard";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ClipboardContext,
    type ClipboardContextValue,
    type ClipboardState,
    type ClipboardStatus,
} from "./clipboard-context.ts";

/** What `onStatusChange` reports besides the status. */
export interface ClipboardStatusDetails extends ChangeDetails {
    /** What the browser rejected the write with (`failed`). */
    error?: unknown;
}

export interface ClipboardRootProps extends PartProps<ClipboardState> {
    /** The text a copy writes. */
    value: string;
    /** How long the status stays `copied` or `failed`, in milliseconds (default `3000`). */
    timeout?: number;
    onStatusChange?: (
        status: ClipboardStatus,
        details: ClipboardStatusDetails,
    ) => void;
    /** Announced (politely) when a copy succeeds. */
    announcement?: string;
    /** Announced (politely) when a copy fails. */
    failedAnnouncement?: string;
}

/** The announcer's structural style: visually hidden, still read (spec/clipboard.md). */
const VISUALLY_HIDDEN = {
    position: "absolute",
    width: "1px",
    height: "1px",
    margin: "-1px",
    padding: "0",
    border: "0",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
} as const;

/**
 * Copies a text to the clipboard and holds the copied state for a while; announces the app's
 * text in a polite live region it renders as its last child (spec/clipboard.md).
 */
export function ClipboardRoot({
    value,
    timeout = 3000,
    onStatusChange,
    announcement,
    failedAnnouncement,
    children,
    ...props
}: ClipboardRootProps) {
    const [status, setStatus] = useState<ClipboardStatus>("idle");
    const announcer = useRef<HTMLSpanElement | null>(null);
    const input = useRef<HTMLInputElement | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const mounted = useRef(true);
    const latest = useRef({
        value,
        timeout,
        onStatusChange,
        announcement,
        failedAnnouncement,
    });
    latest.current = {
        value,
        timeout,
        onStatusChange,
        announcement,
        failedAnnouncement,
    };

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            clearTimeout(timer.current);
        };
    }, []);

    const actions = useMemo(() => {
        const report = (
            next: ClipboardStatus,
            details: ClipboardStatusDetails,
        ) => {
            setStatus(next);
            latest.current.onStatusChange?.(next, details);
        };
        return {
            copy: (event: Event) => {
                // the announcer is always in the Root: the window it is in is the one written to
                const element = announcer.current;
                if (element === null) {
                    return;
                }
                const settle = (next: "copied" | "failed", error?: unknown) => {
                    if (!mounted.current) {
                        return;
                    }
                    const current = latest.current;
                    clearTimeout(timer.current);
                    if (announcer.current !== null) {
                        announceText(
                            announcer.current,
                            (next === "copied"
                                ? current.announcement
                                : current.failedAnnouncement) ?? "",
                        );
                    }
                    report(
                        next,
                        next === "failed"
                            ? { reason: "trigger-press", event, error }
                            : { reason: "trigger-press", event },
                    );
                    if (next === "failed" && input.current !== null) {
                        // the user copies the text by hand (spec/clipboard.md, "Focus")
                        input.current.focus();
                        input.current.select();
                    }
                    timer.current = setTimeout(() => {
                        if (!mounted.current) {
                            return;
                        }
                        if (announcer.current !== null) {
                            announceText(announcer.current, "");
                        }
                        report("idle", { reason: "none" });
                    }, current.timeout);
                };
                writeClipboard(element, latest.current.value).then(
                    () => settle("copied"),
                    (error: unknown) => settle("failed", error),
                );
            },
            setInputElement: (element: HTMLInputElement | null) => {
                input.current = element;
            },
        };
    }, []);

    const copied = status === "copied";
    const failed = status === "failed";
    const state: ClipboardState = { status, copied, failed };
    const attributes = useMemo(
        () => stateAttributes({ copied, failed }),
        [copied, failed],
    );
    const context = useMemo<ClipboardContextValue>(
        () => ({ status, copied, failed, value, attributes, ...actions }),
        [status, copied, failed, value, attributes, actions],
    );
    return (
        <ClipboardContext.Provider value={context}>
            {renderElement(
                "div",
                {
                    ...props,
                    children: (
                        <>
                            {children}
                            <span
                                ref={announcer}
                                aria-live="polite"
                                aria-atomic="true"
                                data-primitives-part="clipboard-announcer"
                                style={VISUALLY_HIDDEN}
                            />
                        </>
                    ),
                },
                state,
                {
                    "data-primitives-part": "clipboard-root",
                    ...attributes,
                },
            )}
        </ClipboardContext.Provider>
    );
}
