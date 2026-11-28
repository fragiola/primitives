import { Clipboard as Primitive } from "@fragiola/primitives-react/clipboard";
import { clipboard } from "examples-shared/recipes/clipboard";
import type { ComponentProps } from "react";

/** The Indicator with its copy, check and cross icons. */
export function ClipboardIcons() {
    return (
        <Primitive.Indicator className={clipboard.indicator}>
            <svg
                className={clipboard.copy}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
            >
                <rect x="8" y="8" width="12" height="12" rx="2" />
                <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
            </svg>
            <svg
                className={clipboard.check}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
            >
                <path d="M5 12l5 5L20 7" />
            </svg>
            <svg
                className={clipboard.failed}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
            >
                <path d="M6 6l12 12M18 6L6 18" />
            </svg>
        </Primitive.Indicator>
    );
}

export const Clipboard = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={clipboard.root} {...props} />
    ),
    Input: (props: ComponentProps<typeof Primitive.Input>) => (
        <Primitive.Input className={clipboard.input} {...props} />
    ),
    /** The styled Trigger, holding the Indicator with its copy, check and cross icons. */
    Trigger: (props: ComponentProps<typeof Primitive.Trigger>) => (
        <Primitive.Trigger className={clipboard.trigger} {...props}>
            <ClipboardIcons />
        </Primitive.Trigger>
    ),
};
