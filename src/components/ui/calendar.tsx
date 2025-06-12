import * as React from "react";
import { DayPicker } from "react-day-picker";
import { Caption } from "@/components/common/DayPickerCustomCaption";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={className}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-2 xs:space-y-4",
        caption: "flex items-center justify-between gap-2 w-full",
        caption_label: "text-center text-lg font-semibold text-gray-900",
        nav: "hidden",
        nav_button: "hidden",
        nav_button_previous: "hidden",
        nav_button_next: "hidden",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-gray-500 rounded-md w-7 xs:w-8 font-bold text-base text-center",
        row: "flex w-full mt-1 xs:mt-2",
        cell: "text-center text-xs p-0 relative w-7 h-7 xs:w-8 xs:h-8 focus-within:relative focus-within:z-20",
        day: "h-7 w-7 xs:h-8 xs:w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-full transition-colors text-base cursor-pointer",
        day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white rounded-full",
        day_today: "bg-blue-50 text-blue-600 font-semibold rounded-full",
        day_outside: "text-gray-400 opacity-50",
        day_disabled: "text-red-600 bg-red-50 line-through opacity-70 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900",
        day_hidden: "invisible",
        ...classNames
      }}
      components={{
        MonthCaption: Caption,
        ...props.components
      }}
      {...props}
    />
  );
}