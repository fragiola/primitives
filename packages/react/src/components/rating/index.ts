// The entry of @fragiola/primitives-react/rating: a score chosen among stars (spec/rating.md, the
// APG's rating radio group). Its steps, the value under the pointer and a star's state are the
// toolkit's `/range`.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export { Rating } from "./parts.ts";
export type { RatingItemProps, RatingItemState } from "./rating-item.tsx";
export type {
    RatingRootProps,
    RatingRootRenderState,
    RatingRootState,
} from "./rating-root.tsx";
