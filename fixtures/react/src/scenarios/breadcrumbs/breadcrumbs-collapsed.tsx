import { Menu as MenuPrimitive } from "@fragiola/primitives-react/menu";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Breadcrumbs } from "../../kit/ui/breadcrumbs.tsx";
import { Menu } from "../../kit/ui/menu.tsx";

/** spec/breadcrumbs.md, `/breadcrumbs/collapsed` */
export function BreadcrumbsCollapsed() {
    const [chosen, setChosen] = useState<string>();
    return (
        <>
            <Breadcrumbs.Root aria-label="Breadcrumb">
                <Breadcrumbs.List>
                    <Breadcrumbs.Item>
                        <Breadcrumbs.Link href="#home">Home</Breadcrumbs.Link>
                    </Breadcrumbs.Item>
                    <Breadcrumbs.Separator>/</Breadcrumbs.Separator>
                    <Breadcrumbs.Item>
                        <Menu.Root>
                            <Breadcrumbs.Ellipsis
                                aria-label="Show the hidden pages"
                                render={<MenuPrimitive.Trigger />}
                            >
                                …
                            </Breadcrumbs.Ellipsis>
                            <Menu.Portal>
                                <Menu.Positioner sideOffset={4}>
                                    <Menu.Popup>
                                        <Menu.Item
                                            onClick={() => setChosen("Docs")}
                                        >
                                            Docs
                                        </Menu.Item>
                                        <Menu.Item
                                            onClick={() =>
                                                setChosen("Components")
                                            }
                                        >
                                            Components
                                        </Menu.Item>
                                    </Menu.Popup>
                                </Menu.Positioner>
                            </Menu.Portal>
                        </Menu.Root>
                    </Breadcrumbs.Item>
                    <Breadcrumbs.Separator>/</Breadcrumbs.Separator>
                    <Breadcrumbs.Item>
                        <Breadcrumbs.Link href="#guides">
                            Guides
                        </Breadcrumbs.Link>
                    </Breadcrumbs.Item>
                    <Breadcrumbs.Separator>/</Breadcrumbs.Separator>
                    <Breadcrumbs.Item>
                        <Breadcrumbs.Current>Routing</Breadcrumbs.Current>
                    </Breadcrumbs.Item>
                </Breadcrumbs.List>
            </Breadcrumbs.Root>
            <Output values={{ chosen }} />
        </>
    );
}
