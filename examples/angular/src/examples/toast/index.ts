import { Component } from "@angular/core";
import { Button } from "@fragiola/primitives-angular/button";
import {
    createToastManager,
    ToastAction,
    ToastClose,
    ToastDescription,
    ToastPortal,
    ToastProvider,
    ToastRoot,
    ToastTitle,
    ToastViewport,
} from "@fragiola/primitives-angular/toast";
import { styles } from "./styles.ts";

// The app's notifications: a plain module could hold this queue and add to it from anywhere.
const notifications = createToastManager({ limit: 3 });

let sent = 0;

// A stack of notifications: they close after five seconds (paused while hovered or focused), the
// older ones peek behind the newest, F6 reaches them, and a swipe to the right dismisses one.
@Component({
    selector: "example-notification-stack",
    imports: [
        Button,
        ToastProvider,
        ToastPortal,
        ToastViewport,
        ToastRoot,
        ToastTitle,
        ToastDescription,
        ToastAction,
        ToastClose,
    ],
    template: `
        <ng-container toastProvider #provider="toastProvider" [toastManager]="notifications">
            <div [class]="styles.buttons">
                <button button type="button" [class]="styles.trigger" (click)="sendMessage()">Send message</button>
                <button button type="button" [class]="styles.trigger" (click)="warnOffline()">Go offline</button>
            </div>
            <ng-container *toastPortal>
                <div toastViewport aria-label="Notifications" [class]="styles.viewport">
                    @for (item of provider.toasts(); track item.id) {
                        <div toastRoot [toast]="item" [class]="styles.root">
                            <h2 toastTitle [class]="styles.title">{{ item.title }}</h2>
                            <p toastDescription [class]="styles.description">{{ item.description }}</p>
                            @if (item.priority === "low") {
                                <button toastAction [class]="styles.action" (click)="notifications.close(item.id)">Undo</button>
                            }
                            <button toastClose [class]="styles.close">Dismiss</button>
                        </div>
                    }
                </div>
            </ng-container>
        </ng-container>
    `,
})
export default class NotificationStack {
    protected readonly styles = styles;
    protected readonly notifications = notifications;

    protected sendMessage(): void {
        sent += 1;
        notifications.add({
            title: `Message ${sent} sent`,
            description: "Delivered to the team channel.",
        });
    }

    protected warnOffline(): void {
        notifications.add({
            title: "You are offline",
            description: "Changes will sync when you reconnect.",
            priority: "high",
            timeout: 8000,
        });
    }
}
