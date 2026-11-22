import type { ChangeDetails } from "@fragiola/primitives-react/navigation-menu";
import { navigationMenu } from "examples-shared/recipes/navigation-menu";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { NavigationMenu } from "../../kit/ui/navigation-menu.tsx";

/** spec/navigation-menu.md: a site header with two disclosed panels and a link. */
export function NavigationMenuBasic() {
    const [value, setValue] = useState<string | null>(null);
    const [reason, setReason] = useState<string>();
    return (
        <>
            <NavigationMenu.Root
                aria-label="Main"
                onValueChange={(
                    next: string | null,
                    details: ChangeDetails,
                ) => {
                    setValue(next);
                    setReason(details.reason);
                }}
            >
                <NavigationMenu.List>
                    <NavigationMenu.Item value="products">
                        <NavigationMenu.Trigger>
                            Products
                            <NavigationMenu.Icon />
                        </NavigationMenu.Trigger>
                        <NavigationMenu.Content>
                            <ul className={navigationMenu["content-list"]}>
                                <li>
                                    <NavigationMenu.ContentLink
                                        href="#analytics"
                                        active
                                    >
                                        Analytics
                                    </NavigationMenu.ContentLink>
                                </li>
                                <li>
                                    <NavigationMenu.ContentLink href="#automation">
                                        Automation
                                    </NavigationMenu.ContentLink>
                                </li>
                                <li>
                                    <NavigationMenu.ContentLink href="#reports">
                                        Reports
                                    </NavigationMenu.ContentLink>
                                </li>
                            </ul>
                        </NavigationMenu.Content>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item value="learn">
                        <NavigationMenu.Trigger>
                            Learn
                            <NavigationMenu.Icon />
                        </NavigationMenu.Trigger>
                        <NavigationMenu.Content>
                            <ul className={navigationMenu["content-grid"]}>
                                <li>
                                    <NavigationMenu.ContentLink href="#guides">
                                        Guides
                                    </NavigationMenu.ContentLink>
                                </li>
                                <li>
                                    <NavigationMenu.ContentLink href="#blog">
                                        Blog
                                    </NavigationMenu.ContentLink>
                                </li>
                                <li>
                                    <NavigationMenu.ContentLink href="#videos">
                                        Videos
                                    </NavigationMenu.ContentLink>
                                </li>
                                <li>
                                    <NavigationMenu.ContentLink href="#community">
                                        Community
                                    </NavigationMenu.ContentLink>
                                </li>
                            </ul>
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
                            <NavigationMenu.Arrow />
                            <NavigationMenu.Viewport />
                        </NavigationMenu.Popup>
                    </NavigationMenu.Positioner>
                </NavigationMenu.Portal>
            </NavigationMenu.Root>
            <button type="button" className="mt-40">
                Outside button
            </button>
            <Output values={{ value, reason }} />
        </>
    );
}
