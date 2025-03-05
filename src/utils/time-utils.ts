import { Critter } from '@/types/critter'

/** Returns 24hr time in a format of { startHour: number, endHour: number } */
export const parseTimeString = (timeString: string) => {
  timeString = timeString.replace(' - ', ' to ')
  const [start, end] = timeString.split(' to ')
  const [startHour, startMeridiem] = start.split(' ')
  const [endHour, endMeridiem] = end.split(' ')

  // convert to 24 hour format
  let startHourNumber = parseInt(startHour)
  let endHourNumber = parseInt(endHour)

  if (startMeridiem === 'PM' && startHourNumber !== 12) {
    startHourNumber += 12
  }

  if (endMeridiem === 'PM' && endHourNumber !== 12) {
    endHourNumber += 12
  }

  if (startMeridiem === 'AM' && startHourNumber === 12) {
    startHourNumber = 0
  }

  if (endMeridiem === 'AM' && endHourNumber === 12) {
    endHourNumber = 0
  }

  return { startHour: startHourNumber, endHour: endHourNumber }
}

/** Returns 12hr time (ie: 23 -> 11 PM) */
export const convert24HourTo12Hour = (hour: number) => {
  let meridiem = 'AM'
  let hourNumber = hour

  if (hour === 0) {
    return '12 ' + meridiem
  }
  if (hour > 12) {
    meridiem = 'PM'
    hourNumber = hour - 12
  }
  if (hour === 12) {
    meridiem = 'PM'
  }

  return hourNumber + ' ' + meridiem
}

/** Returns 24hr time (ie: 11 PM -> 23) */
export const convert12HourTo24Hour = (hour: string) => {
  const [time, meridiem] = hour.split(' ')
  let hourNumber = parseInt(time)
  if (meridiem === 'AM' && hourNumber === 12) {
    hourNumber = 0
  }
  if (meridiem === 'PM' && hourNumber !== 12) {
    hourNumber += 12
  }

  return hourNumber
}

export const getIsAvailableOnDay = (schedule: Critter['schedule'], day: string) => {
  const daySchedule = schedule[day.toLowerCase() as keyof Critter['schedule']]
  return typeof daySchedule === 'boolean' ? daySchedule : true
}

/** Takes in hour as 24 hour time */
export const getIsAvailableAtTime = (schedule: Critter['schedule'], day: string, hour: 'all-day' | number, minute: number) => {
  if (!day) {
    return Object.values(schedule).some(daySchedule => {
      return checkTime(daySchedule, hour, minute)
    })
  } else {
    // if no day is set, we need to loop through all days to check if the critter is available at the current time
    const daySchedule = schedule[day.toLowerCase() as keyof Critter['schedule']]
    return checkTime(daySchedule, hour, minute)
  }
}

const checkTime = (daySchedule: Critter['schedule'][keyof Critter['schedule']], hour: number | 'all-day', minute: number) => {
  if (hour === 'all-day') {
    return daySchedule === true
  }

  if (typeof daySchedule === 'boolean') {
    return daySchedule
  }

  const { startHour, endHour } = parseTimeString(daySchedule as string)

  let endHourToCompare = endHour
  
  // Handle cases where the date range ends at or past midnight
  if (endHour < startHour) {
    endHourToCompare = endHour + 24
  }

  return ((startHour <= hour) && ((endHourToCompare > hour) || (endHourToCompare === hour && minute >= 0)))
}