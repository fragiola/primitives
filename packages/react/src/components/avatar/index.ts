// The entry of @fragiola/primitives-react/avatar: an image that represents a person, shown once
// it has loaded, with a fallback (spec/avatar.md). Its loading is the toolkit's `/image`.

export type { ImageLoadingStatus } from "@fragiola/primitives/image";
export type { RenderProp } from "../../utils/render-element.tsx";
export type { AvatarState } from "./avatar-context.ts";
export type { AvatarFallbackProps } from "./avatar-fallback.tsx";
export type { AvatarImageProps } from "./avatar-image.tsx";
export type { AvatarRootProps } from "./avatar-root.tsx";
export { Avatar } from "./parts.ts";
