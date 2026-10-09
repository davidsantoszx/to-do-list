import { useState } from "react";
import { useTasks } from "../../context/TaskContext";
import TaskItem from "./TaskItem";
import Modal from "../layout/Modal";
import { Check, Trash2, ListChecks } from "lucide-react";

export default function TagDashboard({
  tag,
  setSelectedTask,
  setIsCreatingTask,
  setCreationMode,
}) {
  const { tasks, updateTask, deleteTask } = useTasks();

  const [selectedIds, setSelectedIds] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* ==========================
     TASKS DA TAG
  ========================== */

  const filteredTasks = tasks.filter(
    (task) =>
      Array.isArray(task.tags) &&
      task.tags.some(
        (taskTag) => taskTag.toLowerCase() === tag.label.toLowerCase(),
      ),
  );

  /* ==========================
     SELECIONAR TASK
  ========================== */

  function handleToggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((taskId) => taskId !== id)
        : [...prev, id],
    );
  }

  /* ==========================
     SELECIONAR TODAS
  ========================== */

  function handleSelectAll() {
    if (selectedIds.length === filteredTasks.length) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(filteredTasks.map((task) => task.id));
  }

  /* ==========================
     CONCLUIR SELECIONADAS
  ========================== */

  function handleDeleteSelected() {
    setShowDeleteModal(true);
  }

  function handleCloseDeleteModal() {
    setShowDeleteModal(false);
  }

  function handleConfirmDeleteSelected() {
    selectedIds.forEach((id) => {
      deleteTask(id);
    });

    setSelectedIds([]);
    setShowDeleteModal(false);
  }

  /* ==========================
     EXCLUIR SELECIONADAS
  ========================== */

  function handleDeleteSelected() {
    selectedIds.forEach((id) => {
      deleteTask(id);
    });

    setSelectedIds([]);
  }

  /* ==========================
     CRIAR TASK
  ========================== */

  function handleCreateTask() {
    setSelectedTask(null);
    setCreationMode("tag");
    setIsCreatingTask(true);
  }

  const hasSelection = selectedIds.length > 0;

  const allSelected =
    filteredTasks.length > 0 && selectedIds.length === filteredTasks.length;

  return (
    <div className="bg-slate-800/40 border border-slate-600 rounded-xl overflow-hidden">
      {/* ==========================
          HEADER
      ========================== */}

      <div className="flex items-center justify-between border-b border-slate-700">
        <button
          onClick={handleCreateTask}
          className="
            flex-1
            p-4
            text-left
            hover:bg-slate-700/30
            transition
          "
        >
          + Add New Task
        </button>

        {/* ==========================
            AÇÕES
        ========================== */}

        {hasSelection && (
          <div className="flex items-center gap-2 px-4">
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

              {allSelected ? "Desmarcar todas" : "Selecionar todas"}
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
          TASKS
      ========================== */}

      <div className="flex flex-col gap-3 p-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              setIsCreatingTask={setIsCreatingTask}
              onSelectTask={setSelectedTask}
              selected={selectedIds.includes(task.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))
        ) : (
          <p className="text-slate-400">Nenhuma tarefa com esta tag.</p>
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
