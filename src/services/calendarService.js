export function isPastDate(startDateTime, now = new Date()) {
  return startDateTime < now;
}

export function isInvalidRange(startDateTime, endDateTime) {
  return startDateTime >= endDateTime;
}

export function hasOverlap(startDateTime, endDateTime, events) {
  return events.some(event => {
    return startDateTime < event.end &&
           endDateTime > event.start;
  });
}