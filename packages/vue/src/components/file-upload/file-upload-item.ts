import { computed, defineComponent, type PropType, provide } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    FileUploadItemKey,
    type FileUploadItemState,
    FileUploadKey,
} from "./file-upload-context.ts";

export interface FileUploadItemProps {
    /** The Item's file: an accepted one, or a rejected one. */
    file: File;
}

const NO_REASONS: readonly string[] = [];

/** One file, accepted or rejected (spec/file-upload.md). */
export const FileUploadItem: PartComponent<
    FileUploadItemProps,
    FileUploadItemState
> = publicComponent(
    defineComponent({
        name: "FileUploadItem",
        inheritAttrs: false,
        props: {
            ...asProp,
            file: { type: Object as PropType<File>, required: true },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                FileUploadKey,
                "FileUpload.Item",
            );
            const rejection = computed(() => {
                const state = context.state.value;
                const found = state.rejectedFiles.find(
                    (entry) => entry.file === props.file,
                );
                return found !== undefined && !state.value.includes(props.file)
                    ? found
                    : undefined;
            });
            const rejected = computed(() => rejection.value !== undefined);
            const reasons = computed(
                () => rejection.value?.reasons ?? NO_REASONS,
            );
            const attributes = computed(() => ({
                ...context.attributes.value,
                ...stateAttributes({ rejected: rejected.value }),
            }));
            provide(FileUploadItemKey, {
                file: () => props.file,
                rejected,
                reasons,
                attributes,
            });
            return () =>
                renderPart(
                    "li",
                    { attrs, slots },
                    props.as,
                    {
                        ...context.state.value,
                        file: props.file,
                        rejected: rejected.value,
                        reasons: reasons.value,
                    },
                    {
                        "data-primitives-part": "file-upload-item",
                        ...attributes.value,
                    },
                );
        },
    }),
);
