export const MERIDIEM = {
  AM: 'AM',
  PM: 'PM'
} as const

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
    let hour = i
    const meridium = hour < 12 ? MERIDIEM.AM : MERIDIEM.PM
    if (meridium === MERIDIEM.PM) {
        hour = hour - 12
    }
    return hour === 0 ? '12 ' + meridium : hour + ' ' + meridium
})

export const DAY_OPTIONS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
] as const
