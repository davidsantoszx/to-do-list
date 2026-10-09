import { useTasks } from "../../context/TaskContext";
import {
  CalendarDays,
  Clock,
  Check,
  AlertTriangle,
  RefreshCw,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import RescheduleModal from "./RescheduleModal";
import Modal from "../layout/Modal";

export default function TaskItem({
  task,
  onSelectTask,
  setIsCreatingTask,
  selected,
  onToggleSelect
}) {

  const { lists, updateTask, deleteTask } = useTasks();

  const currentList = lists.find(
    listItem => listItem.id === task.list
  );

  const [currentTime, setCurrentTime] = useState(
    new Date()
  );

  const [showRescheduleModal, setShowRescheduleModal] =
  useState(false);

  const [contextMenu, setContextMenu] = useState(null);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);


  /* ==========================
     ATUALIZA O TEMPO
  ========================== */

  useEffect(() => {

    const interval = setInterval(() => {

      setCurrentTime(new Date());

    }, 60000);

    return () => clearInterval(interval);

  }, []);

  useEffect(() => {
  function handleOtherTaskContextMenu(e) {
    if (e.detail !== task.id) {
      setContextMenu(null);
    }
  }

  window.addEventListener(
    "task-context-menu",
    handleOtherTaskContextMenu
  );

  return () => {
    window.removeEventListener(
      "task-context-menu",
      handleOtherTaskContextMenu
    );
  };
}, [task.id]);

  function handleOpenReschedule(e) {
  e.stopPropagation();

  setShowRescheduleModal(true);
}

function handleCloseReschedule() {
  setShowRescheduleModal(false);
}

function handleReschedule(updatedTask) {
  updateTask(updatedTask);

  setShowRescheduleModal(false);
}

/* ==========================
   MENU DE CONTEXTO
========================== */

function handleContextMenu(e) {
  e.preventDefault();
  e.stopPropagation();

  window.dispatchEvent(
    new CustomEvent("task-context-menu", {
      detail: task.id
    })
  );

  setContextMenu({
    x: e.clientX,
    y: e.clientY
  });
}

/* ==========================
   EXCLUIR TASK
========================== */

function handleOpenDeleteModal() {
  setContextMenu(null);
  setShowDeleteModal(true);
}

function handleCloseDeleteModal() {
  setShowDeleteModal(false);
}

function handleDeleteTask() {
  deleteTask(task.id);
  setShowDeleteModal(false);
}

useEffect(() => {
  function handleClickOutside() {
    setContextMenu(null);
  }

  document.addEventListener(
    "click",
    handleClickOutside
  );

  return () => {
    document.removeEventListener(
      "click",
      handleClickOutside
    );
  };
}, []);

  /* ==========================
     PRIORIDADE
  ========================== */

  const priorityColor = {
    Low: "bg-green-500",
    Medium: "bg-yellow-500",
    High: "bg-red-500"
  };


  /* ==========================
     FORMATA DATA
  ========================== */

  function formatDate(date) {

    if (!date) return "";

    const [year, month, day] =
      date.split("-");

    return `${day}-${month}-${year.slice(-2)}`;

  }


  /* ==========================
     PRAZO DA TASK
  ========================== */

  function getDueDateTime() {

    if (!task.dueDate) {
      return null;
    }

    return new Date(
      `${task.dueDate}T${task.dueTime || "23:59"}`
    );

  }


  const dueDateTime = getDueDateTime();


  /* ==========================
     STATUS DO PRAZO
  ========================== */

  let deadlineStatus = "normal";

  let remainingMinutes = null;


  if (
    dueDateTime &&
    !task.completed
  ) {

    const difference =
      dueDateTime.getTime() -
      currentTime.getTime();

    remainingMinutes =
      Math.floor(
        difference / (1000 * 60)
      );


    if (difference <= 0) {

      deadlineStatus = "overdue";

    } else if (remainingMinutes <= 30) {

      deadlineStatus = "critical";

    } else if (remainingMinutes <= 180) {

      deadlineStatus = "warning";

    }

  }


  /* ==========================
     TEMPO RESTANTE
  ========================== */

  function formatRemainingTime(minutes) {

    if (minutes === null) {
      return "";
    }


    if (minutes <= 0) {

      const overdueMinutes =
        Math.abs(minutes);

      if (overdueMinutes < 60) {

        return `Expirada há ${overdueMinutes} min`;

      }


      const hours =
        Math.floor(
          overdueMinutes / 60
        );

      const remaining =
        overdueMinutes % 60;


      if (remaining === 0) {

        return `Expirada há ${hours}h`;

      }

      return `Expirada há ${hours}h ${remaining}m`;

    }


    const hours =
      Math.floor(minutes / 60);

    const remaining =
      minutes % 60;


    if (hours > 0) {

      if (remaining === 0) {

        return `${hours}h restantes`;

      }

      return `${hours}h ${remaining}m restantes`;

    }


    return `${minutes} min restantes`;

  }


  /* ==========================
     ESTILO DO PRAZO
  ========================== */

  const deadlineStyles = {

    normal: {
      text: "text-slate-400",
      border: "",
      icon: "text-slate-400"
    },

    warning: {
      text: "text-yellow-400",
      border: "border-l-2 border-l-yellow-400/70",
      icon: "text-yellow-400"
    },

    critical: {
      text: "text-red-400",
      border: "border-l-2 border-l-red-400",
      icon: "text-red-400"
    },

    overdue: {
      text: "text-red-400",
      border: "border-l-2 border-l-red-500",
      icon: "text-red-400"
    }
  };


  const deadlineStyle =
    deadlineStyles[deadlineStatus];


  return (
    <>
    <div
      onContextMenu={handleContextMenu}
      className={`
        bg-slate-800
        rounded-xl
        p-5
        border
        border-slate-600
        flex
        items-center
        gap-4
        hover:border-blue-500
        hover:-translate-y-1
        duration-200
        shadow-lg
        hover:bg-slate-700/60
        transition
        cursor-pointer

        ${deadlineStyle.border}

        ${selected
          ? "border-blue-500 bg-slate-700/60"
          : ""
        }

        ${
          deadlineStatus === "overdue"
            ? "hover:border-red-400/70"
            : ""
        }

        ${
          deadlineStatus === "critical"
            ? "hover:border-orange-400/60"
            : ""
        }

        ${
          deadlineStatus === "warning"
            ? "hover:border-yellow-400/50"
            : ""
        }
      `}
    >

      {/* CHECKBOX */}

      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => {

          e.stopPropagation();

          onToggleSelect?.(task.id);

        }}
        onClick={(e) =>
          e.stopPropagation()
        }
        className="
          w-4
          h-4
          shrink-0
          accent-blue-500
          cursor-pointer
        "
      />


      {/* CONTEÚDO */}

      <div
        className="flex-1"
        onClick={() => {

          setIsCreatingTask?.(false);

          onSelectTask?.(task);

        }}
      >

        <div className="flex items-center gap-2">

          <h3 className="font-semibold text-white">
            {task.title}
          </h3>


          {/* ALERTA DE PRAZO */}

          {!task.completed &&
            deadlineStatus !== "normal" && (

              <span
                className={`
                  flex
                  items-center
                  gap-1
                  text-[11px]
                  font-medium
                  ${deadlineStyle.text}
                `}
              >

                <AlertTriangle
                  size={12}
                  strokeWidth={2}
                  className={`
                    ${deadlineStyle.icon}
                  `}
                />

                {formatRemainingTime(
                  remainingMinutes
                )}

              </span>

            )}

        </div>


        <div
          className="
            flex
            items-center
            gap-3
            mt-2
            text-xs
          "
        >

          {/* PRIORIDADE */}

          <span
            className={`
              ${priorityColor[task.priority]}
              px-2
              py-1
              rounded
              text-slate-900
              font-medium
            `}
          >
            {task.priority}
          </span>


          {/* DATA */}

          {task.dueDate && (

            <span
              className={`
                flex
                items-center
                gap-1
                ${deadlineStyle.text}
              `}
            >

              <CalendarDays
                size={13}
                strokeWidth={2}
              />

              {formatDate(task.dueDate)}

            </span>

          )}


          {/* HORÁRIO */}

          {task.dueTime && (

            <span
              className={`
                flex
                items-center
                gap-1
                ${deadlineStyle.text}
              `}
            >

              <Clock
                size={13}
                strokeWidth={2}
              />

              {task.dueTime}

            </span>

          )}


          {/* LISTA */}

          <span
            className="
              flex
              items-center
              gap-1.5
              text-slate-300
            "
          >

            <span
              className={`
                w-2.5
                h-2.5
                rounded-full
                ${currentList?.color || "bg-slate-500"}
              `}
            />

            {currentList?.label || "No List"}

          </span>

        </div>

      </div>



      {/* REAGENDAR */}

        {deadlineStatus === "overdue" && !task.completed && (
  <button
    type="button"
    onClick={handleOpenReschedule}
    className="
      flex
      items-center
      gap-2
      px-3
      py-2
      rounded-lg
      text-xs
      font-medium
      text-cyan-400
      bg-cyan-500/10
      border
      border-cyan-400/50
      hover:bg-cyan-500/20
      hover:border-cyan-400
      hover:text-cyan-300
      transition
      duration-200
      shrink-0
      group
    "
  >
    <RefreshCw
      size={14}
      strokeWidth={2}
      className="
        transition-transform
        duration-500
        group-hover:rotate-180
      "
    />

    Reagendar
  </button>
)}

      {/* STATUS */}

      <span
        onClick={(e) =>
          e.stopPropagation()
        }
        className={`
          flex
          items-center
          justify-center
          w-6
          h-6
          rounded-full
          transition
          ${
            task.completed
              ? "text-green-400"
              : "text-slate-500"
          }
        `}
      >

        {task.completed ? (

          <Check
            size={18}
            strokeWidth={2.5}
          />

        ) : (

          <span className="text-lg leading-none">
            ›
          </span>

        )}

      </span>

    </div>

    {contextMenu && (
      <div
        className="
          fixed
          z-50
          min-w-[150px]
          bg-slate-800
          border
          border-slate-600
          rounded-lg
          shadow-2xl
          p-1
        "
        style={{
          left: contextMenu.x,
          top: contextMenu.y
        }}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <button
          type="button"
          onClick={handleOpenDeleteModal}
          className="
            w-full
            flex
            items-center
            gap-2
            px-3
            py-2
            rounded-md
            text-sm
            text-red-400
            hover:bg-red-500/10
            hover:text-red-300
            transition
          "
        >
          <Trash2 size={15} />

          Excluir
        </button>
      </div>
    )}

      {showRescheduleModal && (
      <RescheduleModal
        task={task}
        onClose={handleCloseReschedule}
        onSave={handleReschedule}
      />
    )}

    {showDeleteModal && (
      <Modal
        title="Excluir tarefa"
        message={`Deseja realmente excluir a tarefa "${task.title}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteTask}
        onCancel={handleCloseDeleteModal}
      />
    )}

  </>
  );
}