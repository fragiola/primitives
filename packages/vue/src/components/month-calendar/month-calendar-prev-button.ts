import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    defineMonthPageButton,
    type MonthCalendarPageButtonState,
} from "./month-calendar-page-button.ts";

export type MonthCalendarPrevButtonProps = Record<never, never>;

/** Shows the previous page (a year; 12 years); the consumer names it. */
export const MonthCalendarPrevButton: PartComponent<
    MonthCalendarPrevButtonProps,
    MonthCalendarPageButtonState
> = publicComponent(defineMonthPageButton("MonthCalendarPrevButton", -1));
