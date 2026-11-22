import { Component } from "@angular/core";
import {
    NavigationMenuArrow,
    NavigationMenuContent,
    NavigationMenuIcon,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuPopup,
    NavigationMenuPortal,
    NavigationMenuPositioner,
    NavigationMenuRoot,
    NavigationMenuTrigger,
    NavigationMenuViewport,
} from "@fragiola/primitives-angular/navigation-menu";
import { styles } from "./styles.ts";

// A site header: hover or press "Products" or "Resources" to disclose a panel of links, in one
// popup that resizes to each panel; the arrow keys move between the items, ArrowDown opens a
// panel with focus inside, Escape closes it (spec/navigation-menu.md).
@Component({
    selector: "example-site-header",
    imports: [
        NavigationMenuRoot,
        NavigationMenuList,
        NavigationMenuItem,
        NavigationMenuTrigger,
        NavigationMenuIcon,
        NavigationMenuContent,
        NavigationMenuLink,
        NavigationMenuPortal,
        NavigationMenuPositioner,
        NavigationMenuPopup,
        NavigationMenuViewport,
        NavigationMenuArrow,
    ],
    template: `
        <header [class]="styles.header">
            <span [class]="styles.brand">Acme</span>
            <nav navigationMenuRoot aria-label="Main" [class]="styles.root">
                <ul navigationMenuList [class]="styles.list">
                    <li navigationMenuItem [class]="styles.item">
                        <button navigationMenuTrigger [class]="styles.trigger">Products<span navigationMenuIcon [class]="styles.icon"></span></button>
                        <div *navigationMenuContent [class]="styles.content">
                            <ul [class]="styles.panel">
                                @for (link of products; track link.href) {
                                    <li><a navigationMenuLink [href]="link.href" [class]="styles.contentLink"><span [class]="styles.linkTitle">{{ link.title }}</span><span [class]="styles.linkDescription">{{ link.text }}</span></a></li>
                                }
                            </ul>
                        </div>
                    </li>
                    <li navigationMenuItem [class]="styles.item">
                        <button navigationMenuTrigger [class]="styles.trigger">Resources<span navigationMenuIcon [class]="styles.icon"></span></button>
                        <div *navigationMenuContent [class]="styles.content">
                            <ul [class]="styles.grid">
                                @for (link of resources; track link.href) {
                                    <li><a navigationMenuLink [href]="link.href" [class]="styles.contentLink"><span [class]="styles.linkTitle">{{ link.title }}</span><span [class]="styles.linkDescription">{{ link.text }}</span></a></li>
                                }
                            </ul>
                        </div>
                    </li>
                    <li navigationMenuItem [class]="styles.item">
                        <a navigationMenuLink href="#pricing" [class]="styles.link">Pricing</a>
                    </li>
                </ul>
                <ng-container *navigationMenuPortal>
                    <div navigationMenuPositioner [sideOffset]="8" [class]="styles.positioner">
                        <div navigationMenuPopup [class]="styles.popup">
                            <div navigationMenuArrow [class]="styles.arrow"></div>
                            <div navigationMenuViewport [class]="styles.viewport"></div>
                        </div>
                    </div>
                </ng-container>
            </nav>
        </header>
    `,
})
export default class SiteHeader {
    protected readonly styles = styles;
    protected readonly products = [
        {
            href: "#analytics",
            title: "Analytics",
            text: "See how people use it.",
        },
        {
            href: "#automation",
            title: "Automation",
            text: "Run the boring parts.",
        },
        { href: "#reports", title: "Reports", text: "Share what you learned." },
    ];
    protected readonly resources = [
        { href: "#guides", title: "Guides", text: "Step by step." },
        { href: "#blog", title: "Blog", text: "News and stories." },
        { href: "#videos", title: "Videos", text: "Watch and learn." },
        { href: "#community", title: "Community", text: "Ask and answer." },
    ];
}
