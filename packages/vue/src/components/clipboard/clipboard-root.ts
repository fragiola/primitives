import { announceText, writeClipboard } from "@fragiola/primitives/clipboard";
import {
    computed,
    defineComponent,
    h,
    onBeforeUnmount,
    provide,
    shallowRef,
} from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ClipboardKey,
    type ClipboardState,
    type ClipboardStatus,
} from "./clipboard-context.ts";

/** What `statusChange` reports besides the status. */
export interface ClipboardStatusDetails extends ChangeDetails {
    /** What the browser rejected the write with (`failed`). */
    error?: unknown;
}

export interface ClipboardRootProps {
    /** The text a copy writes. */
    value: string;
    /** How long the status stays `copied` or `failed`, in milliseconds (default `3000`). */
    timeout?: number;
    /** Announced (politely) when a copy succeeds. */
    announcement?: string;
    /** Announced (politely) when a copy fails. */
    failedAnnouncement?: string;
}

export type ClipboardRootEmits = {
    statusChange: (
        status: ClipboardStatus,
        details: ClipboardStatusDetails,
    ) => true;
};

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
 * Copies a text to the clipboard and holds the copied state for a while; announces the app's text
 * in a polite live region it renders as its last child (spec/clipboard.md).
 */
export const ClipboardRoot: PartComponent<
    ClipboardRootProps,
    ClipboardState,
    ClipboardRootEmits
> = publicComponent(
    defineComponent({
        name: "ClipboardRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: { type: String, required: true },
            timeout: { type: Number, default: 3000 },
            announcement: { type: String, default: undefined },
            failedAnnouncement: { type: String, default: undefined },
        },
        emits: {
            statusChange: (
                _status: ClipboardStatus,
                _details: ClipboardStatusDetails,
            ) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const status = shallowRef<ClipboardStatus>("idle");
            const announcer = shallowRef<HTMLElement | null>(null);
            const input = shallowRef<HTMLElement | null>(null);
            let timer: ReturnType<typeof setTimeout> | undefined;
            let mounted = true;
            onBeforeUnmount(() => {
                mounted = false;
                clearTimeout(timer);
            });
            const report = (
                next: ClipboardStatus,
                details: ClipboardStatusDetails,
            ) => {
                status.value = next;
                emit("statusChange", next, details);
            };
            const copy = (event: Event) => {
                // the announcer is always in the Root: the window it is in is the one written to
                const element = announcer.value;
                if (element === null) {
                    return;
                }
                const settle = (next: "copied" | "failed", error?: unknown) => {
                    if (!mounted) {
                        return;
                    }
                    clearTimeout(timer);
                    if (announcer.value !== null) {
                        announceText(
                            announcer.value,
                            (next === "copied"
                                ? props.announcement
                                : props.failedAnnouncement) ?? "",
                        );
                    }
                    report(
                        next,
                        next === "failed"
                            ? { reason: "trigger-press", event, error }
                            : { reason: "trigger-press", event },
                    );
                    const field = input.value as HTMLInputElement | null;
                    if (next === "failed" && field !== null) {
                        // the user copies the text by hand (spec/clipboard.md, "Focus")
                        field.focus();
                        field.select();
                    }
                    timer = setTimeout(() => {
                        if (!mounted) {
                            return;
                        }
                        if (announcer.value !== null) {
                            announceText(announcer.value, "");
                        }
                        report("idle", { reason: "none" });
                    }, props.timeout);
                };
                writeClipboard(element, props.value).then(
                    () => settle("copied"),
                    (error: unknown) => settle("failed", error),
                );
            };

            const state = computed<ClipboardState>(() => ({
                status: status.value,
                copied: status.value === "copied",
                failed: status.value === "failed",
            }));
            const attributes = computed(() =>
                stateAttributes({
                    copied: state.value.copied,
                    failed: state.value.failed,
                }),
            );
            provide(ClipboardKey, {
                state,
                value: () => props.value,
                attributes,
                copy,
                setInput: elementSetter(input),
            });
            const setAnnouncer = elementSetter(announcer);

            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    state.value,
                    {
                        "data-primitives-part": "clipboard-root",
                        ...attributes.value,
                    },
                    () => [
                        ...(slots.default?.({ state: state.value }) ?? []),
                        // the toolkit writes its text: it renders no children
                        h("span", {
                            ref: setAnnouncer,
                            "aria-live": "polite",
                            "aria-atomic": "true",
                            "data-primitives-part": "clipboard-announcer",
                            style: VISUALLY_HIDDEN,
                        }),
                    ],
                );
        },
    }),
);
