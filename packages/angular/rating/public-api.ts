// The entry of @fragiola/primitives-angular/rating: a score chosen among stars (spec/rating.md, the
// APG's rating radio group), as standalone directives on the consumer's own elements. Its steps,
// the value under the pointer and a star's state are the toolkit's `/range`.

export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { RatingHiddenInput } from "./directives/rating-hidden-input.directive.ts";
export {
    RatingItem,
    type RatingItemState,
} from "./directives/rating-item.directive.ts";
export {
    RatingRoot,
    type RatingRootState,
} from "./directives/rating-root.directive.ts";
