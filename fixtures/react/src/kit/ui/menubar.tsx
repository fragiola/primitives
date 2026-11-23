import { Menu } from "@fragiola/primitives-react/menu";
import { Menubar as Primitive } from "@fragiola/primitives-react/menubar";
import { menubar } from "examples-shared/recipes/menubar";
import type { ComponentProps } from "react";

export function Menubar(props: ComponentProps<typeof Primitive>) {
    return <Primitive className={menubar.root} {...props} />;
}

/** A Menu.Trigger styled as an item of the bar; the menus' other parts are the Menu kit's. */
export function MenubarTrigger(props: ComponentProps<typeof Menu.Trigger>) {
    return <Menu.Trigger className={menubar.trigger} {...props} />;
}
