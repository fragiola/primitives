import {
    afterRenderEffect,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    output,
    untracked,
} from "@angular/core";
import {
    type ImageLoadingStatus,
    watchImageStatus,
} from "@fragiola/primitives/image";
import {
    conditionalView,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import { AvatarRoot } from "./avatar-root.directive.ts";

export type AvatarImageCrossOrigin = "anonymous" | "use-credentials" | "";

/**
 * The image, rendered only once it has loaded (spec/avatar.md); structural, with its source as
 * its value: `<img *avatarImage="photo" alt="Ada Lovelace">`. It loads outside the document first,
 * after the first render (never on a server; while the page itself loads, once it has loaded), so
 * a cached image is `loaded` before the browser paints; the directive writes `src` and the other
 * load attributes on the `img` it renders.
 * `(loadingStatusChange)` needs the template's long form:
 * `<ng-template [avatarImage]="photo" (loadingStatusChange)="..."><img alt="..."></ng-template>`.
 */
@Directive({ selector: "[avatarImage]", exportAs: "avatarImage" })
export class AvatarImage {
    readonly src = input<string | undefined>(undefined, {
        alias: "avatarImage",
    });
    readonly srcSet = input<string | undefined>(undefined, {
        alias: "avatarImageSrcSet",
    });
    readonly sizes = input<string | undefined>(undefined, {
        alias: "avatarImageSizes",
    });
    readonly crossOrigin = input<AvatarImageCrossOrigin | undefined>(
        undefined,
        { alias: "avatarImageCrossOrigin" },
    );
    readonly referrerPolicy = input<string | undefined>(undefined, {
        alias: "avatarImageReferrerPolicy",
    });
    /** Emits each new status but `idle`. */
    readonly loadingStatusChange =
        output<Exclude<ImageLoadingStatus, "idle">>();

    private readonly root = inject(AvatarRoot);
    readonly state = this.root.state;

    constructor() {
        const root = this.root;
        const element = conditionalView(
            computed(() => root.status() === "loaded"),
        );
        effect(() => {
            const rendered = element();
            if (rendered === null) {
                return;
            }
            writeAttributes(rendered, {
                src: this.src() ?? null,
                srcset: this.srcSet() ?? null,
                sizes: this.sizes() ?? null,
                crossorigin: this.crossOrigin() ?? null,
                referrerpolicy: this.referrerPolicy() ?? null,
                "data-primitives-part": "avatar-image",
            });
        });
        // after each render that changed the source (a browser only runs it): a cached image is
        // `loaded` within the same tick, so its view is rendered before the browser paints
        afterRenderEffect((onCleanup) => {
            const src = this.src();
            const options = {
                srcSet: this.srcSet(),
                sizes: this.sizes(),
                crossOrigin: this.crossOrigin(),
                referrerPolicy: this.referrerPolicy(),
            };
            untracked(() => {
                const stop = watchImageStatus(
                    root.host,
                    src,
                    options,
                    (status) => {
                        root.status.set(status);
                        this.loadingStatusChange.emit(status);
                    },
                );
                onCleanup(() => {
                    stop();
                    root.status.set("idle");
                });
            });
        });
        inject(DestroyRef).onDestroy(() => root.status.set("idle"));
    }
}
