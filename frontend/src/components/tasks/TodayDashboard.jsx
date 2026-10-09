import { useState } from "react";

import { useTasks } from "../../context/TaskContext";

import TaskItem from "./TaskItem";

import { getTaskSection } from "../../utils/taskUtils";

import {
  Check,
  Trash2,
  ListChecks
} from "lucide-react";


export default function TodayDashboard({

  selectedTask,

  setSelectedTask,

  isCreatingTask,

  setIsCreatingTask,

  setCreationMode

}) {

  const {

    tasks,

    updateTask,

    deleteTask

  } = useTasks();


  const [selectedIds, setSelectedIds] = useState([]);


  /* ==========================
     ORDENAÇÃO DAS TASKS
  ========================== */

  function sortTasksByExpiration(taskList) {

    return [...taskList].sort((a, b) => {

      // Tasks sem horário ficam por último
      if (!a.dueTime && !b.dueTime) {
        return 0;
      }

      if (!a.dueTime) {
        return 1;
      }

      if (!b.dueTime) {
        return -1;
      }

      const timeA = a.dueTime;
      const timeB = b.dueTime;

      return timeA.localeCompare(timeB);
    });

  }


  /* ==========================
     TODAY TASKS
  ========================== */

  const todayTasks = sortTasksByExpiration(

    tasks.filter(
      task => getTaskSection(task) === "today"
    )

  );


  function handleSelectTask(task) {

    setIsCreatingTask(false);

    setSelectedTask(task);

  }


  function handleToggleSelect(id) {

    setSelectedIds(prev =>

      prev.includes(id)

        ? prev.filter(
            taskId => taskId !== id
          )

        : [...prev, id]

    );

  }


  function handleSelectAll() {

    if (
      selectedIds.length ===
      todayTasks.length
    ) {

      setSelectedIds([]);

      return;

    }

    setSelectedIds(
      todayTasks.map(task => task.id)
    );

  }


  function handleCompleteSelected() {

    todayTasks

      .filter(
        task =>
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


  function handleDeleteSelected() {

    selectedIds.forEach(id => {

      deleteTask(id);

    });

    setSelectedIds([]);

  }


  const hasSelection =
    selectedIds.length > 0;


  const allSelected =

    todayTasks.length > 0 &&

    selectedIds.length ===
      todayTasks.length;


  return (

    <div className="bg-slate-800/40 border border-slate-600 rounded p-6">


      {/* CABEÇALHO */}

      <div className="flex items-center justify-between mb-4">

        <h2 className="text-2xl font-semibold">
          Today
        </h2>


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

        onClick={() => {

          setCreationMode?.("today");

          setSelectedTask(null);

          setIsCreatingTask(true);

        }}

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

        {todayTasks.map(task => (

          <TaskItem

            key={task.id}

            task={task}

            onSelectTask={handleSelectTask}

            selected={
              selectedIds.includes(task.id)
            }

            onToggleSelect={
              handleToggleSelect
            }

          />

        ))}

      </div>

    </div>

  );

}