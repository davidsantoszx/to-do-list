import { useEffect, useState } from "react";
import { useTasks } from "../../context/TaskContext";
import toast from "react-hot-toast";
import Modal from "../layout/Modal";
import TagModal from "./TagModal";

export default function TaskDetailsPanel({
  task,
  isCreatingTask,
  creationMode,
  setSelectedTask,
  setIsCreatingTask,
  defaultPriority,
}) {
  const {
    createTask,
    updateTask,
    deleteTask,
    lists,
    tags: availableTags,
    setTags: setAvailableTags,
    activeMenu,
  } = useTasks();

/* ==================================================
   FORM STATES
================================================== */

const [title, setTitle] = useState(task?.title || "");
const [description, setDescription] = useState(task?.description || "");
const [list, setList] = useState(task?.list ?? "");
const [dueDate, setDueDate] = useState(task?.dueDate || "");
const [dueTime, setDueTime] = useState(task?.dueTime || "");
const [tags, setTags] = useState(task?.tags || []);
const [priority, setPriority] = useState(defaultPriority || "Medium");
const [completed, setCompleted] = useState(task?.completed || false);

/* ==================================================
   MODAL STATES
================================================== */

const [showTagModal, setShowTagModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);

/* ==================================================
   VALIDATION STATES
================================================== */

const [dateError, setDateError] = useState("");
const [titleError, setTitleError] = useState("");

  useEffect(() => {
    setDateError("");
    setTitleError("");

    if (task) {
      setTitle(task.title || "");

      setDescription(task.description || "");

      setDueDate(task.dueDate || "");

      setDueTime(task.dueTime || "");

      setTags(task.tags || []);

      setPriority(task.priority || "Medium");

      setCompleted(task.completed || false);

      setList(task.list ?? "");
    } else if (isCreatingTask) {
      setTitle("");

      setDescription("");

      setDueTime("");

      setPriority(defaultPriority || "Medium");

      // Se a criação veio diretamente de uma List,
      // já seleciona essa List.
      const creatingFromList = lists.some(
        (listItem) => listItem.id === activeMenu,
      );

      if (creatingFromList) {
        setList(activeMenu);
      } else {
        setList("");
      }

      /*
       * DATA ATUAL
       *
       * Todas as novas tasks começam
       * automaticamente com a data de hoje.
       */
      const today = new Date();

      const formattedToday = `${today.getFullYear()}-${String(
        today.getMonth() + 1,
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      /*
       * TODAY
       *
       * Data de hoje e bloqueada.
       */
      if (creationMode === "today") {
        setDueDate(formattedToday);
      } else if (creationMode === "tomorrow") {
        /*
         * TOMORROW
         *
         * Data de amanhã e bloqueada.
         */
        const tomorrow = new Date();

        tomorrow.setDate(tomorrow.getDate() + 1);

        const formattedTomorrow = `${tomorrow.getFullYear()}-${String(
          tomorrow.getMonth() + 1,
        ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

        setDueDate(formattedTomorrow);
      } else if (creationMode === "week") {
        /*
         * THIS WEEK
         *
         * Precisa escolher uma data manualmente.
         * Isso mantém a validação de data obrigatória.
         */
        setDueDate("");
      } else {
        /*
         * LISTS / OUTROS
         *
         * Começam com a data de hoje,
         * mas a pessoa pode alterar.
         */
        setDueDate(formattedToday);
      }

      setTags([]);

      setPriority(defaultPriority || "Medium");

      setCompleted(false);
    }
  }, [task, isCreatingTask, creationMode, defaultPriority]);

  function handleSave() {
    if (isCreatingTask && !title.trim()) {
      setTitleError("Informe um título para criar esta tarefa.");

      return;
    }

    setTitleError("");

    if (isCreatingTask && creationMode === "week" && !dueDate) {
      setDateError("Informe uma data para criar esta tarefa.");

      return;
    }

    setDateError("");

    const taskData = {
      ...(task || {}),

      title,

      description,

      list,

      dueDate,

      dueTime,

      priority,

      completed,

      tags,
    };

    if (isCreatingTask) {
      createTask(taskData);
    } else {
      updateTask(taskData);
    }

    setSelectedTask(null);

    setIsCreatingTask(false);
  }

  function handleDelete() {
    if (!task) {
      return;
    }

    deleteTask(task.id);

    toast.success("Task deleted.");

    setShowDeleteModal(false);
    setSelectedTask(null);
    setIsCreatingTask(false);
  }

  function handleCreateTag(newTag) {
    const alreadyExists = availableTags.some(
      (tag) => tag.label.toLowerCase() === newTag.label.toLowerCase(),
    );

    if (alreadyExists) {
      setShowTagModal(false);
      return;
    }

    setAvailableTags((prev) => [...prev, newTag]);

    setTags((prev) => {
      if (prev.includes(newTag.label)) {
        return prev;
      }

      return [...prev, newTag.label];
    });

    setShowTagModal(false);
  }

  if (!task && !isCreatingTask) {
    return (
      <div className="bg-slate-800/40 border border-slate-600 rounded-xl p-6 sticky top-8">
        <p className="text-slate-400">Selecione uma tarefa.</p>
      </div>
    );
  }

  const priorityColor = {
    Low: "text-green-400",
    Medium: "text-yellow-400",
    High: "text-red-400",
  };

  const isDateLocked =
    isCreatingTask && (creationMode === "today" || creationMode === "tomorrow");

  const isListLocked =
    isCreatingTask && lists.some((listItem) => listItem.id === activeMenu);

  return (
    <>
      <div className="bg-slate-800/40 border border-slate-600 rounded p-6 min-h-[1030px] -mt-24">
        <div className="flex items-start justify-between border-b border-slate-700 pb-5 mb-7">
          <h2 className="text-2xl font-bold text-white">
            {isCreatingTask ? "New Task" : "Edit Task"}
          </h2>

          <button
            onClick={() => {
              setSelectedTask(null);
              setIsCreatingTask(false);
            }}
            className="
              w-9
              h-9
              rounded-lg
              flex
              items-center
              justify-center
              hover:bg-slate-700
              text-slate-400
              hover:text-white
              transition
            "
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* TITLE */}

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
              Title
            </label>

            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError("");
              }}
              className={`
              w-full
              bg-slate-800
              border
              ${titleError ? "border-red-500" : "border-slate-700"}
              rounded-xl
              px-4
              py-3
              outline-none
              transition
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500/20
            `}
              placeholder="Task title"
            />

            {titleError && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                <span className="text-xs">●</span>
                {titleError}
              </p>
            )}
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
              Description
            </label>

            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-2 bg-slate-700 border border-slate-600 rounded-lg p-3 resize-none outline-none focus:border-blue-500"
              placeholder="Task description"
            />
          </div>

          {/* LIST */}

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
              List
            </label>

            <select
              disabled={isListLocked}
              value={list}
              onChange={(e) => setList(e.target.value)}
              className={`
                w-full
                bg-slate-800
                border
                border-slate-700
                rounded-xl
                px-4
                py-3
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
                ${isListLocked ? "opacity-60 cursor-not-allowed" : ""}
              `}
            >
              <option value="">No List</option>

              {lists.map((listItem) => (
                <option key={listItem.id} value={listItem.id}>
                  {listItem.label}
                </option>
              ))}
            </select>
          </div>

          {/* DUE DATE */}

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
              Due Date
            </label>

            <input
              disabled={isDateLocked}
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setDateError("");
              }}
              className={`
                w-full
                bg-slate-800
                border
                ${dateError ? "border-red-500" : "border-slate-700"}
                rounded-xl
                px-4
                py-3
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
                ${isDateLocked ? "opacity-60 cursor-not-allowed" : ""}
              `}
            />

            {dateError && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                <span className="text-xs">●</span>
                {dateError}
              </p>
            )}
          </div>

          {/* DUE TIME */}

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
              Due Time
            </label>

            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="
                  w-full
                  bg-slate-800
                  border
                  border-slate-700
                  rounded-xl
                  px-4
                  py-3
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20
                "
            />
          </div>

          {/* PRIORITY */}

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
              Priority
            </label>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={`w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 ${priorityColor[priority]}`}
            >
              <option value="Low">Low</option>

              <option value="Medium">Medium</option>

              <option value="High">High</option>
            </select>
          </div>

          {/* TAGS */}

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
              Tags
            </label>

            {/* TAGS DISPONÍVEIS */}

            <div
              className="
    flex
    flex-wrap
    gap-2
    mt-3
  "
            >
              {availableTags.map((tag) => {
                const isSelected = tags.includes(tag.label);

                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setTags((prev) =>
                          prev.filter((item) => item !== tag.label),
                        );
                      } else {
                        setTags((prev) => [...prev, tag.label]);
                      }
                    }}
                    className={`
            px-3
            py-1
            rounded-lg
            text-sm
            transition
            flex
            items-center
            gap-1.5
            ${
              isSelected
                ? `${tag.color} text-slate-900 ring-2 ring-white/60`
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }
          `}
                  >
                    {tag.label}

                    {isSelected && <span className="font-bold">✓</span>}
                  </button>
                );
              })}

              {/* ADD TAG */}

              <button
                type="button"
                onClick={() => setShowTagModal(true)}
                className="
        px-3
        py-1
        text-blue-400
        text-sm
        rounded-lg
        hover:bg-blue-500/10
        hover:text-blue-300
        transition
      "
              >
                + Add Tag
              </button>
            </div>

            {/* TAGS SELECIONADAS */}

            {tags.length > 0 && (
              <div className="mt-4">
                <p
                  className="
        text-[11px]
        uppercase
        tracking-wider
        text-slate-500
        mb-2
      "
                >
                  Selected
                </p>

                <div
                  className="
        flex
        flex-wrap
        gap-2
      "
                >
                  {tags.map((tagName) => {
                    const tagObject = availableTags.find(
                      (tag) => tag.label === tagName,
                    );

                    return (
                      <span
                        key={tagName}
                        className={`
                ${tagObject?.color || "bg-cyan-300"}
                px-3
                py-1
                rounded-lg
                text-slate-900
                text-sm
                flex
                items-center
                gap-2
              `}
                      >
                        {tagName}

                        <button
                          type="button"
                          onClick={() =>
                            setTags((prev) =>
                              prev.filter((tag) => tag !== tagName),
                            )
                          }
                          className="
                  font-bold
                  hover:text-red-700
                "
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* COMPLETED */}

          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Completed
            </label>

            <button
              type="button"
              onClick={() => setCompleted(!completed)}
              className={`
                w-11
                h-6
                rounded-full
                transition
                relative
                ${completed ? "bg-blue-600" : "bg-slate-600"}
              `}
            >
              <span
                className={`
                  absolute
                  top-0.5
                  left-0.5
                  w-5
                  h-5
                  rounded-full
                  bg-white
                  transition
                  ${completed ? "translate-x-5" : ""}
                `}
              />
            </button>
          </div>

          {/* ACTIONS */}

          <div className="flex justify-between items-center pt-8 border-t border-slate-700">
            {!isCreatingTask && task && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="
              px-4
              py-2
              rounded-lg
              border
              border-red-500/30
              text-red-400
              bg-red-500/5
              hover:bg-red-500/15
              hover:border-red-500/50
              hover:text-red-300
              transition
              font-medium
            "
              >
                Delete
              </button>
            )}

            <div className="flex gap-3 ml-auto">
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setIsCreatingTask(false);
                }}
                className="
                  px-5
                  py-3
                  rounded-xl
                  bg-slate-700
                  hover:bg-slate-600
                  transition
                "
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="
                  px-6
                  py-3
                  rounded-xl
                  bg-blue-600
                  hover:bg-blue-700
                  transition
                  font-medium
                "
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}

      {showDeleteModal && (
        <Modal
          title="Delete task"
          message="This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}

      {/* TAG MODAL */}

      {showTagModal && (
        <TagModal
          onClose={() => setShowTagModal(false)}
          onSave={handleCreateTag}
        />
      )}
    </>
  );
}
