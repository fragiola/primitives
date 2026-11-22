import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    type CalendarPageButtonState,
    definePageButton,
} from "./calendar-page-button.ts";

export type CalendarPrevButtonProps = Record<never, never>;

/** Shows the previous page of months (`visibleMonths` of them); the consumer names it. */
export const CalendarPrevButton: PartComponent<
    CalendarPrevButtonProps,
    CalendarPageButtonState
> = publicComponent(definePageButton("CalendarPrevButton", -1));
