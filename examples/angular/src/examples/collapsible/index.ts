import { Component } from "@angular/core";
import {
    CollapsiblePanel,
    CollapsibleRoot,
    CollapsibleTrigger,
} from "@fragiola/primitives-angular/collapsible";
import { styles } from "./styles.ts";

const SECTIONS = [
    {
        label: "Workspace",
        links: ["Overview", "Members", "Billing"],
        defaultOpen: true,
    },
    {
        label: "Projects",
        links: ["Website", "Mobile app", "Design system"],
        defaultOpen: false,
    },
    {
        label: "Archived",
        links: ["Old landing page", "2025 campaign"],
        defaultOpen: false,
    },
];

// A settings sidebar: each section's button shows and hides its links, and the panels' height
// animates from their size variable. The closed panels are hidden until found, so the browser's
// find-in-page opens the section that holds a match (spec/collapsible.md).
@Component({
    selector: "example-settings-sidebar",
    imports: [CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel],
    template: `
        <nav aria-label="Settings" [class]="styles.sidebar">
            @for (section of sections; track section.label) {
                <div collapsibleRoot [defaultOpen]="section.defaultOpen" [class]="styles.root">
                    <button collapsibleTrigger [class]="styles.trigger">{{ section.label }}</button>
                    <div *collapsiblePanel="{ hiddenUntilFound: true }" [class]="styles.panel">
                        <ul [class]="styles.list">
                            @for (link of section.links; track link) {
                                <li><a [href]="href(link)" [class]="styles.link">{{ link }}</a></li>
                            }
                        </ul>
                    </div>
                </div>
            }
        </nav>
    `,
})
export default class SettingsSidebar {
    protected readonly styles = styles;
    protected readonly sections = SECTIONS;

    protected href(link: string): string {
        return `#${link.toLowerCase().replaceAll(" ", "-")}`;
    }
}
