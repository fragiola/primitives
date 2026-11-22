import type { ImageLoadingStatus } from "@fragiola/primitives/image";
import type { InjectionKey, Ref } from "vue";

export interface AvatarState {
    /** The image's loading status (spec/avatar.md). */
    status: ImageLoadingStatus;
}

export interface AvatarContext {
    status: Ref<ImageLoadingStatus>;
    /** The Root's element: the Image loads through its window. */
    root: Ref<HTMLElement | null>;
}

export const AvatarKey: InjectionKey<AvatarContext> = Symbol("Avatar");
