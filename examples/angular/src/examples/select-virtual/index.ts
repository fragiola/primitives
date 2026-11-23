import { Component } from "@angular/core";
import {
    SelectItem,
    SelectItemIndicator,
    SelectPopup,
    SelectPortal,
    SelectPositioner,
    SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectVirtualList,
    SelectVirtualRow,
} from "@fragiola/primitives-angular/select-virtual";
import { styles } from "./styles.ts";

// 5 000 made-up countries, the same on every load: a start, a vowel and an ending ("Aldabria" …
// "Zanuzia"), in alphabetical order.
const STARTS =
    "Ald Bar Cor Dun Elm Fen Gal Har Isk Jor Kel Lor Mar Nor Orl Pel Qir Ros Sar Tel Ulm Val Wen Yar Zan";
const ENDINGS =
    "bria burg dale dor dova fell gal gard goria heim holm kesh land lia lis lor mark mere mont nar nesia nia nora pura quay ra ria rin ros sha sia stan thal tia tor va vel via wick zia";
const COUNTRIES = STARTS.split(" ")
    .flatMap((start) =>
        [..."aeiou"].flatMap((vowel) =>
            ENDINGS.split(" ").map((ending) => start + vowel + ending),
        ),
    )
    .sort()
    .map((name) => ({ value: name.toLowerCase(), label: name }));

// A country list of thousands: the list renders only the countries in view, yet the arrows, Home
// and End and the typeahead reach every one of them, and each option keeps its place in the set
// (spec/virtual-lists.md).
@Component({
    selector: "example-country-list",
    imports: [
        SelectRoot,
        SelectTrigger,
        SelectValue,
        SelectPortal,
        SelectPositioner,
        SelectPopup,
        SelectVirtualList,
        SelectVirtualRow,
        SelectItem,
        SelectItemIndicator,
    ],
    template: `
        <div [class]="styles.stack">
            <label for="country" [class]="styles.label">Country</label>
            <ng-container selectRoot [items]="countries" name="country">
                <button selectTrigger id="country" [class]="styles.trigger"><span selectValue placeholder="Choose a country" [class]="styles.value"></span></button>
                <ng-container *selectPortal>
                    <div selectPositioner [class]="styles.positioner">
                        <div selectPopup [class]="styles.popup">
                            <div selectVirtualList #list="selectVirtualList" [class]="styles.list">
                                @for (row of list.rows(); track row.index) {
                                    <div selectItem [selectVirtualRow]="row" [value]="row.item.value" [class]="styles.item">{{ row.item.label }}<span *selectItemIndicator [class]="styles.itemIndicator">✓</span></div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
        </div>
    `,
})
export default class CountryList {
    protected readonly styles = styles;
    protected readonly countries = COUNTRIES;
}
