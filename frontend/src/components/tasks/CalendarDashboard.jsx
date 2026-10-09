import { useState } from "react";
import { useTasks } from "../../context/TaskContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { generateTimeSlots, getTimeSlot, isSameDay } from "../../utils/calendarUtils";

export default function CalendarDashboard({ setSelectedTask, setIsCreatingTask }) {
  const [viewMode, setViewMode] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const {tasks, setActiveMenu } = useTasks();

  const hours = generateTimeSlots(7, 23);
  const today = new Date();

  const currentTimeSlot = getTimeSlot(
    `${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`
  );

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  /* ---------------- DATE INFO ---------------- */

  const currentDay = currentDate.toLocaleDateString("en-US", { weekday: "long" });
  const currentMonth = currentDate.toLocaleDateString("en-US", { month: "long" });
  const currentYear = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  /* ---------------- TASK ACTIONS ---------------- */

const handleTaskClick = (task) => {
  setSelectedTask(task);
  setIsCreatingTask(false);
  setActiveMenu("upcoming");
};

const handleNewTask = () => {
  setSelectedTask(null);
  setIsCreatingTask(true);
  setActiveMenu("upcoming");
};
  /* ---------------- NAVIGATION ---------------- */

  const handlePrev = () => {
    const date = new Date(currentDate);

    if (viewMode === "month") date.setMonth(date.getMonth() - 1);
    if (viewMode === "week") date.setDate(date.getDate() - 7);
    if (viewMode === "day") date.setDate(date.getDate() - 1);

    setCurrentDate(date);
  };

  const handleNext = () => {
    const date = new Date(currentDate);

    if (viewMode === "month") date.setMonth(date.getMonth() + 1);
    if (viewMode === "week") date.setDate(date.getDate() + 7);
    if (viewMode === "day") date.setDate(date.getDate() + 1);

    setCurrentDate(date);
  };

  /* ---------------- MONTH LOGIC ---------------- */

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthCells = [
    ...Array(adjustedFirstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1)
  ];

  /* ---------------- WEEK LOGIC ---------------- */

  const startOfWeek = new Date(currentDate);
  const dayIndex = currentDate.getDay();
  const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;

  startOfWeek.setDate(currentDate.getDate() - adjustedDayIndex);

  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    return date;
  });

  /* ---------------- CALENDAR EVENTS ---------------- */

  const calendarEvents = tasks
    .filter((task) => task.dueDate)
    .map((task) => {
      const [taskYear, taskMonth, taskDay] = task.dueDate.split("-");

      const date = new Date(
        Number(taskYear),
        Number(taskMonth) - 1,
        Number(taskDay)
      );

      date.setHours(0, 0, 0, 0);

      const color =
        task.priority === "High"
          ? "bg-red-500/30 border-red-400/30"
          : task.priority === "Medium"
          ? "bg-yellow-500/30 border-yellow-400/30"
          : "bg-green-500/30 border-green-400/30";

      return {
        id: task.id,
        title: task.title,
        task,
        date,
        hour: task.dueTime || null,
        slot: getTimeSlot(task.dueTime),
        color
      };
    });

  /* ---------------- RENDER ---------------- */

  return (
    <div className="bg-slate-800/40 border border-slate-600 rounded-2xl p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-slate-100">
          {currentMonth} {currentYear}
        </h2>
      </div>

      {/* TOP BAR */}

      <div className="flex items-start justify-between mb-10">

        <div className="flex flex-col gap-5">

          {/* TABS */}

          <div className="flex items-center bg-slate-700/30 border border-slate-600 rounded-xl p-1 w-fit">
            {["day", "week", "month"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${viewMode === mode ? "bg-slate-200 text-slate-900" : "text-slate-300 hover:bg-slate-600/40"}`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* CURRENT DAY */}

          <p className="text-xs tracking-[0.35em] uppercase text-slate-400 font-semibold">
            {currentDay}
          </p>

        </div>

        {/* ACTIONS */}

        <div className="flex gap-2">

          <button
            onClick={handleNewTask}
            className="px-4 h-11 rounded-xl bg-slate-200 text-slate-900 text-sm font-semibold hover:bg-white transition"
          >
            + Add New Task
          </button>

          <button
            onClick={handlePrev}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-700/40 border border-slate-600 hover:bg-slate-600/50 transition"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={handleNext}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-700/40 border border-slate-600 hover:bg-slate-600/50 transition"
          >
            <ChevronRight size={18} />
          </button>

        </div>

      </div>

      {/* DAY VIEW */}

      {viewMode === "day" && (
        <div className="border border-slate-600 rounded-2xl overflow-hidden">

          {hours.map((hour) => (
            <div key={hour} className={`grid grid-cols-[80px_1fr] min-h-[80px] border-b border-slate-700 ${hour === currentTimeSlot && isSameDay(currentDate, today) ? "bg-blue-500/5" : ""}`}>

              <div className="border-r border-slate-700 flex items-start justify-center pt-4 text-slate-400 text-sm">
                {hour}
              </div>

              <div className="p-3">

                {calendarEvents
                  .filter((event) => event.slot === hour && isSameDay(event.date, currentDate))
                  .map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleTaskClick(event.task)}
                      className={`${event.color} rounded-lg px-2 py-1 text-xs mb-2 cursor-pointer hover:brightness-125 transition`}
                    >
                      <p className="font-medium truncate">{event.title}</p>

                      {event.hour && (
                        <p className="text-[10px] text-slate-300 mt-1">
                          {event.hour}
                        </p>
                      )}
                    </div>
                  ))}

              </div>

            </div>
          ))}

        </div>
      )}

      {/* WEEK VIEW */}

      {viewMode === "week" && (
        <div className="border border-slate-600 rounded-2xl overflow-hidden">

          {/* WEEK HEADER */}

          <div className="sticky top-0 z-20 grid grid-cols-8 border-b border-slate-700 bg-slate-800/95">

            <div className="bg-slate-800/95" />

            {weekDates.map((date, index) => (
              <div
                key={index}
                className={`p-4 text-center border-l border-slate-700 ${isSameDay(date, today) ? "bg-blue-500/10" : ""}`}
              >
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">
                  {weekDays[index]}
                </p>

                <p className={`text-lg font-semibold ${isSameDay(date, today) ? "text-blue-400" : "text-slate-100"}`}>
                  {date.getDate()}
                </p>
              </div>
            ))}

          </div>

          {/* WEEK SCROLL */}

          <div className="max-h-[650px] overflow-y-auto">

            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 min-h-[70px] border-b border-slate-700">

                {/* TIME */}

                <div className="flex items-start justify-center pt-3 text-sm text-slate-400 border-r border-slate-700 bg-slate-800 z-10">
                  {hour}
                </div>

                {/* DAYS */}

                {weekDates.map((date, index) => {

                  const events = calendarEvents.filter(
                    (event) => event.slot === hour && isSameDay(event.date, date)
                  );

                  const isCurrentSlot =
                    isSameDay(date, today) && hour === currentTimeSlot;

                  return (
                    <div
                      key={index}
                      className={`border-l border-slate-700 p-2 relative ${isCurrentSlot ? "bg-blue-500/5" : ""}`}
                    >

                      {events.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => handleTaskClick(event.task)}
                          className={`${event.color} rounded-lg px-2 py-2 text-xs mb-2 border cursor-pointer hover:brightness-125 transition`}
                        >
                          <p className="font-medium truncate">{event.title}</p>

                          {event.hour && (
                            <p className="text-[10px] text-slate-300 mt-1">
                              {event.hour}
                            </p>
                          )}
                        </div>
                      ))}

                    </div>
                  );
                })}

              </div>
            ))}

          </div>
        </div>
      )}

      {/* MONTH VIEW */}

      {viewMode === "month" && (
        <div>

          {/* DAYS HEADER */}

          <div className="grid grid-cols-7 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-slate-300 font-semibold">
                {day}
              </div>
            ))}
          </div>

          {/* MONTH GRID */}

          <div className="grid grid-cols-7 gap-3">

            {monthCells.map((day, index) => {

              const date = day ? new Date(year, month, day) : null;

              const events = date
                ? calendarEvents.filter((event) => isSameDay(event.date, date))
                : [];

              const isToday = date && isSameDay(date, today);

              return (
                <div
                  key={index}
                  className={`min-h-[140px] rounded-2xl border p-3 ${isToday ? "border-blue-400/60 bg-blue-500/10" : day ? "border-slate-600 bg-slate-700/20" : "border-transparent bg-transparent"}`}
                >

                  {day && (
                    <>
                      <p className={`font-semibold mb-3 ${isToday ? "text-blue-400" : "text-slate-100"}`}>
                        {day}
                      </p>

                      <div className="flex flex-col gap-2">

                        {events.map((event) => (
                          <div
                            key={event.id}
                            onClick={() => handleTaskClick(event.task)}
                            className={`${event.color} rounded-lg px-2 py-1 text-xs truncate cursor-pointer hover:brightness-125 transition`}
                          >
                            {event.title}
                          </div>
                        ))}

                      </div>
                    </>
                  )}

                </div>
              );
            })}

          </div>
        </div>
      )}

    </div>
  );
}