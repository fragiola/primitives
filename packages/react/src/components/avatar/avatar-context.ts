import type { ImageLoadingStatus } from "@fragiola/primitives/image";
import { createContext } from "react";

export interface AvatarState {
    /** The image's loading status (spec/avatar.md). */
    status: ImageLoadingStatus;
}

export interface AvatarContextValue extends AvatarState {
    /** The Root's element: the Image loads through its window. */
    root: HTMLElement | null;
    setStatus: (status: ImageLoadingStatus) => void;
}

export const AvatarContext = createContext<AvatarContextValue | null>(null);
