import { useState } from "react";
import { useTasks } from "../../context/TaskContext";
import TaskItem from "./TaskItem";
import Modal from "../layout/Modal";
import { Check, Trash2, ListChecks } from "lucide-react";

export default function PriorityDashboard({
  priority,
  setSelectedTask,
  setIsCreatingTask,
  setCreationMode
}) {

  const {
    tasks,
    updateTask,
    deleteTask
  } = useTasks();

  const [selectedIds, setSelectedIds] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* ==========================
     TASKS DA PRIORIDADE
  ========================== */

  const priorityTasks = tasks.filter(
    task => task.priority === priority
  );


  /* ==========================
     SELECIONAR TASK
  ========================== */

  function handleSelectTask(task) {

    setIsCreatingTask(false);

    setSelectedTask(task);

  }


  /* ==========================
     SELECIONAR / DESMARCAR
  ========================== */

  function handleToggleSelect(id) {

    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(taskId => taskId !== id)
        : [...prev, id]
    );

  }


  /* ==========================
     SELECIONAR TODAS
  ========================== */

  function handleSelectAll() {

    if (
      selectedIds.length === priorityTasks.length
    ) {

      setSelectedIds([]);

      return;

    }

    setSelectedIds(
      priorityTasks.map(task => task.id)
    );

  }


  /* ==========================
     CONCLUIR SELECIONADAS
  ========================== */

  function handleCompleteSelected() {

    priorityTasks
      .filter(task =>
        selectedIds.includes(task.id)
      )
      .forEach(task => {

        updateTask({
          ...task,
          completed: true
        });

      });

    setSelectedIds([]);

  }


  /* ==========================
     EXCLUIR SELECIONADAS
  ========================== */
function handleDeleteSelected() {
  setShowDeleteModal(true);
}

function handleCloseDeleteModal() {
  setShowDeleteModal(false);
}

function handleConfirmDeleteSelected() {
  selectedIds.forEach(id => {
    deleteTask(id);
  });

  setSelectedIds([]);
  setShowDeleteModal(false);
}


  /* ==========================
     NOVA TASK
  ========================== */

function handleCreateTask() {

  setCreationMode("priority");

  setSelectedTask(null);

  setIsCreatingTask(true);
}


  const hasSelection =
    selectedIds.length > 0;


  const allSelected =
    priorityTasks.length > 0 &&
    selectedIds.length === priorityTasks.length;


  /* ==========================
     COR DA PRIORIDADE
  ========================== */

  const priorityConfig = {

    Low: {
      color: "text-green-400",
      dot: "bg-green-400",
      border: "border-green-400/30"
    },

    Medium: {
      color: "text-yellow-400",
      dot: "bg-yellow-400",
      border: "border-yellow-400/30"
    },

    High: {
      color: "text-red-400",
      dot: "bg-red-400",
      border: "border-red-400/30"
    }

  };


  const config =
    priorityConfig[priority];


  return (

    <div
      className="
        bg-slate-800/40
        border
        border-slate-600
        rounded-xl
        overflow-hidden
      "
    >

      {/* ==========================
          HEADER
      ========================== */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-slate-700
          p-4
        "
      >

        <div className="flex items-center gap-3">

          <span
            className={`
              w-3
              h-3
              rounded-full
              ${config.dot}
            `}
          />

          <h2
            className={`
              text-xl
              font-semibold
              ${config.color}
            `}
          >
            {priority}
          </h2>

          <span
            className="
              text-xs
              bg-slate-700
              border
              border-slate-600
              px-2
              py-1
              rounded
              text-slate-300
            "
          >
            {priorityTasks.length}
          </span>

        </div>


        {/* AÇÕES */}

        {hasSelection && (

          <div className="flex items-center gap-2">

            <button
              onClick={handleSelectAll}
              className="
                flex
                items-center
                gap-2
                px-3
                py-2
                rounded-lg
                bg-slate-700
                hover:bg-slate-600
                transition
                text-sm
              "
            >

              <ListChecks size={16} />

              {allSelected
                ? "Desmarcar todas"
                : "Selecionar todas"
              }

            </button>


            <button
              onClick={handleCompleteSelected}
              className="
                flex
                items-center
                gap-2
                px-3
                py-2
                rounded-lg
                bg-green-600
                hover:bg-green-700
                transition
                text-sm
              "
            >

              <Check size={16} />

              Concluir

            </button>


            <button
              onClick={handleDeleteSelected}
              className="
                flex
                items-center
                gap-2
                px-3
                py-2
                rounded-lg
                bg-red-600
                hover:bg-red-700
                transition
                text-sm
              "
            >

              <Trash2 size={16} />

              Excluir

            </button>

          </div>

        )}

      </div>


      {/* ==========================
          NOVA TASK
      ========================== */}

      <button
        onClick={handleCreateTask}
        className="
          mx-4
          mt-4
          w-[calc(100%-2rem)]
          text-left
          bg-slate-700/30
          border
          border-slate-600
          rounded-lg
          p-3
          hover:bg-slate-700/50
          transition
        "
      >

        + Add New Task

      </button>


      {/* ==========================
          TASKS
      ========================== */}

      <div className="flex flex-col gap-3 p-4">

        {priorityTasks.length > 0 ? (

          priorityTasks.map(task => (

            <TaskItem
              key={task.id}
              task={task}

              onSelectTask={
                handleSelectTask
              }

              selected={
                selectedIds.includes(task.id)
              }

              onToggleSelect={
                handleToggleSelect
              }

            />

          ))

        ) : (

          <div
            className="
              py-10
              text-center
              text-slate-500
              text-sm
            "
          >

            Nenhuma task com prioridade{" "}
            <span className={config.color}>
              {priority}
            </span>
            .

          </div>

        )}

      </div>


      {showDeleteModal && (
  <Modal
    title="Excluir tarefas"
    message={`Deseja realmente excluir ${selectedIds.length} tarefa(s) selecionada(s)?`}
    confirmText="Excluir"
    cancelText="Cancelar"
    onConfirm={handleConfirmDeleteSelected}
    onCancel={handleCloseDeleteModal}
  />
)}

    </div>

  );

}