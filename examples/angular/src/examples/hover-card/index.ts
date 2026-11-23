import { Component } from "@angular/core";
import {
    HoverCardArrow,
    HoverCardPopup,
    HoverCardPortal,
    HoverCardPositioner,
    HoverCardRoot,
    HoverCardTrigger,
} from "@fragiola/primitives-angular/hover-card";
import { styles } from "./styles.ts";

// A user profile preview: hovering or focusing the link shows the card after a delay; the pointer
// can cross over to it, Escape or a press outside closes it, and the link still goes to the page.
@Component({
    selector: "example-profile-preview",
    imports: [
        HoverCardRoot,
        HoverCardTrigger,
        HoverCardPortal,
        HoverCardPositioner,
        HoverCardPopup,
        HoverCardArrow,
    ],
    template: `
        <p [class]="styles.text">Reviewed by <ng-container hoverCardRoot [delay]="400" [closeDelay]="200"><a hoverCardTrigger href="#ada" [class]="styles.trigger">&#64;ada</a><ng-container *hoverCardPortal><div hoverCardPositioner [sideOffset]="8" [class]="styles.positioner"><div hoverCardPopup [class]="styles.popup"><div hoverCardArrow [class]="styles.arrow"></div><div [class]="styles.header"><span [class]="styles.avatar" aria-hidden="true">AL</span><div><div [class]="styles.name">Ada Lovelace</div><div [class]="styles.handle">&#64;ada</div></div></div><p [class]="styles.bio">Mathematician and writer of the first published program.</p><div [class]="styles.stats"><span>42 reviews</span><span>7 repositories</span></div></div></div></ng-container></ng-container> approved this change.</p>
    `,
})
export default class ProfilePreview {
    protected readonly styles = styles;
}
