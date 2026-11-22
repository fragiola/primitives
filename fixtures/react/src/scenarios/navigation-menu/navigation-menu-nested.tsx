import { navigationMenu } from "examples-shared/recipes/navigation-menu";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { NavigationMenu } from "../../kit/ui/navigation-menu.tsx";

/** spec/navigation-menu.md: a nested, vertical level inside the Products Content. */
export function NavigationMenuNested() {
    const [value, setValue] = useState<string | null>(null);
    const [nested, setNested] = useState<string | null>(null);
    return (
        <>
            <NavigationMenu.Root aria-label="Main" onValueChange={setValue}>
                <NavigationMenu.List>
                    <NavigationMenu.Item value="products">
                        <NavigationMenu.Trigger>
                            Products
                            <NavigationMenu.Icon />
                        </NavigationMenu.Trigger>
                        <NavigationMenu.Content>
                            <NavigationMenu.Root
                                orientation="vertical"
                                onValueChange={setNested}
                            >
                                <NavigationMenu.List>
                                    <NavigationMenu.Item value="developers">
                                        <NavigationMenu.Trigger>
                                            Developers
                                            <NavigationMenu.Icon />
                                        </NavigationMenu.Trigger>
                                        <NavigationMenu.Content>
                                            <ul
                                                className={
                                                    navigationMenu[
                                                        "content-list"
                                                    ]
                                                }
                                            >
                                                <li>
                                                    <NavigationMenu.ContentLink href="#api">
                                                        API
                                                    </NavigationMenu.ContentLink>
                                                </li>
                                                <li>
                                                    <NavigationMenu.ContentLink href="#sdks">
                                                        SDKs
                                                    </NavigationMenu.ContentLink>
                                                </li>
                                            </ul>
                                        </NavigationMenu.Content>
                                    </NavigationMenu.Item>
                                    <NavigationMenu.Item>
                                        <NavigationMenu.Link href="#teams">
                                            Teams
                                        </NavigationMenu.Link>
                                    </NavigationMenu.Item>
                                </NavigationMenu.List>
                                <NavigationMenu.Portal>
                                    <NavigationMenu.Positioner
                                        side="inline-end"
                                        sideOffset={8}
                                    >
                                        <NavigationMenu.Popup>
                                            <NavigationMenu.Viewport />
                                        </NavigationMenu.Popup>
                                    </NavigationMenu.Positioner>
                                </NavigationMenu.Portal>
                            </NavigationMenu.Root>
                        </NavigationMenu.Content>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link href="#pricing">
                            Pricing
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                </NavigationMenu.List>
                <NavigationMenu.Portal>
                    <NavigationMenu.Positioner sideOffset={8}>
                        <NavigationMenu.Popup>
                            <NavigationMenu.Viewport />
                        </NavigationMenu.Popup>
                    </NavigationMenu.Positioner>
                </NavigationMenu.Portal>
            </NavigationMenu.Root>
            <Output values={{ value, nested }} />
        </>
    );
}
