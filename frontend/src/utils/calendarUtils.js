export function parseTaskDateTime(task) {
  if (!task?.dueDate) {
    return null;
  }

  const [year, month, day] = task.dueDate
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  if (task.dueTime) {
    const [hours, minutes] = task.dueTime
      .split(":")
      .map(Number);

    date.setHours(hours, minutes, 0, 0);
  } else {
    date.setHours(23, 59, 59, 999);
  }

  return date;
}


export function isSameDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}


export function getTimeSlot(time) {
  if (!time) {
    return null;
  }

  const [hours, minutes] = time
    .split(":")
    .map(Number);

  const slotMinutes =
    minutes < 30
      ? 0
      : 30;

  return `${String(hours).padStart(2, "0")}:${String(
    slotMinutes
  ).padStart(2, "0")}`;
}


export function generateTimeSlots(
  startHour = 7,
  endHour = 23
) {
  const slots = [];

  for (
    let hour = startHour;
    hour <= endHour;
    hour++
  ) {
    slots.push(
      `${String(hour).padStart(2, "0")}:00`
    );

    if (hour < endHour) {
      slots.push(
        `${String(hour).padStart(2, "0")}:30`
      );
    }
  }

  return slots;
}


export function formatTime(time) {
  if (!time) {
    return "";
  }

  const [hour, minute] = time.split(":");

  return `${hour}:${minute}`;
}