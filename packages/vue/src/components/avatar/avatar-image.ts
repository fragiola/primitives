import {
    type ImageLoadingStatus,
    watchImageStatus,
} from "@fragiola/primitives/image";
import {
    defineComponent,
    getCurrentInstance,
    onBeforeUnmount,
    onMounted,
    type PropType,
    watch,
} from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { AvatarKey, type AvatarState } from "./avatar-context.ts";

export interface AvatarImageProps {
    src?: string;
    srcSet?: string;
    sizes?: string;
    crossOrigin?: "anonymous" | "use-credentials" | "";
    referrerPolicy?: string;
}

export type AvatarImageEmits = {
    /** Each new status but `idle`. */
    loadingStatusChange: (status: ImageLoadingStatus) => true;
};

/**
 * The image, rendered only once it has loaded (spec/avatar.md): it loads outside the document
 * first, within the mount (`onMounted`: a cached image is `loaded` before the browser paints).
 */
export const AvatarImage: PartComponent<
    AvatarImageProps,
    AvatarState,
    AvatarImageEmits
> = publicComponent(
    defineComponent({
        name: "AvatarImage",
        inheritAttrs: false,
        props: {
            ...asProp,
            src: { type: String, default: undefined },
            srcSet: { type: String, default: undefined },
            sizes: { type: String, default: undefined },
            crossOrigin: {
                type: String as PropType<"anonymous" | "use-credentials" | "">,
                default: undefined,
            },
            referrerPolicy: { type: String, default: undefined },
        },
        emits: {
            loadingStatusChange: (_status: ImageLoadingStatus) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const context = useRequiredContext(AvatarKey, "Avatar.Image");
            const instance = getCurrentInstance();
            let stop: (() => void) | null = null;
            const load = () => {
                stop?.();
                stop = null;
                // the Root's element, else this part's own placeholder: both are in the document
                const anchor =
                    context.root.value ??
                    (instance?.proxy?.$el as Element | null | undefined) ??
                    null;
                if (anchor === null) {
                    return;
                }
                stop = watchImageStatus(
                    anchor,
                    props.src,
                    {
                        srcSet: props.srcSet,
                        sizes: props.sizes,
                        crossOrigin: props.crossOrigin,
                        referrerPolicy: props.referrerPolicy,
                    },
                    (status) => {
                        context.status.value = status;
                        emit("loadingStatusChange", status);
                    },
                );
            };
            // within the mount, before the browser paints: a cached image reports `loaded` at
            // once, and the Fallback is never painted
            onMounted(() => {
                load();
                watch(
                    () =>
                        [
                            props.src,
                            props.srcSet,
                            props.sizes,
                            props.crossOrigin,
                            props.referrerPolicy,
                        ] as const,
                    () => {
                        context.status.value = "idle";
                        load();
                    },
                );
            });
            onBeforeUnmount(() => {
                stop?.();
                stop = null;
                context.status.value = "idle";
            });
            return () => {
                const status = context.status.value;
                if (status !== "loaded") {
                    return null;
                }
                return renderPart(
                    "img",
                    { attrs, slots },
                    props.as,
                    { status },
                    {
                        src: props.src,
                        srcset: props.srcSet,
                        sizes: props.sizes,
                        crossorigin: props.crossOrigin,
                        referrerpolicy: props.referrerPolicy,
                        "data-primitives-part": "avatar-image",
                    },
                );
            };
        },
    }),
);
