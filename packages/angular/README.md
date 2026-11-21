# @fragiola/primitives-angular

Headless, accessible Angular 22 primitives of
[Fragiola Primitives](https://fragiola.com/primitives): standalone attribute directives on your
own elements (signals, zoneless), with behaviour, keyboard, focus and ARIA, and no CSS, no icons
and no text. State comes out as `data-*` and ARIA attributes.

```sh
pnpm add @fragiola/primitives-angular
```

**One secondary entry point per component**: import from
`@fragiola/primitives-angular/<component>` (or the root, which only re-exports them). There is no
NgModule of every directive.

```ts
import { Component } from "@angular/core";
import {
    DialogClose,
    DialogPopup,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "@fragiola/primitives-angular/dialog";

@Component({
    selector: "app-profile",
    imports: [DialogRoot, DialogTrigger, DialogPortal, DialogPopup, DialogTitle, DialogClose],
    template: `
        <ng-container dialogRoot>
            <button dialogTrigger>Edit profile</button>
            <ng-container *dialogPortal>
                <div dialogPopup>
                    <h2 dialogTitle>Edit profile</h2>
                    <button dialogClose>Close</button>
                </div>
            </ng-container>
        </ng-container>
    `,
})
export class Profile {}
```

| entry | directives |
| --- | --- |
| `/dialog` | `[dialogRoot]`, `[dialogTrigger]`, `*dialogPortal`, `[dialogBackdrop]`, `[dialogPopup]`, `[dialogTitle]`, `[dialogDescription]`, `[dialogClose]`; `injectDialog()` |
| `/tabs` | `[tabsRoot]`, `[tabsList]`, `[tabsTab]`, `[tabsIndicator]`, `[tabsPanel]`; `injectTabs()` |
| `/internal` | what the entries share; not an app's API |

Controlled state with two-way bindings (`[(open)]`, `[(value)]`); each part's state through
`exportAs` (`#popup="dialogPopup"`, `popup.state()`). Every element carries
`data-primitives-part="<component>-<part>"`.

Peer dependency: `@angular/core` 22. ESM only. MIT licence.
