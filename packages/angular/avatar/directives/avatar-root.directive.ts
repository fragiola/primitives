import { computed, Directive, signal } from "@angular/core";
import type { ImageLoadingStatus } from "@fragiola/primitives/image";
import { injectHost } from "@fragiola/primitives-angular/internal";

export interface AvatarState {
    /** The image's loading status (spec/avatar.md). */
    status: ImageLoadingStatus;
}

/**
 * Holds the image's loading status (spec/avatar.md): `<span avatarRoot>` around its Image and
 * Fallback; no status attribute of its own (Base UI). Read it through `exportAs`
 * (`#avatar="avatarRoot"`, `avatar.state().status`).
 */
@Directive({
    selector: "[avatarRoot]",
    exportAs: "avatarRoot",
    host: { "data-primitives-part": "avatar-root" },
})
export class AvatarRoot {
    /** The Root's element: the Image loads through its window. */
    readonly host = injectHost();
    /** The image's loading status, which the Image sets. */
    readonly status = signal<ImageLoadingStatus>("idle");
    readonly state = computed<AvatarState>(() => ({ status: this.status() }));
}
