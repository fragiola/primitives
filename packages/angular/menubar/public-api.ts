// The entry of @fragiola/primitives-angular/menubar: a bar of menus with one tab stop, whose items
// are the `[menuTrigger]`s of the `[menuRoot]`s inside it (spec/menubar.md, the APG menubar), as
// a standalone attribute directive on the consumer's own element. Its menus are Menu's (`/menu`).

export type { RovingOrientation } from "@fragiola/primitives/collection";
export {
    Menubar,
    type MenubarState,
} from "./directives/menubar.directive.ts";
