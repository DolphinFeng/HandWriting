import { IScheduleDetail } from '../interfaces'

export const filterOrgnizerInAttendees = (schedule: IScheduleDetail): IScheduleDetail => {
  const { organizer, attendees } = schedule
  schedule.attendees = attendees.filter(attendee => attendee.empId !== organizer.empId)
  return schedule
}
