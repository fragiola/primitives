// The entry of @fragiola/primitives-vue/avatar: an image that represents a person, shown once
// it has loaded, with a fallback (spec/avatar.md). Its loading is the toolkit's `/image`.

export type { ImageLoadingStatus } from "@fragiola/primitives/image";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { AvatarState } from "./avatar-context.ts";
export type { AvatarFallbackProps } from "./avatar-fallback.ts";
export type { AvatarImageEmits, AvatarImageProps } from "./avatar-image.ts";
export { Avatar } from "./parts.ts";
