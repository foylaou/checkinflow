import {EventDetail} from "@/app/dashboard/event/[id]/EventDetailPageContent";


export function isEventActive(event: EventDetail): boolean {
  const now = new Date();
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  return now >= start && now <= end;
}
