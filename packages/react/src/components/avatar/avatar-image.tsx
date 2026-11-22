import {
    type ImageLoadingStatus,
    watchImageStatus,
} from "@fragiola/primitives/image";
import { useLayoutEffect, useRef } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { AvatarContext, type AvatarState } from "./avatar-context.ts";

export interface AvatarImageProps extends PartProps<AvatarState> {
    src?: string;
    srcSet?: string;
    sizes?: string;
    crossOrigin?: "anonymous" | "use-credentials" | "";
    referrerPolicy?: string;
    /** Called with each new status but `idle`. */
    onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
}

/**
 * The image, rendered only once it has loaded (spec/avatar.md): it loads outside the document
 * first, within the mount (a cached image is `loaded` before the browser paints).
 */
export function AvatarImage({
    src,
    srcSet,
    sizes,
    crossOrigin,
    referrerPolicy,
    onLoadingStatusChange,
    ...props
}: AvatarImageProps) {
    const context = useRequiredContext(AvatarContext, "Avatar.Image");
    const { root, setStatus } = context;
    const report = useRef(onLoadingStatusChange);
    report.current = onLoadingStatusChange;
    // the status last reported for this source: a remount of the same load (React's strict
    // effects) reports nothing twice
    const reported = useRef<{ src: string | undefined; status: string }>(null);
    useLayoutEffect(() => {
        if (root === null) {
            return undefined;
        }
        if (reported.current?.src !== src) {
            reported.current = null;
        }
        const stop = watchImageStatus(
            root,
            src,
            { srcSet, sizes, crossOrigin, referrerPolicy },
            (status) => {
                setStatus(status);
                if (reported.current?.status !== status) {
                    reported.current = { src, status };
                    report.current?.(status);
                }
            },
        );
        return () => {
            stop();
            setStatus("idle");
        };
    }, [root, src, srcSet, sizes, crossOrigin, referrerPolicy, setStatus]);
    if (context.status !== "loaded") {
        return null;
    }
    return renderElement(
        "img",
        props,
        { status: context.status },
        {
            src,
            srcSet,
            sizes,
            crossOrigin,
            referrerPolicy,
            "data-primitives-part": "avatar-image",
        },
    );
}
