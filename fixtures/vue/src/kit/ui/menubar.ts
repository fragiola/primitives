import { Menu } from "@fragiola/primitives-vue/menu";
import { Menubar as Primitive } from "@fragiola/primitives-vue/menubar";
import { menubar } from "examples-shared/recipes/menubar";
import { styled } from "../styled.ts";

export const Menubar = styled(Primitive, menubar.root);

/** A Menu.Trigger styled as an item of the bar; the menus' other parts are the Menu kit's. */
export const MenubarTrigger = styled(Menu.Trigger, menubar.trigger);
