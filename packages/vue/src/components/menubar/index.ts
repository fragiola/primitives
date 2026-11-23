// The entry of @fragiola/primitives-vue/menubar: a bar of menus with one tab stop, whose items
// are the Menu.Triggers of the Menu.Roots inside it (spec/menubar.md, the APG menubar). Its
// menus are Menu's (`/menu`).

export type { RovingOrientation } from "@fragiola/primitives/collection";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { Menubar, type MenubarProps, type MenubarState } from "./menubar.ts";
