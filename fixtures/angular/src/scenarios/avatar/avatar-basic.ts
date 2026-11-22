import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    AvatarFallback,
    AvatarImage,
    AvatarRoot,
    type ImageLoadingStatus,
} from "@fragiola/primitives-angular/avatar";
import { avatar } from "examples-shared/recipes/avatar";
import { Output } from "../../kit/output.ts";

/**
 * A loaded image, a broken one, initials with a delay, and a cached image mounted later
 * (spec/avatar.md). The Images use the template's long form, for their `(loadingStatusChange)`.
 */
@Component({
    selector: "[scenario-avatar-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [AvatarRoot, AvatarImage, AvatarFallback, Output],
    template: `
        <div class="flex items-center gap-4">
            <span avatarRoot [class]="styles.root">
                <ng-template [avatarImage]="'/avatar/ada.svg'" (loadingStatusChange)="ada.set($event)"><img alt="Ada Lovelace" [class]="styles.image" /></ng-template>
                <span *avatarFallback [class]="styles.fallback">AL</span>
            </span>
            <span avatarRoot [class]="styles.root">
                <ng-template [avatarImage]="'/avatar/missing.svg'" (loadingStatusChange)="missing.set($event)"><img alt="Grace Hopper" [class]="styles.image" /></ng-template>
                <span *avatarFallback [class]="styles.fallback">GH</span>
            </span>
            <span avatarRoot [class]="styles.root">
                <span *avatarFallback="300" [class]="styles.fallback">KJ</span>
            </span>
            @if (shown()) {
                <span avatarRoot [class]="styles.root">
                    <ng-template [avatarImage]="'/avatar/ada.svg'" (loadingStatusChange)="report($event)"><img alt="Ada again" [class]="styles.image" /></ng-template>
                    <span *avatarFallback [class]="styles.fallback">AA</span>
                </span>
            }
        </div>
        <button type="button" class="mt-4" (click)="shown.set(true)">Show again</button>
        <pre fixtureOutput [values]="{ ada: ada(), missing: missing(), again: again().length > 0 ? again().join(',') : undefined }"></pre>
    `,
})
export class AvatarBasic {
    protected readonly styles = avatar;
    protected readonly ada = signal<ImageLoadingStatus | undefined>(undefined);
    protected readonly missing = signal<ImageLoadingStatus | undefined>(
        undefined,
    );
    protected readonly again = signal<readonly ImageLoadingStatus[]>([]);
    protected readonly shown = signal(false);

    protected report(status: ImageLoadingStatus): void {
        this.again.update((current) => [...current, status]);
    }
}
