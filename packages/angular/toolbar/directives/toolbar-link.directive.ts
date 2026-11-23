import { computed, Directive, inject } from "@angular/core";
import type { RovingOrientation } from "@fragiola/primitives/collection";
import {
    dataValues,
    injectRovingItem,
    ownAttribute,
} from "@fragiola/primitives-angular/internal";
import { ToolbarRoot } from "./toolbar-root.directive.ts";

/** A link of a toolbar (spec/toolbar.md): `<a toolbarLink href="/help">`, an item of the toolbar's focus; it cannot be disabled. */
@Directive({
    selector: "[toolbarLink]",
    exportAs: "toolbarLink",
    host: {
        "data-primitives-part": "toolbar-link",
        "[attr.tabindex]": "item?.tabIndex() ?? ownTabIndex",
        "[attr.data-orientation]": "data().orientation",
    },
})
export class ToolbarLink {
    private readonly root = inject(ToolbarRoot);
    protected readonly item = injectRovingItem(() => true);
    protected readonly ownTabIndex = ownAttribute("tabindex");
    readonly state = computed<{ orientation: RovingOrientation }>(() => ({
        orientation: this.root.orientation(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
}
