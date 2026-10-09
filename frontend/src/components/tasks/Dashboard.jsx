import { useState } from "react";
import { useTasks } from "../../context/TaskContext";

import {
  AlertTriangle,
  Clock3,
  CheckCircle2,
  ListTodo,
  ArrowUpRight,
  Activity,
  CalendarDays,
  X,
  Check,
  Tag,
  RefreshCw,
} from "lucide-react";

export default function Dashboard() {
  const { tasks, updateTask } = useTasks();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [taskToReschedule, setTaskToReschedule] = useState(null);

  /* ==========================
     TASK DATA
  ========================== */

  const activeTasks = tasks.filter((task) => !task.completed);

  const completedTasks = tasks.filter((task) => task.completed);

  const now = new Date();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const overdueTasks = activeTasks.filter((task) => {
    if (!task.dueDate) {
      return false;
    }

    const due = new Date(`${task.dueDate}T${task.dueTime || "23:59"}`);

    return due < now;
  });

  const todayTasks = activeTasks.filter((task) => {
    if (!task.dueDate) {
      return false;
    }

    const due = new Date(`${task.dueDate}T${task.dueTime || "23:59"}`);

    return due >= startOfToday && due <= endOfToday;
  });

  /* ==========================
     PRODUCTIVITY
  ========================== */

  const totalTasks = tasks.length;

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  /* ==========================
     DATE
  ========================== */

  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now);

  /* ==========================
     MODAL DATA
  ========================== */

  const categoryData = {
    active: {
      title: "Active Tasks",
      description: "Tasks that are currently in progress.",
      tasks: activeTasks,
      icon: <ListTodo size={19} />,
      color: "blue",
    },

    today: {
      title: "Today's Tasks",
      description: "Tasks scheduled for today.",
      tasks: todayTasks,
      icon: <Clock3 size={19} />,
      color: "cyan",
    },

    overdue: {
      title: "Overdue Tasks",
      description: "Tasks that require your attention.",
      tasks: overdueTasks,
      icon: <AlertTriangle size={19} />,
      color: "red",
    },

    completed: {
      title: "Completed Tasks",
      description: "Tasks that have already been completed.",
      tasks: completedTasks,
      icon: <CheckCircle2 size={19} />,
      color: "green",
    },
  };

  const selectedData = selectedCategory ? categoryData[selectedCategory] : null;

  function openCategory(category) {
    setSelectedCategory(category);
  }

  function closeCategory() {
    setSelectedCategory(null);
  }

  function openReschedule(task) {
    setTaskToReschedule(task);
  }

  function closeReschedule() {
    setTaskToReschedule(null);
  }

  return (
    <div className="space-y-6">
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="
                w-1.5
                h-1.5
                rounded-full
                bg-cyan-400
                shadow-[0_0_10px_rgba(34,211,238,0.9)]
              "
            />

            <span
              className="
                text-[11px]
                uppercase
                tracking-[0.25em]
                text-cyan-400
                font-semibold
              "
            >
              Overview
            </span>
          </div>

          <p className="text-sm text-slate-400 mt-1">
            Your productivity at a glance.
          </p>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            text-xs
            text-slate-400
          "
        >
          <CalendarDays size={14} className="text-cyan-400" />

          {currentDate}
        </div>
      </div>

      {/* =====================================
          STAT CARDS
      ===================================== */}

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Active"
          value={activeTasks.length}
          icon={<ListTodo size={19} />}
          accent="blue"
          onClick={() => openCategory("active")}
        />

        <StatCard
          title="Today"
          value={todayTasks.length}
          icon={<Clock3 size={19} />}
          accent="cyan"
          onClick={() => openCategory("today")}
        />

        <StatCard
          title="Overdue"
          value={overdueTasks.length}
          icon={<AlertTriangle size={19} />}
          accent="red"
          onClick={() => openCategory("overdue")}
        />

        <StatCard
          title="Completed"
          value={completedTasks.length}
          icon={<CheckCircle2 size={19} />}
          accent="green"
          onClick={() => openCategory("completed")}
        />
      </div>

      {/* =====================================
          MAIN AREA
      ===================================== */}

      <div className="grid grid-cols-[1.1fr_0.9fr] gap-4">
        {/* =================================
            PRODUCTIVITY
        ================================= */}

        <section
          className="
            group
            relative
            overflow-hidden
            rounded-2xl
            border
            border-slate-600
            bg-slate-800/65
            p-6
            transition-all
            duration-300
            hover:border-cyan-400/40
            hover:bg-slate-800/80
            hover:-translate-y-0.5
            hover:shadow-[0_10px_35px_rgba(0,0,0,0.25)]
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              w-48
              h-48
              rounded-full
              bg-cyan-400/5
              blur-3xl
              opacity-60
              group-hover:opacity-100
              transition-opacity
              duration-300
            "
          />

          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Activity
                    size={17}
                    className="
                      text-cyan-400
                      transition-transform
                      duration-300
                      group-hover:scale-110
                    "
                  />

                  <h3 className="font-semibold text-white">Productivity</h3>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  Overall completion
                </p>
              </div>

              <span
                className="
                  text-2xl
                  font-bold
                  text-cyan-400
                  transition-all
                  duration-300
                  group-hover:text-cyan-300
                  group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]
                "
              >
                {completionRate}%
              </span>
            </div>

            {/* PROGRESS */}

            <div className="mt-7">
              <div
                className="
                  h-2.5
                  w-full
                  rounded-full
                  bg-slate-700
                  border
                  border-slate-600/60
                  overflow-hidden
                "
              >
                <div
                  className="
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-blue-500
                    via-cyan-400
                    to-cyan-300
                    transition-all
                    duration-700
                    shadow-[0_0_12px_rgba(34,211,238,0.35)]
                  "
                  style={{
                    width: `${completionRate}%`,
                  }}
                />
              </div>
            </div>

            <div
              className="
                flex
                justify-between
                mt-3
                text-[11px]
                text-slate-400
              "
            >
              <span>{completedTasks.length} completed</span>

              <span>{totalTasks} total</span>
            </div>
          </div>
        </section>

        {/* =================================
            TODAY
        ================================= */}

        <section
          className="
            group
            relative
            overflow-hidden
            rounded-2xl
            border
            border-slate-600
            bg-slate-800/65
            p-6
            transition-all
            duration-300
            hover:border-cyan-400/40
            hover:bg-slate-800/80
            hover:-translate-y-0.5
            hover:shadow-[0_10px_35px_rgba(0,0,0,0.25)]
          "
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Clock3
                  size={17}
                  className="
                    text-cyan-400
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  "
                />

                <h3 className="font-semibold text-white">Today's Tasks</h3>
              </div>

              <p className="text-xs text-slate-400 mt-1">
                Tasks scheduled for today
              </p>
            </div>

            <span
              className="
                min-w-7
                h-7
                px-2
                flex
                items-center
                justify-center
                rounded-lg
                bg-slate-700
                border
                border-slate-600
                text-xs
                font-semibold
                text-slate-200
              "
            >
              {todayTasks.length}
            </span>
          </div>

          {todayTasks.length === 0 ? (
            <div
              className="
                h-24
                flex
                items-center
                justify-center
                rounded-xl
                border
                border-dashed
                border-slate-700
                bg-slate-900/20
                text-xs
                text-slate-500
              "
            >
              No tasks scheduled for today.
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.slice(0, 4).map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* =====================================
          OVERDUE
      ===================================== */}

      {overdueTasks.length > 0 && (
        <section
          className="
            group
            rounded-2xl
            border
            border-red-400/30
            bg-slate-800/65
            overflow-hidden
            transition-all
            duration-300
            hover:border-red-400/50
            hover:bg-slate-800/80
            hover:shadow-[0_10px_30px_rgba(248,113,113,0.08)]
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              px-6
              py-4
              border-b
              border-red-400/20
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  items-center
                  justify-center
                  w-8
                  h-8
                  rounded-lg
                  bg-red-400/10
                  border
                  border-red-400/20
                "
              >
                <AlertTriangle size={17} className="text-red-400" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">
                  Overdue Tasks
                </h3>

                <p className="text-xs text-slate-400">
                  Requires your attention
                </p>
              </div>
            </div>

            <span
              className="
                text-xs
                font-semibold
                text-red-300
                bg-red-400/10
                border
                border-red-400/20
                px-2.5
                py-1
                rounded-full
              "
            >
              {overdueTasks.length}
            </span>
          </div>

          <div className="divide-y divide-slate-700/60">
            {overdueTasks.slice(0, 3).map((task) => (
              <OverdueItem
                key={task.id}
                task={task}
                onReschedule={openReschedule}
              />
            ))}
          </div>
        </section>
      )}

      {/* =====================================
          TASKS MODAL
      ===================================== */}

      {selectedData && (
        <TaskListModal
          data={selectedData}
          onClose={closeCategory}
          onReschedule={openReschedule}
        />
      )}

      {taskToReschedule && (
        <RescheduleModal
          task={taskToReschedule}
          onClose={closeReschedule}
          onSave={(newDueDate, newDueTime) => {
            updateTask({
              ...taskToReschedule,
              dueDate: newDueDate,
              dueTime: newDueTime,
            });

            closeReschedule();
          }}
        />
      )}
    </div>
  );
}

/* ==================================================
   STAT CARD
================================================== */

function StatCard({ title, value, icon, accent, onClick }) {
  const accents = {
    blue: {
      icon: "text-blue-400",
      border: "hover:border-blue-400/50",
      glow: "group-hover:bg-blue-400/10",
      shadow: "group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)]",
    },

    cyan: {
      icon: "text-cyan-400",
      border: "hover:border-cyan-400/50",
      glow: "group-hover:bg-cyan-400/10",
      shadow: "group-hover:shadow-[0_8px_30px_rgba(34,211,238,0.12)]",
    },

    red: {
      icon: "text-red-400",
      border: "hover:border-red-400/50",
      glow: "group-hover:bg-red-400/10",
      shadow: "group-hover:shadow-[0_8px_30px_rgba(248,113,113,0.12)]",
    },

    green: {
      icon: "text-emerald-400",
      border: "hover:border-emerald-400/50",
      glow: "group-hover:bg-emerald-400/10",
      shadow: "group-hover:shadow-[0_8px_30px_rgba(52,211,153,0.12)]",
    },
  };

  const style = accents[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        overflow-hidden
        rounded-xl
        border
        border-slate-600
        bg-slate-800/65
        px-5
        py-4
        text-left
        cursor-pointer
        transition-all
        duration-300
        hover:-translate-y-1
        hover:bg-slate-800/90
        active:translate-y-0
        ${style.border}
        ${style.shadow}
        focus:outline-none
        focus:ring-2
        focus:ring-cyan-400/30
      `}
    >
      {/* Accent glow */}

      <div
        className={`
          pointer-events-none
          absolute
          -right-8
          -top-8
          w-24
          h-24
          rounded-full
          blur-2xl
          opacity-0
          transition-opacity
          duration-300
          ${style.glow}
          group-hover:opacity-100
        `}
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <span
            className={`
              ${style.icon}
              transition-all
              duration-300
              group-hover:scale-110
            `}
          >
            {icon}
          </span>

          <ArrowUpRight
            size={15}
            className="
              text-slate-600
              opacity-0
              translate-x-1
              -translate-y-1
              transition-all
              duration-300
              group-hover:opacity-100
              group-hover:text-slate-300
              group-hover:translate-x-0
              group-hover:translate-y-0
            "
          />
        </div>

        <div className="mt-4">
          <p
            className="
              text-xs
              font-medium
              text-slate-400
              transition-colors
              duration-300
              group-hover:text-slate-300
            "
          >
            {title}
          </p>

          <span
            className="
              block
              text-3xl
              font-bold
              text-white
              mt-1
              transition-all
              duration-300
              group-hover:translate-x-0.5
            "
          >
            {value}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ==================================================
   TASK LIST MODAL
================================================== */

function TaskListModal({ data, onClose, onReschedule }) {
  const colorStyles = {
    blue: {
      icon: "text-blue-400",
      iconBg: "bg-blue-400/10",
      border: "border-blue-400/20",
      badge: "bg-blue-400/10 text-blue-300 border-blue-400/20",
    },

    cyan: {
      icon: "text-cyan-400",
      iconBg: "bg-cyan-400/10",
      border: "border-cyan-400/20",
      badge: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
    },

    red: {
      icon: "text-red-400",
      iconBg: "bg-red-400/10",
      border: "border-red-400/20",
      badge: "bg-red-400/10 text-red-300 border-red-400/20",
    },

    green: {
      icon: "text-emerald-400",
      iconBg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
      badge: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    },
  };

  const style = colorStyles[data.color];

  function formatDate(date) {
    if (!date) {
      return null;
    }

    const parts = date.split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/65
        backdrop-blur-sm
        p-6
        animate-in
        fade-in
        duration-200
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-2xl
          max-h-[75vh]
          overflow-hidden
          rounded-2xl
          border
          border-slate-600
          bg-slate-900
          shadow-[0_25px_80px_rgba(0,0,0,0.55)]
          animate-in
          zoom-in-95
          duration-200
        "
      >
        {/* ==========================
            MODAL HEADER
        ========================== */}

        <div
          className="
            flex
            items-center
            justify-between
            px-6
            py-5
            border-b
            border-slate-700
          "
        >
          <div className="flex items-center gap-3">
            <div
              className={`
                w-9
                h-9
                rounded-lg
                flex
                items-center
                justify-center
                border
                ${style.iconBg}
                ${style.border}
                ${style.icon}
              `}
            >
              {data.icon}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">
                  {data.title}
                </h2>

                <span
                  className={`
                    px-2
                    py-0.5
                    rounded-md
                    border
                    text-[11px]
                    font-semibold
                    ${style.badge}
                  `}
                >
                  {data.tasks.length}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-0.5">
                {data.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              w-8
              h-8
              flex
              items-center
              justify-center
              rounded-lg
              text-slate-400
              hover:text-white
              hover:bg-slate-800
              transition
            "
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ==========================
            TASKS
        ========================== */}

        <div className="overflow-y-auto max-h-[calc(75vh-90px)] p-5">
          {data.tasks.length === 0 ? (
            <div
              className="
                min-h-48
                flex
                flex-col
                items-center
                justify-center
                rounded-xl
                border
                border-dashed
                border-slate-700
                bg-slate-800/30
                text-center
              "
            >
              <div
                className={`
                  w-11
                  h-11
                  rounded-full
                  flex
                  items-center
                  justify-center
                  mb-3
                  ${style.iconBg}
                  ${style.icon}
                `}
              >
                {data.icon}
              </div>

              <p className="text-sm font-medium text-slate-300">
                No tasks here
              </p>

              <p className="text-xs text-slate-500 mt-1">
                There are no tasks in this category yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.tasks.map((task) => (
                <div
                  key={task.id}
                  className="
                    group
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-800/60
                    p-4
                    transition-all
                    duration-200
                    hover:bg-slate-800
                    hover:border-slate-600
                    hover:-translate-y-0.5
                  "
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`
                          mt-0.5
                          w-7
                          h-7
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          shrink-0
                          ${
                            task.completed
                              ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                              : `${style.iconBg} ${style.icon}`
                          }
                        `}
                      >
                        {task.completed ? <Check size={15} /> : data.icon}
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`
                            text-sm
                            font-medium
                            truncate
                            ${
                              task.completed
                                ? "text-slate-400 line-through"
                                : "text-white"
                            }
                          `}
                        >
                          {task.title}
                        </p>

                        {/* DATE / TIME */}

                        {(task.dueDate || task.dueTime) && (
                          <div
                            className="
                              flex
                              items-center
                              gap-3
                              mt-1.5
                              text-[11px]
                              text-slate-500
                            "
                          >
                            {task.dueDate && (
                              <span>{formatDate(task.dueDate)}</span>
                            )}

                            {task.dueTime && <span>{task.dueTime}</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* LIST */}

                    {task.list && (
                      <span
                        className="
                          shrink-0
                          text-[10px]
                          text-slate-400
                          bg-slate-700/70
                          border
                          border-slate-600
                          px-2
                          py-1
                          rounded-md
                        "
                      >
                        {task.list}
                      </span>
                    )}

                    {data.title === "Overdue Tasks" && (
                      <button
                        type="button"
                        onClick={() => onReschedule(task)}
                        className="
                          flex
                          items-center
                          gap-2
                          px-3
                          py-2
                          rounded-lg
                          bg-cyan-400/10
                          border
                          border-cyan-400/30
                          text-cyan-400
                          text-[11px]
                          font-semibold
                          transition-all
                          duration-200
                          hover:bg-cyan-400/20
                          hover:border-cyan-400/60
                          hover:text-cyan-300
                          hover:shadow-[0_0_18px_rgba(34,211,238,0.18)]
                          active:scale-95
                        "
                      >
                        <RefreshCw
                          size={14}
                          className="transition-transform duration-500 hover:rotate-180"
                        />
                        Reagendar
                      </button>
                    )}
                  </div>

                  {/* TAGS */}

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 ml-10">
                      {task.tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="
                            inline-flex
                            items-center
                            gap-1
                            px-2
                            py-1
                            rounded-md
                            bg-slate-700/70
                            border
                            border-slate-600
                            text-[10px]
                            text-slate-400
                          "
                        >
                          <Tag size={10} />

                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==================================================
   TODAY ITEM
================================================== */

function TaskItem({ task }) {
  return (
    <div
      className="
        group/item
        flex
        items-center
        justify-between
        rounded-lg
        bg-slate-900/50
        border
        border-slate-700
        px-3
        py-2.5
        transition-all
        duration-200
        hover:bg-slate-700/50
        hover:border-slate-600
      "
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="
            w-1.5
            h-1.5
            rounded-full
            bg-cyan-400
            shadow-[0_0_7px_rgba(34,211,238,0.6)]
            shrink-0
          "
        />

        <span
          className="
            text-sm
            text-slate-300
            truncate
            transition-colors
            group-hover/item:text-white
          "
        >
          {task.title}
        </span>
      </div>

      <span
        className="
          text-[11px]
          text-slate-400
          ml-3
          shrink-0
        "
      >
        {task.dueTime || "--:--"}
      </span>
    </div>
  );
}

/* ==================================================
   OVERDUE ITEM
================================================== */

function OverdueItem({ task, onReschedule }) {
  return (
    <div
      className="
        group/item
        flex
        items-center
        justify-between
        px-6
        py-3.5
        transition-all
        duration-200
        hover:bg-red-400/[0.05]
      "
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="
            w-1.5
            h-1.5
            rounded-full
            bg-red-400
            shadow-[0_0_7px_rgba(248,113,113,0.7)]
            shrink-0
          "
        />

        <span
          className="
            text-sm
            text-slate-300
            truncate
            transition-colors
            duration-200
            group-hover/item:text-white
          "
        >
          {task.title}
        </span>
      </div>

      <div className="flex items-start gap-4 shrink-0 ml-3">
        <button
          type="button"
          onClick={() => onReschedule(task)}
          title="Reagendar"
          className="
      group/reschedule
      flex
      items-center
      gap-2
      px-3
      py-2
      rounded-lg
      bg-cyan-400/10
      border
      border-cyan-400/30
      text-cyan-400
      shadow-[0_0_12px_rgba(34,211,238,0.08)]
      transition-all
      duration-200
      hover:bg-cyan-400/20
      hover:border-cyan-400/60
      hover:text-cyan-300
      hover:shadow-[0_0_18px_rgba(34,211,238,0.18)]
      active:scale-95
    "
        >
          <RefreshCw
            size={15}
            className="
        transition-transform
        duration-500
        group-hover/reschedule:rotate-180
      "
          />

          <span className="text-[11px] font-semibold">Reagendar</span>
        </button>

        <span
          className="
      text-[11px]
      text-red-400
      pt-1
    "
        >
          {task.dueDate}
        </span>
      </div>
    </div>
  );
}

function RescheduleModal({ task, onClose, onSave }) {
  const today = new Date();

  const formattedToday = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [dueDate, setDueDate] = useState(formattedToday);

  const [dueTime, setDueTime] = useState(task.dueTime || "");

  function handleSubmit() {
    if (!dueDate || !dueTime) {
      return;
    }

    onSave(dueDate, dueTime);
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/65
        backdrop-blur-sm
        p-6
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-slate-600
          bg-slate-900
          shadow-[0_25px_80px_rgba(0,0,0,0.55)]
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            px-6
            py-5
            border-b
            border-slate-700
          "
        >
          <h2 className="text-lg font-semibold text-white">Reagendar Task</h2>

          <button
            type="button"
            onClick={onClose}
            className="
              w-8
              h-8
              flex
              items-center
              justify-center
              rounded-lg
              text-slate-400
              hover:text-white
              hover:bg-slate-800
              transition
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}

        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-400">
            Selecione a nova data e horário para esta task.
          </p>

          {/* DATA */}

          <div>
            <label
              className="
                block
                text-xs
                uppercase
                tracking-wider
                text-slate-400
                mb-2
                font-semibold
              "
            >
              Nova data
            </label>

            <input
              type="date"
              min={formattedToday}
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="
                w-full
                bg-slate-800
                border
                border-slate-700
                rounded-xl
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
              "
            />
          </div>

          {/* HORÁRIO */}

          <div>
            <label
              className="
                block
                text-xs
                uppercase
                tracking-wider
                text-slate-400
                mb-2
                font-semibold
              "
            >
              Novo horário
            </label>

            <input
              type="time"
              value={dueTime}
              onChange={(event) => setDueTime(event.target.value)}
              className="
                w-full
                bg-slate-800
                border
                border-slate-700
                rounded-xl
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
              "
            />
          </div>

          {/* ACTIONS */}

          <div
            className="
              flex
              justify-end
              gap-3
              pt-4
              border-t
              border-slate-700
            "
          >
            <button
              type="button"
              onClick={onClose}
              className="
                px-5
                py-2.5
                rounded-xl
                bg-slate-700
                text-slate-200
                hover:bg-slate-600
                transition
              "
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={!dueDate || !dueTime}
              onClick={handleSubmit}
              className="
                px-5
                py-2.5
                rounded-xl
                bg-blue-600
                text-white
                hover:bg-blue-700
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition
              "
            >
              Reagendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
