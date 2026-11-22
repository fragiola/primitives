import type { ImageLoadingStatus } from "@fragiola/primitives/image";
import { defineComponent, provide, ref, shallowRef } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { AvatarKey, type AvatarState } from "./avatar-context.ts";

/** Holds the image's loading status (spec/avatar.md); no status attribute of its own (Base UI). */
export const AvatarRoot: PartComponent<
    Record<never, never>,
    AvatarState
> = publicComponent(
    defineComponent({
        name: "AvatarRoot",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const status = ref<ImageLoadingStatus>("idle");
            const root = shallowRef<HTMLElement | null>(null);
            const setRoot = elementSetter(root);
            provide(AvatarKey, { status, root });
            return () =>
                renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    { status: status.value },
                    { "data-primitives-part": "avatar-root", ref: setRoot },
                );
        },
    }),
);
