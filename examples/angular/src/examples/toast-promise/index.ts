import { Component } from "@angular/core";
import { Button } from "@fragiola/primitives-angular/button";
import {
    ToastClose,
    ToastDescription,
    ToastPortal,
    ToastProvider,
    ToastRoot,
    ToastTitle,
    ToastViewport,
} from "@fragiola/primitives-angular/toast";
import { styles } from "./styles.ts";

/** A pretend upload: it settles after 1.5 s, and fails for a file named "too-large.zip". */
function upload(name: string): Promise<{ name: string }> {
    return new Promise((resolve, reject) => {
        setTimeout(
            () =>
                name === "too-large.zip"
                    ? reject(new Error("the file is over 10 MB"))
                    : resolve({ name }),
            1500,
        );
    });
}

// A promise toast: "Uploading" while the upload runs (it never closes by itself meanwhile), then
// its result, announced and closed after the timeout.
@Component({
    selector: "example-upload-progress",
    imports: [
        Button,
        ToastProvider,
        ToastPortal,
        ToastViewport,
        ToastRoot,
        ToastTitle,
        ToastDescription,
        ToastClose,
    ],
    template: `
        <ng-container toastProvider #provider="toastProvider" [timeout]="4000">
            <div [class]="styles.buttons">
                <button button type="button" [class]="styles.trigger" (click)="start(provider, 'report.pdf')">Upload report.pdf</button>
                <button button type="button" [class]="styles.trigger" (click)="start(provider, 'too-large.zip')">Upload too-large.zip</button>
            </div>
            <ng-container *toastPortal>
                <div toastViewport aria-label="Notifications" [class]="styles.viewport">
                    @for (item of provider.toasts(); track item.id) {
                        <div toastRoot [toast]="item" [class]="styles.root">
                            <h2 toastTitle [class]="styles.title">{{ item.title }}</h2>
                            <p toastDescription [class]="styles.description">{{ item.description }}</p>
                            <button toastClose [class]="styles.close">Dismiss</button>
                        </div>
                    }
                </div>
            </ng-container>
        </ng-container>
    `,
})
export default class UploadProgress {
    protected readonly styles = styles;

    protected start(provider: ToastProvider, name: string): void {
        provider
            .manager()
            .promise(upload(name), {
                loading: {
                    title: `Uploading ${name}`,
                    description: "Please wait.",
                },
                success: (file) => ({
                    title: `${file.name} uploaded`,
                    description: "It is in your files.",
                }),
                error: (error) => ({
                    title: `Could not upload ${name}`,
                    description: (error as Error).message,
                }),
            })
            .catch(() => {});
    }
}
