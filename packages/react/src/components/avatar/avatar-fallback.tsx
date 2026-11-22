import { useEffect, useState } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { AvatarContext, type AvatarState } from "./avatar-context.ts";

export interface AvatarFallbackProps extends PartProps<AvatarState> {
    /** Rendered only once this many milliseconds have passed since it mounted. */
    delay?: number;
}

/** Shown while the image is not loaded, after its `delay` (spec/avatar.md). */
export function AvatarFallback({ delay, ...props }: AvatarFallbackProps) {
    const context = useRequiredContext(AvatarContext, "Avatar.Fallback");
    const [delayed, setDelayed] = useState(delay !== undefined);
    useEffect(() => {
        if (delay === undefined) {
            setDelayed(false);
            return undefined;
        }
        const timer = setTimeout(() => setDelayed(false), delay);
        return () => clearTimeout(timer);
    }, [delay]);
    if (delayed || context.status === "loaded") {
        return null;
    }
    return renderElement(
        "span",
        props,
        { status: context.status },
        { "data-primitives-part": "avatar-fallback" },
    );
}
