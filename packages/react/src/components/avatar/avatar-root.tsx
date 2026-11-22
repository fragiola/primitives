import type { ImageLoadingStatus } from "@fragiola/primitives/image";
import { useMemo, useState } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { AvatarContext, type AvatarState } from "./avatar-context.ts";

export type AvatarRootProps = PartProps<AvatarState>;

/** Holds the image's loading status (spec/avatar.md); no status attribute of its own (Base UI). */
export function AvatarRoot(props: AvatarRootProps) {
    const [status, setStatus] = useState<ImageLoadingStatus>("idle");
    const [root, ref] = useElement<HTMLElement>();
    const context = useMemo(
        () => ({ status, root, setStatus }),
        [status, root],
    );
    return (
        <AvatarContext.Provider value={context}>
            {renderElement(
                "span",
                props,
                { status },
                { "data-primitives-part": "avatar-root" },
                ref,
            )}
        </AvatarContext.Provider>
    );
}
