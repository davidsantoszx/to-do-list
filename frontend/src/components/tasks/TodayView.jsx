import { useState } from "react";
import { useTasks } from "../../context/TaskContext";
import TaskItem from "./TaskItem";
import Modal from "../layout/Modal";
import { Check, Trash2, ListChecks } from "lucide-react";


export default function TodayView({
  title,
  tasks,
  onSelectTask,
  isCreatingTask,
  setIsCreatingTask,
  setSelectedTask,
  setCreationMode
}) {

  const {
    updateTask,
    deleteTask
  } = useTasks();

  const [selectedIds, setSelectedIds] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  function handleToggleSelect(id) {

    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(taskId => taskId !== id)
        : [...prev, id]
    );

  }

  function handleSelectAll() {

    if (selectedIds.length === tasks.length) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(tasks.map(task => task.id));

  }

  function handleCompleteSelected() {

    tasks
      .filter(task => selectedIds.includes(task.id))
      .forEach(task => {

        updateTask({
          ...task,
          completed: true
        });

      });

    setSelectedIds([]);

  }

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

  function handleCreateTask() {

    let mode = "default";

    if (title === "Today") {
      mode = "today";
    }

    if (title === "Tomorrow") {
      mode = "tomorrow";
    }

    if (title === "This Week") {
      mode = "week";
    }

    setCreationMode(mode);
    setSelectedTask(null);
    setIsCreatingTask(true);

  }

  const hasSelection = selectedIds.length > 0;

  const allSelected =
    tasks.length > 0 &&
    selectedIds.length === tasks.length;

  return (
    <div className="bg-slate-800/40 border border-slate-600 rounded p-6">

      {/* CABEÇALHO */}

      <div className="flex items-center justify-between mb-4">

        <h2 className="text-2xl font-semibold">
          {title}
        </h2>

        {/* AÇÕES DAS TASKS SELECIONADAS */}

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

      {/* NOVA TASK */}

      <button
        onClick={handleCreateTask}
        className="
          w-full
          text-left
          bg-slate-700/30
          border
          border-slate-600
          rounded
          p-3
          mb-4
          hover:bg-slate-700/50
          transition
        "
      >
        + Add New Task
      </button>

      {/* TASKS */}

      <div className="flex flex-col gap-3">

        {tasks.length > 0 ? (

          tasks.map(task => (

            <TaskItem
              key={task.id}
              task={task}
              onSelectTask={onSelectTask}
              setIsCreatingTask={setIsCreatingTask}

              selected={selectedIds.includes(task.id)}

              onToggleSelect={handleToggleSelect}
            />

          ))

        ) : (

          <p className="text-slate-400">
            Nenhuma tarefa.
          </p>

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