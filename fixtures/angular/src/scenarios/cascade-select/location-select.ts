import {
    CascadeSelectItem,
    CascadeSelectItemIndicator,
    CascadeSelectLevel,
    CascadeSelectPopup,
    CascadeSelectPortal,
    CascadeSelectPositioner,
    CascadeSelectRoot,
    CascadeSelectTrigger,
    CascadeSelectValue,
} from "@fragiola/primitives-angular/cascade-select";

/** Every CascadeSelect directive, for a scenario's `imports`. */
export const CASCADE_SELECT_PARTS = [
    CascadeSelectRoot,
    CascadeSelectTrigger,
    CascadeSelectValue,
    CascadeSelectPortal,
    CascadeSelectPositioner,
    CascadeSelectPopup,
    CascadeSelectLevel,
    CascadeSelectItem,
    CascadeSelectItemIndicator,
] as const;

/**
 * The CascadeSelect of the cascade-select scenarios: three Levels side by side, in a template
 * whose component has `styles` (the recipe), `items`, `depths`, `triggerId`, `name`, `required`,
 * `changeOnSelect`, `defaultValue`, `separator`, `onValueChange(path)` and `onOpenChange(event)`.
 * The root is a comment node and the popup moves to `body`, so the elements match React's.
 */
export const LOCATION_SELECT = `
    <ng-container cascadeSelectRoot [items]="items" [name]="name" [required]="required" [changeOnSelect]="changeOnSelect" [defaultValue]="defaultValue" (valueChange)="onValueChange($event)" (openChangeDetails)="onOpenChange($event)">
        <button cascadeSelectTrigger [attr.id]="triggerId" [class]="styles.trigger"><span cascadeSelectValue placeholder="Choose a place" [separator]="separator" [class]="styles.value"></span></button>
        <ng-container *cascadeSelectPortal>
            <div cascadeSelectPositioner [class]="styles.positioner">
                <div cascadeSelectPopup [class]="styles.popup">
                    @for (depth of depths; track depth) {
                        <div cascadeSelectLevel [depth]="depth" #level="cascadeSelectLevel" [class]="styles.level">
                            @for (item of level.items(); track item.value) {
                                <div cascadeSelectItem [value]="item.value" [class]="styles.item">{{ item.label }}<span *cascadeSelectItemIndicator [class]="styles['item-indicator']">✓</span></div>
                            }
                        </div>
                    }
                </div>
            </div>
        </ng-container>
    </ng-container>
`;

/** The depths of the scenarios' Levels. */
export const DEPTHS = [0, 1, 2] as const;
