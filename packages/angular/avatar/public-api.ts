// The entry of @fragiola/primitives-angular/avatar: an image that represents a person, shown once
// it has loaded, with a fallback (spec/avatar.md), as standalone directives on the consumer's own
// elements. Its loading is the toolkit's `/image`.

export type { ImageLoadingStatus } from "@fragiola/primitives/image";
export { AvatarFallback } from "./directives/avatar-fallback.directive.ts";
export {
    AvatarImage,
    type AvatarImageCrossOrigin,
} from "./directives/avatar-image.directive.ts";
export {
    AvatarRoot,
    type AvatarState,
} from "./directives/avatar-root.directive.ts";
