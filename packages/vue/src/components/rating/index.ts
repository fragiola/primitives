// The entry of @fragiola/primitives-vue/rating: a score chosen among stars (spec/rating.md, the
// APG's rating radio group). Its steps, the value under the pointer and a star's state are the
// toolkit's `/range`.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { Rating } from "./parts.ts";
export type {
    RatingItemProps,
    RatingItemSlots,
    RatingItemState,
} from "./rating-item.ts";
export type {
    RatingRootEmits,
    RatingRootProps,
    RatingRootRenderState,
    RatingRootSlots,
    RatingRootState,
} from "./rating-root.ts";
