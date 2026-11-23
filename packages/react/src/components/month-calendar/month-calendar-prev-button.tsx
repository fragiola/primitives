import type { PartProps } from "../../utils/render-element.tsx";
import {
    MonthCalendarPageButton,
    type MonthCalendarPageButtonState,
} from "./month-calendar-page-button.tsx";

export interface MonthCalendarPrevButtonProps
    extends PartProps<MonthCalendarPageButtonState> {}

/** Shows the previous page (a year; 12 years); the consumer names it. */
export function MonthCalendarPrevButton(props: MonthCalendarPrevButtonProps) {
    return <MonthCalendarPageButton delta={-1} {...props} />;
}
