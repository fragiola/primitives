import { createContext, useContext, useMemo, useState } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { MenuContext } from "./menu-context.ts";

export const MenuGroupContext = createContext<
    ((id: string | undefined) => void) | null
>(null);

/** Groups items under its GroupLabel. */
export function MenuGroup(props: PartProps<Record<string, never>>) {
    const component = useContext(MenuContext)?.component ?? "menu";
    const [labelId, setLabelId] = useState<string>();
    const register = useMemo(() => setLabelId, []);
    return (
        <MenuGroupContext.Provider value={register}>
            {renderElement(
                "div",
                props,
                {},
                {
                    role: "group",
                    "aria-labelledby": labelId,
                    "data-primitives-part": `${component}-group`,
                },
            )}
        </MenuGroupContext.Provider>
    );
}
