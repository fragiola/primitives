import {
    afterNextRender,
    computed,
    DestroyRef,
    Directive,
    inject,
    input,
    numberAttribute,
    output,
    signal,
    untracked,
} from "@angular/core";
import { announceText, writeClipboard } from "@fragiola/primitives/clipboard";
import {
    type ChangeDetails,
    dataValues,
    injectFlush,
    injectHost,
} from "@fragiola/primitives-angular/internal";

/** A Clipboard's status (spec/clipboard.md, "API"). */
export type ClipboardStatus = "idle" | "copied" | "failed";

/** The state every part renders with. */
export interface ClipboardState {
    status: ClipboardStatus;
    copied: boolean;
    failed: boolean;
}

/** What a status change reports besides the status. */
export interface ClipboardStatusDetails extends ChangeDetails {
    /** What the browser rejected the write with (`failed`). */
    error?: unknown;
}

/** What `(statusChange)` emits. */
export interface ClipboardStatusChangeEvent {
    status: ClipboardStatus;
    details: ClipboardStatusDetails;
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
 * Copies a text to the clipboard and holds the copied state for a while (spec/clipboard.md):
 * `<div clipboardRoot value="pnpm add @fragiola/primitives" announcement="Copied">` around its
 * Trigger, Indicator and Input. It puts its polite live region (the announcer) in as its last
 * child after its first render, as a form control's hidden input (a server renders none: an
 * element inserted during the hydration would break it). Every part carries `data-copied` or
 * `data-failed`.
 */
@Directive({
    selector: "[clipboardRoot]",
    exportAs: "clipboardRoot",
    host: {
        "data-primitives-part": "clipboard-root",
        "[attr.data-copied]": "data().copied",
        "[attr.data-failed]": "data().failed",
    },
})
export class ClipboardRoot {
    /** The text a copy writes. */
    readonly value = input.required<string>();
    /** How long the status stays `copied` or `failed`, in milliseconds (default `3000`). */
    readonly timeout = input(3000, { transform: numberAttribute });
    readonly statusChange = output<ClipboardStatusChangeEvent>();
    /** Announced (politely) when a copy succeeds. */
    readonly announcement = input<string | undefined>(undefined);
    /** Announced (politely) when a copy fails. */
    readonly failedAnnouncement = input<string | undefined>(undefined);

    private readonly host = injectHost();
    private readonly flush = injectFlush();
    /** The Input's element, once rendered. */
    readonly inputElement = signal<HTMLInputElement | null>(null);
    private readonly status = signal<ClipboardStatus>("idle");
    readonly state = computed<ClipboardState>(() => ({
        status: this.status(),
        copied: this.status() === "copied",
        failed: this.status() === "failed",
    }));
    /** The state attributes, for every part. */
    readonly data = computed(() => {
        const state = this.state();
        return dataValues({ copied: state.copied, failed: state.failed });
    });
    private readonly announcer: HTMLSpanElement;
    private timer: ReturnType<typeof setTimeout> | undefined;
    private destroyed = false;

    constructor() {
        const announcer = this.host.ownerDocument.createElement("span");
        announcer.setAttribute("aria-live", "polite");
        announcer.setAttribute("aria-atomic", "true");
        announcer.setAttribute("data-primitives-part", "clipboard-announcer");
        Object.assign(announcer.style, VISUALLY_HIDDEN);
        this.announcer = announcer;
        afterNextRender(() => {
            if (!announcer.isConnected) {
                this.host.appendChild(announcer);
            }
        });
        inject(DestroyRef).onDestroy(() => {
            this.destroyed = true;
            clearTimeout(this.timer);
            announcer.remove();
        });
    }

    private report(status: ClipboardStatus, details: ClipboardStatusDetails) {
        this.status.set(status);
        this.flush();
        this.statusChange.emit({ status, details });
    }

    /** The Trigger's press: writes the value (spec/clipboard.md, "Copying"). */
    copy(event: Event): void {
        const settle = (next: "copied" | "failed", error?: unknown) => {
            if (this.destroyed) {
                return;
            }
            clearTimeout(this.timer);
            announceText(
                this.announcer,
                (next === "copied"
                    ? untracked(this.announcement)
                    : untracked(this.failedAnnouncement)) ?? "",
            );
            this.report(
                next,
                next === "failed"
                    ? { reason: "trigger-press", event, error }
                    : { reason: "trigger-press", event },
            );
            const element = untracked(this.inputElement);
            if (next === "failed" && element !== null) {
                // the user copies the text by hand (spec/clipboard.md, "Focus")
                element.focus();
                element.select();
            }
            this.timer = setTimeout(() => {
                if (this.destroyed) {
                    return;
                }
                announceText(this.announcer, "");
                this.report("idle", { reason: "none" });
            }, untracked(this.timeout));
        };
        writeClipboard(this.host, untracked(this.value)).then(
            () => settle("copied"),
            (error: unknown) => settle("failed", error),
        );
    }
}
