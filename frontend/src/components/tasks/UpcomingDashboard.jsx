import { useTasks } from "../../context/TaskContext";
import TodayView from "./TodayView";
import { getTaskSection } from "../../utils/taskUtils";

export default function UpcomingDashboard({
  selectedTask,
  setSelectedTask,
  isCreatingTask,
  setIsCreatingTask,
  setCreationMode,
  tagFilter,
}) {
  const { tasks } = useTasks();

  /* ==========================
     ORDENAÇÃO DAS TASKS
  ========================== */

  function sortTasksByExpiration(taskList) {
    return [...taskList].sort((a, b) => {
      /* ==========================
         DATA
      ========================== */

      if (!a.dueDate && !b.dueDate) {
        return 0;
      }

      if (!a.dueDate) {
        return 1;
      }

      if (!b.dueDate) {
        return -1;
      }

      /* ==========================
         DATA + HORÁRIO
      ========================== */

      const dateTimeA = new Date(`${a.dueDate}T${a.dueTime || "23:59"}`);

      const dateTimeB = new Date(`${b.dueDate}T${b.dueTime || "23:59"}`);

      return dateTimeA - dateTimeB;
    });
  }

  /* ==========================
     FILTRO POR TAG
  ========================== */

  const filteredTasks = tagFilter
    ? tasks.filter(
        (task) =>
          Array.isArray(task.tags) &&
          task.tags.some(
            (tag) => tag.toLowerCase() === tagFilter.toLowerCase(),
          ),
      )
    : tasks;

  /* ==========================
     TODAY
  ========================== */

  const todayTasks = sortTasksByExpiration(
    filteredTasks.filter((task) => getTaskSection(task) === "today"),
  );

  /* ==========================
     TOMORROW
  ========================== */

  const tomorrowTasks = sortTasksByExpiration(
    filteredTasks.filter((task) => getTaskSection(task) === "tomorrow"),
  );

  /* ==========================
     THIS WEEK
  ========================== */

  const weekTasks = sortTasksByExpiration(
    filteredTasks.filter((task) => getTaskSection(task) === "week"),
  );

  /* ==========================
     SELECIONAR TASK
  ========================== */

  function handleSelectTask(task) {
    setIsCreatingTask(false);
    setSelectedTask(task);
  }

  return (
    <div className="space-y-6">
      {/* ==========================
          TODAY
      ========================== */}

      <TodayView
        title="Today"
        tasks={todayTasks}
        onSelectTask={handleSelectTask}
        setSelectedTask={setSelectedTask}
        setIsCreatingTask={setIsCreatingTask}
        setCreationMode={setCreationMode}
      />

      {/* ==========================
          TOMORROW + THIS WEEK
      ========================== */}

      <div className="grid grid-cols-2 gap-6">
        <TodayView
          title="Tomorrow"
          tasks={tomorrowTasks}
          onSelectTask={handleSelectTask}
          setSelectedTask={setSelectedTask}
          setIsCreatingTask={setIsCreatingTask}
          setCreationMode={setCreationMode}
        />

        <TodayView
          title="This Week"
          tasks={weekTasks}
          onSelectTask={handleSelectTask}
          setSelectedTask={setSelectedTask}
          setIsCreatingTask={setIsCreatingTask}
          setCreationMode={setCreationMode}
        />
      </div>
    </div>
  );
}
