import { createContext, useContext, useEffect, useState } from "react";
import mockTasks from "../data/tasks";
import stickyNotes from "../data/stickyNotes";
import { getTaskSection } from "../utils/taskUtils";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  /* ==========================
     TAGS
  ========================== */

  const [tags, setTags] = useState(() => {
    const savedTags = localStorage.getItem("tags");

    if (savedTags) {
      try {
        const parsedTags = JSON.parse(savedTags);

        return Array.isArray(parsedTags) ? parsedTags : [];
      } catch {
        return [];
      }
    }

    return [
      {
        id: 1,
        label: "Tag 1",
        color: "bg-cyan-300",
      },
      {
        id: 2,
        label: "Tag 2",
        color: "bg-red-300",
      },
    ];
  });

  /* ==========================
     LISTAS
  ========================== */

  const [lists, setLists] = useState(() => {
    const savedLists = localStorage.getItem("lists");

    if (savedLists) {
      try {
        const parsedLists = JSON.parse(savedLists);

        return Array.isArray(parsedLists)
          ? parsedLists
          : [
              {
                id: "personal",
                label: "Personal",
                color: "bg-red-400",
              },
              {
                id: "work",
                label: "Work",
                color: "bg-blue-400",
              },
              {
                id: "list1",
                label: "List 1",
                color: "bg-yellow-400",
              },
            ];
      } catch {
        return [
          {
            id: "personal",
            label: "Personal",
            color: "bg-red-400",
          },
          {
            id: "work",
            label: "Work",
            color: "bg-blue-400",
          },
          {
            id: "list1",
            label: "List 1",
            color: "bg-yellow-400",
          },
        ];
      }
    }

    return [
      {
        id: "personal",
        label: "Personal",
        color: "bg-red-400",
      },
      {
        id: "work",
        label: "Work",
        color: "bg-blue-400",
      },
      {
        id: "list1",
        label: "List 1",
        color: "bg-yellow-400",
      },
    ];
  });

  /* ==========================
     MENU ATIVO
  ========================== */

  const [activeMenu, setActiveMenu] = useState("today");

  /* ==========================
     STICKY WALL
  ========================== */

  const [stickyNotesCount, setStickyNotesCount] = useState(() => {
    const savedNotes = localStorage.getItem("stickyNotes");

    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);

        return Array.isArray(parsedNotes) ? parsedNotes.length : 0;
      } catch {
        return 0;
      }
    }

    return stickyNotes.length;
  });

  /* ==========================
     TÍTULOS
  ========================== */

  const titles = {
    dashboard: "Dashboard",
    today: "Today",
    upcoming: "Upcoming",
    calendar: "Calendar",
    sticky: "Sticky Wall",

    "priority-low": "Low Priority",
    "priority-medium": "Medium Priority",
    "priority-high": "High Priority",
  };

  lists.forEach((list) => {
    titles[list.id] = list.label;
  });

  tags.forEach((tag) => {
    titles[`tag-${tag.id}`] = tag.label;
  });

  /* ==========================
     TASKS
  ========================== */

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);

        return Array.isArray(parsedTasks) ? parsedTasks : mockTasks;
      } catch {
        return mockTasks;
      }
    }

    return mockTasks;
  });

  /* ==========================
     LOCAL STORAGE
  ========================== */

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("tags", JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    localStorage.setItem("lists", JSON.stringify(lists));
  }, [lists]);

  /* ==========================
     API
  ========================== */

  async function fetchTasks() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://26.51.220.173:2020/v1/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar tarefas");
      }

      const data = await response.json();

      setTasks(data);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
    }
  }

  /* ==========================
     CREATE TASK
  ========================== */

  function createTask(taskData) {
    const newTask = {
      id: Date.now(),
      ...taskData,
      section: getTaskSection(taskData),
    };

    setTasks((prev) => [...prev, newTask]);

    (taskData.tags || []).forEach((tag) => {
      const exists = tags.some(
        (item) => item.label.toLowerCase() === tag.toLowerCase(),
      );

      if (!exists) {
        setTags((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            label: tag,
            color: "bg-cyan-300",
          },
        ]);
      }
    });
  }

  /* ==========================
     UPDATE TASK
  ========================== */

  function updateTask(taskData) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskData.id
          ? {
              ...taskData,
              section: getTaskSection(taskData),
            }
          : task,
      ),
    );

    (taskData.tags || []).forEach((tag) => {
      const exists = tags.some(
        (item) => item.label.toLowerCase() === tag.toLowerCase(),
      );

      if (!exists) {
        setTags((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            label: tag,
            color: "bg-cyan-300",
          },
        ]);
      }
    });
  }

  /* ==========================
     DELETE TASK
  ========================== */

  function deleteTask(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  /* ==========================
     DELETE LIST
  ========================== */

  function deleteList(listId) {
    setLists((prev) => prev.filter((list) => list.id !== listId));

    setTasks((prev) =>
      prev.map((task) =>
        task.list === listId
          ? {
              ...task,
              list: null,
            }
          : task,
      ),
    );
  }

  /* ==========================
     DELETE TAG
  ========================== */

  function deleteTag(tagId) {
    const tagToDelete = tags.find((tag) => tag.id === tagId);

    if (!tagToDelete) {
      return;
    }

    setTags((prev) => prev.filter((tag) => tag.id !== tagId));

    setTasks((prev) =>
      prev.map((task) => ({
        ...task,
        tags: Array.isArray(task.tags)
          ? task.tags.filter((tag) => tag !== tagToDelete.label)
          : [],
      })),
    );

    if (activeMenu === `tag-${tagId}`) {
      setActiveMenu("upcoming");
    }
  }

  /* ==========================
     COUNTS
  ========================== */

  const counts = {
    today: tasks.filter((task) => getTaskSection(task) === "today").length,

    upcoming: tasks.filter((task) => {
      const section = getTaskSection(task);

      return (
        section === "today" || section === "tomorrow" || section === "week"
      );
    }).length,

    calendar: 0,

    sticky: stickyNotesCount,
  };

  lists.forEach((list) => {
    counts[list.id] = tasks.filter((task) => task.list === list.id).length;
  });

  tags.forEach((tag) => {
    counts[`tag-${tag.id}`] = tasks.filter(
      (task) => Array.isArray(task.tags) && task.tags.includes(tag.label),
    ).length;
  });

  /* ==========================
     PRIORIDADES
  ========================== */

  counts["priority-low"] = tasks.filter(
    (task) => task.priority === "Low",
  ).length;

  counts["priority-medium"] = tasks.filter(
    (task) => task.priority === "Medium",
  ).length;

  counts["priority-high"] = tasks.filter(
    (task) => task.priority === "High",
  ).length;

  /* ==========================
     PROVIDER
  ========================== */

  return (
    <TaskContext.Provider
      value={{
        tasks,
        setTasks,

        lists,
        setLists,

        tags,
        setTags,

        activeMenu,
        setActiveMenu,

        titles,
        counts,

        stickyNotesCount,
        setStickyNotesCount,

        fetchTasks,

        createTask,
        updateTask,
        deleteTask,
        deleteList,
        deleteTag,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}
