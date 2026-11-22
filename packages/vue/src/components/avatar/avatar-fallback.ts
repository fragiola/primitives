import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { AvatarKey, type AvatarState } from "./avatar-context.ts";

export interface AvatarFallbackProps {
    /** Rendered only once this many milliseconds have passed since it mounted. */
    delay?: number;
}

/** Shown while the image is not loaded, after its `delay` (spec/avatar.md). */
export const AvatarFallback: PartComponent<AvatarFallbackProps, AvatarState> =
    publicComponent(
        defineComponent({
            name: "AvatarFallback",
            inheritAttrs: false,
            props: {
                ...asProp,
                /** Rendered only once this many milliseconds have passed since it mounted. */
                delay: { type: Number, default: undefined },
            },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(
                    AvatarKey,
                    "Avatar.Fallback",
                );
                const delayed = ref(props.delay !== undefined);
                let timer: ReturnType<typeof setTimeout> | undefined;
                const wait = (delay: number | undefined) => {
                    clearTimeout(timer);
                    if (delay === undefined) {
                        delayed.value = false;
                        return;
                    }
                    timer = setTimeout(() => {
                        delayed.value = false;
                    }, delay);
                };
                onMounted(() => {
                    wait(props.delay);
                    watch(() => props.delay, wait);
                });
                onBeforeUnmount(() => clearTimeout(timer));
                return () => {
                    const status = context.status.value;
                    if (delayed.value || status === "loaded") {
                        return null;
                    }
                    return renderPart(
                        "span",
                        { attrs, slots },
                        props.as,
                        { status },
                        { "data-primitives-part": "avatar-fallback" },
                    );
                };
            },
        }),
    );
