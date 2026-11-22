import { Component } from "@angular/core";
import {
    AvatarFallback,
    AvatarImage,
    AvatarRoot,
} from "@fragiola/primitives-angular/avatar";
import { styles } from "./styles.ts";

// Inline images, so the example needs no file: a portrait, and data that is no image (a broken
// image with no failed request to log).
const BROKEN = "data:image/png;base64,AAAA";
const PORTRAIT =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%232f6f8f'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%23f2d4b6'/%3E%3C/svg%3E";

// The team: an image shown once it has loaded, a broken image that shows its initials instead,
// and initials with a delay, so a fast image would never flash them (spec/avatar.md).
@Component({
    selector: "example-team-avatars",
    imports: [AvatarRoot, AvatarImage, AvatarFallback],
    template: `
        <div [class]="styles.row">
            <span avatarRoot [class]="styles.root">
                <img *avatarImage="portrait" alt="Ada Lovelace" [class]="styles.image" />
                <span *avatarFallback [class]="styles.fallback">AL</span>
            </span>
            <span avatarRoot [class]="styles.root">
                <img *avatarImage="broken" alt="Grace Hopper" [class]="styles.image" />
                <span *avatarFallback [class]="styles.fallback">GH</span>
            </span>
            <span avatarRoot [class]="styles.root">
                <span *avatarFallback="300" [class]="styles.fallback">KJ</span>
            </span>
        </div>
    `,
})
export default class TeamAvatars {
    protected readonly styles = styles;
    protected readonly portrait = PORTRAIT;
    protected readonly broken = BROKEN;
}
