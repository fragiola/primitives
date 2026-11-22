/** An image's loading status (spec/avatar.md): `idle` until a load starts. */
export type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

export interface ImageSourceOptions {
    srcSet?: string;
    sizes?: string;
    /** The load's CORS mode (`anonymous`, `use-credentials`), as the `img` would make it. */
    crossOrigin?: string | null;
    /** The load's referrer policy, as the `img` would make it. */
    referrerPolicy?: string;
}

/**
 * Loads an image outside the document, through the element's window (`new Image()` of its
 * `ownerDocument.defaultView`), and reports its status (spec/avatar.md, "The loading status"):
 * `loading`, then `loaded` or `error`. No `src` and no `srcSet` is an `error`. An image the
 * browser already holds (a cached one) is complete as soon as its source is set: it reports
 * `loaded` (or `error`, when it has no size) at once, synchronously and with no `loading`.
 * Returns the cleanup, after which no status is reported.
 */
export function watchImageStatus(
    element: Element,
    src: string | undefined,
    options: ImageSourceOptions,
    onStatus: (status: Exclude<ImageLoadingStatus, "idle">) => void,
): () => void {
    const view = element.ownerDocument.defaultView;
    if (
        view === null ||
        ((src === undefined || src === "") &&
            (options.srcSet === undefined || options.srcSet === ""))
    ) {
        onStatus("error");
        return () => {};
    }
    let active = true;
    let last: ImageLoadingStatus = "idle";
    const report = (status: Exclude<ImageLoadingStatus, "idle">) => {
        if (active && status !== last) {
            last = status;
            onStatus(status);
        }
    };
    const image = new view.Image();
    const loaded = () => report(image.naturalWidth > 0 ? "loaded" : "error");
    const failed = () => report("error");
    image.addEventListener("load", loaded);
    image.addEventListener("error", failed);
    if (options.crossOrigin !== undefined) {
        image.crossOrigin = options.crossOrigin;
    }
    if (options.referrerPolicy !== undefined) {
        image.referrerPolicy = options.referrerPolicy;
    }
    if (options.sizes !== undefined) {
        image.sizes = options.sizes;
    }
    if (options.srcSet !== undefined) {
        image.srcset = options.srcSet;
    }
    if (src !== undefined) {
        image.src = src;
    }
    if (image.complete) {
        loaded();
    } else {
        report("loading");
    }
    return () => {
        active = false;
        image.removeEventListener("load", loaded);
        image.removeEventListener("error", failed);
    };
}
