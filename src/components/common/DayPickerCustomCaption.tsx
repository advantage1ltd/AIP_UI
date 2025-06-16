import * as React from 'react';
import { CaptionProps, useNavigation } from 'react-day-picker';

export function Caption(props: CaptionProps) {
  const { calendarMonth } = props;
  const { goToMonth, nextMonth, previousMonth } = useNavigation();

  return (
    <div className="flex items-center justify-between mb-4">
      <button
        type="button"
        onClick={() => previousMonth && goToMonth(previousMonth)}
        disabled={!previousMonth}
        className="w-10 h-10 flex items-center justify-center text-2xl text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:text-gray-400"
        aria-label="Previous Month"
      >
        ‹
      </button>
      <div className="flex-1 text-center">
        <span className="text-lg font-semibold">
          {calendarMonth.date.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
        </span>
      </div>
      <button
        type="button"
        onClick={() => nextMonth && goToMonth(nextMonth)}
        disabled={!nextMonth}
        className="w-10 h-10 flex items-center justify-center text-2xl text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:text-gray-400"
        aria-label="Next Month"
      >
        ›
      </button>
    </div>
  );
}

export type { CaptionProps as DayPickerCustomCaptionProps }; 