import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import mockTasks from "../data/tasks";
import stickyNotes from "../data/stickyNotes";
import { getTaskSection } from "../utils/taskUtils";

const TaskContext = createContext(null);

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/+$/, "");

const DEFAULT_LISTS = [
  { id: "personal", label: "Personal", color: "bg-red-400" },
  { id: "work", label: "Work", color: "bg-blue-400" },
  { id: "list1", label: "List 1", color: "bg-yellow-400" },
];

const DEFAULT_TAGS = [
  { id: 1, label: "Tag 1", color: "bg-cyan-300" },
  { id: 2, label: "Tag 2", color: "bg-red-300" },
];

const COLOR_CLASS_TO_HEX = {
  "bg-red-300": "#fca5a5",
  "bg-red-400": "#f87171",
  "bg-red-500": "#ef4444",
  "bg-blue-400": "#60a5fa",
  "bg-blue-500": "#3b82f6",
  "bg-yellow-400": "#facc15",
  "bg-yellow-500": "#eab308",
  "bg-cyan-300": "#67e8f9",
  "bg-cyan-400": "#22d3ee",
  "bg-purple-400": "#c084fc",
  "bg-violet-500": "#8b5cf6",
  "bg-slate-500": "#64748b",
};

const HEX_TO_COLOR_CLASS = Object.fromEntries(
  Object.entries(COLOR_CLASS_TO_HEX).map(([colorClass, hex]) => [
    hex.toLowerCase(),
    colorClass,
  ]),
);

function readLocalStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getToken() {
  return localStorage.getItem("token");
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("Sua sessão expirou. Entre novamente para continuar.");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  if (options.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    if (!response.ok) {
      throw new Error("Não foi possível concluir a operação.");
    }

    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || `Erro na requisição (${response.status}).`,
    );
  }

  return data;
}

function toApiColor(color) {
  if (typeof color !== "string" || !color) {
    return "#64748b";
  }

  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return color;
  }

  return COLOR_CLASS_TO_HEX[color] || "#64748b";
}

function toUiColor(color) {
  if (typeof color !== "string" || !color) {
    return "bg-slate-500";
  }

  if (!color.startsWith("#")) {
    return color;
  }

  return HEX_TO_COLOR_CLASS[color.toLowerCase()] || "bg-slate-500";
}

function normalizeList(apiList) {
  return {
    ...apiList,
    id: apiList.id,
    label: apiList.name,
    color: toUiColor(apiList.color),
    hexColor: apiList.color,
  };
}

function normalizeTag(apiTag) {
  return {
    ...apiTag,
    id: apiTag.id,
    label: apiTag.name,
    color: toUiColor(apiTag.color),
    hexColor: apiTag.color,
  };
}

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  // Preserva a data do backend sem converter o dia pelo fuso horário.
  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function normalizePriority(priority) {
  const value = String(priority || "medium").toLowerCase();

  if (value === "low") return "Low";
  if (value === "high") return "High";

  return "Medium";
}

function toApiPriority(priority) {
  return String(priority || "Medium").toLowerCase();
}

function normalizeTask(apiTask) {
  const taskTags = Array.isArray(apiTask.tags) ? apiTask.tags : [];

  const normalized = {
    ...apiTask,

    // A interface atual utiliza o ID da lista, não o objeto completo.
    list: apiTask.listId ?? apiTask.list?.id ?? null,

    // A interface atual utiliza nomes de tags.
    tags: taskTags
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return item.tag?.name ?? item.name ?? "";
      })
      .filter(Boolean),

    // Mantém os IDs disponíveis para enviar alterações à API.
    tagIds: taskTags
      .map((item) => {
        if (typeof item === "string") {
          return null;
        }

        return item.tagId ?? item.tag?.id ?? item.id ?? null;
      })
      .filter(Boolean),

    priority: normalizePriority(apiTask.priority),
    dueDate: toDateInputValue(apiTask.dueDate),
  };

  return {
  ...normalized,
  section: apiTask.section || getTaskSection(normalized),
  subtasks: Array.isArray(apiTask.subtasks)
    ? apiTask.subtasks.map(normalizeTask)
    : [],
  };
}

function getListId(taskData) {
  if (Object.prototype.hasOwnProperty.call(taskData, "list")) {
    const list = taskData.list;

    if (typeof list === "string") {
      return list || null;
    }

    return list?.id ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(taskData, "listId")) {
    return taskData.listId || null;
  }

  return undefined;
}

function getTagIds(taskData, availableTags) {
  if (Array.isArray(taskData.tagIds)) {
    return taskData.tagIds;
  }

  if (!Array.isArray(taskData.tags)) {
    return undefined;
  }

  return taskData.tags
    .map((selectedTag) => {
      if (typeof selectedTag === "object" && selectedTag !== null) {
        return selectedTag.id ?? null;
      }

      const existingTag = availableTags.find(
        (tag) => tag.label === selectedTag || tag.name === selectedTag,
      );

      return existingTag?.id ?? null;
    })
    .filter(Boolean);
}

function buildTaskPayload(taskData, availableTags) {
  const payload = {};

  if ("title" in taskData) {
    payload.title = taskData.title;
  }

  if ("description" in taskData) {
    payload.description = taskData.description || null;
  }

  if ("completed" in taskData) {
    payload.completed = Boolean(taskData.completed);
  }

  if ("priority" in taskData) {
    payload.priority = toApiPriority(taskData.priority);
  }

  if ("dueDate" in taskData) {
    payload.dueDate = taskData.dueDate
      ? `${taskData.dueDate}T00:00:00.000Z`
      : null;
  }

  if ("dueTime" in taskData) {
    payload.dueTime = taskData.dueTime || null;
  }

  const listId = getListId(taskData);

  if (listId !== undefined) {
    payload.listId = listId;
  }

  if ("parentTaskId" in taskData || "parentTask" in taskData) {
    payload.parentTaskId =
      taskData.parentTaskId ?? taskData.parentTask?.id ?? null;
  }

  const tagIds = getTagIds(taskData, availableTags);

  if (tagIds !== undefined) {
    payload.tagIds = tagIds;
  }

  return payload;
}

function normalizeListOrTagInput(item) {
  if (typeof item === "string") {
    return {
      name: item.trim(),
      color: "#64748b",
    };
  }

  return {
    name: String(item?.label ?? item?.name ?? "").trim(),
    color: toApiColor(item?.hexColor ?? item?.color),
  };
}

export function TaskProvider({ children }) {
  const [tags, setTags] = useState(() =>
    readLocalStorage("tags", DEFAULT_TAGS),
  );

  const [lists, setLists] = useState(() =>
    readLocalStorage("lists", DEFAULT_LISTS),
  );

  const [activeMenu, setActiveMenu] = useState("today");

  const [stickyNotesCount, setStickyNotesCount] = useState(() => {
    const savedNotes = readLocalStorage("stickyNotes", null);
    return savedNotes ? savedNotes.length : stickyNotes.length;
  });

  const [tasks, setTasks] = useState(() =>
    readLocalStorage("tasks", mockTasks),
  );

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("tags", JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    localStorage.setItem("lists", JSON.stringify(lists));
  }, [lists]);

  // Carrega tarefas, listas e tags pertencentes ao usuário autenticado.
  const fetchTasks = useCallback(async () => {
    if (!getToken()) {
      return;
    }

    const [apiTasks, apiLists, apiTags] = await Promise.all([
      apiRequest("/tasks"),
      apiRequest("/lists"),
      apiRequest("/tags"),
    ]);

    setTasks(apiTasks.map(normalizeTask));
    setLists(apiLists.map(normalizeList));
    setTags(apiTags.map(normalizeTag));
  }, []);

  useEffect(() => {
    if (!getToken()) {
      return;
    }

    fetchTasks().catch((error) => {
      console.error("Erro ao carregar dados do usuário:", error);
    });
  }, [fetchTasks]);

  const createTask = useCallback(
    async (taskData) => {
      if (!getToken()) {
        const newTask = {
          ...taskData,
          id: Date.now(),
          section: getTaskSection(taskData),
        };

        setTasks((currentTasks) => [...currentTasks, newTask]);

        setTags((currentTags) => {
          const nextTags = [...currentTags];

          (taskData.tags || []).forEach((tagLabel) => {
            if (
              typeof tagLabel === "string" &&
              !nextTags.some((tag) => tag.label === tagLabel)
            ) {
              nextTags.push({
                id: `local-${Date.now()}-${nextTags.length}`,
                label: tagLabel,
                color: "bg-violet-500",
              });
            }
          });

          return nextTags;
        });

        return newTask;
      }

      const payload = buildTaskPayload(taskData, tags);
      const apiTask = await apiRequest("/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const newTask = normalizeTask(apiTask);

      setTasks((currentTasks) => [...currentTasks, newTask]);

      return newTask;
    },
    [tags],
  );

  const updateTask = useCallback(
    async (taskData) => {
      if (!taskData?.id) {
        throw new Error("Não foi possível identificar a tarefa.");
      }

      if (!getToken()) {
        const updatedTask = {
          ...taskData,
          section: getTaskSection(taskData),
        };

        setTasks((currentTasks) =>
          currentTasks.map((currentTask) =>
            currentTask.id === taskData.id ? updatedTask : currentTask,
          ),
        );

        return updatedTask;
      }

      const payload = buildTaskPayload(taskData, tags);

      const apiTask = await apiRequest(
        `/tasks/${encodeURIComponent(taskData.id)}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      );

      const updatedTask = normalizeTask(apiTask);

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id ? updatedTask : currentTask,
        ),
      );

      return updatedTask;
    },
    [tags],
  );

  const deleteTask = useCallback(async (id) => {
    if (getToken()) {
      await apiRequest(`/tasks/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    }

    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  }, []);

  const createList = useCallback(async (listInput) => {
    const payload = normalizeListOrTagInput(listInput);

    if (!payload.name) {
      throw new Error("Informe o nome da lista.");
    }

    if (getToken()) {
      const apiList = await apiRequest("/lists", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const newList = normalizeList(apiList);
      setLists((currentLists) => [...currentLists, newList]);

      return newList;
    }

    const newList = {
      id: `local-${Date.now()}`,
      label: payload.name,
      color: listInput?.color || "bg-slate-500",
    };

    setLists((currentLists) => [...currentLists, newList]);

    return newList;
  }, []);

  const updateList = useCallback(async (listId, changes) => {
    if (getToken()) {
      const payload = {};

      if ("label" in changes || "name" in changes) {
        payload.name = String(changes.label ?? changes.name).trim();
      }

      if ("color" in changes || "hexColor" in changes) {
        payload.color = toApiColor(changes.hexColor ?? changes.color);
      }

      const apiList = await apiRequest(`/lists/${encodeURIComponent(listId)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      const updatedList = normalizeList(apiList);

      setLists((currentLists) =>
        currentLists.map((list) => (list.id === listId ? updatedList : list)),
      );

      return updatedList;
    }

    let updatedList;

    setLists((currentLists) =>
      currentLists.map((list) => {
        if (list.id !== listId) return list;

        updatedList = { ...list, ...changes };

        if (changes.name !== undefined || changes.label !== undefined) {
          updatedList.label = changes.label ?? changes.name;
        }

        return updatedList;
      }),
    );

    return updatedList;
  }, []);

  const deleteList = useCallback(
    async (listId) => {
      if (getToken()) {
        await apiRequest(`/lists/${encodeURIComponent(listId)}`, {
          method: "DELETE",
        });
      }

      setLists((currentLists) =>
        currentLists.filter((list) => list.id !== listId),
      );

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.list === listId ? { ...task, list: null, listId: null } : task,
        ),
      );

      if (activeMenu === listId) {
        setActiveMenu("upcoming");
      }
    },
    [activeMenu],
  );

  const createTag = useCallback(async (tagInput) => {
    const payload = normalizeListOrTagInput(tagInput);

    if (!payload.name) {
      throw new Error("Informe o nome da tag.");
    }

    if (getToken()) {
      const apiTag = await apiRequest("/tags", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const newTag = normalizeTag(apiTag);
      setTags((currentTags) => [...currentTags, newTag]);

      return newTag;
    }

    const newTag = {
      id: `local-${Date.now()}`,
      label: payload.name,
      color: tagInput?.color || "bg-violet-500",
    };

    setTags((currentTags) => [...currentTags, newTag]);

    return newTag;
  }, []);

  const updateTag = useCallback(async (tagId, changes) => {
    if (getToken()) {
      const payload = {};

      if ("label" in changes || "name" in changes) {
        payload.name = String(changes.label ?? changes.name).trim();
      }

      if ("color" in changes || "hexColor" in changes) {
        payload.color = toApiColor(changes.hexColor ?? changes.color);
      }

      const apiTag = await apiRequest(`/tags/${encodeURIComponent(tagId)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      const updatedTag = normalizeTag(apiTag);

      setTags((currentTags) =>
        currentTags.map((tag) => (tag.id === tagId ? updatedTag : tag)),
      );

      return updatedTag;
    }

    let updatedTag;

    setTags((currentTags) =>
      currentTags.map((tag) => {
        if (tag.id !== tagId) return tag;

        updatedTag = { ...tag, ...changes };

        if (changes.name !== undefined || changes.label !== undefined) {
  updatedTag.label = changes.label ?? changes.name;
}

        return updatedTag;
      }),
    );

    return updatedTag;
  }, []);

  const deleteTag = useCallback(
    async (tagId) => {
      const tagToDelete = tags.find((tag) => tag.id === tagId);

      if (getToken()) {
        await apiRequest(`/tags/${encodeURIComponent(tagId)}`, {
          method: "DELETE",
        });
      }

      setTags((currentTags) => currentTags.filter((tag) => tag.id !== tagId));

      if (tagToDelete) {
        setTasks((currentTasks) =>
          currentTasks.map((task) => ({
            ...task,
            tags: (task.tags || []).filter(
              (tagLabel) => tagLabel !== tagToDelete.label,
            ),
            tagIds: (task.tagIds || []).filter((id) => id !== tagId),
          })),
        );

        if (activeMenu === `tag-${tagId}`) {
          setActiveMenu("upcoming");
        }
      }
    },
    [activeMenu, tags],
  );

  const titles = {
    dashboard: "Dashboard",
    today: "Today",
    upcoming: "Upcoming",
    calendar: "Calendar",
    sticky: "Sticky Wall",
    "priority-low": "Low Priority",
    "priority-medium": "Medium Priority",
    "priority-high": "High Priority",
    ...Object.fromEntries(lists.map((list) => [list.id, list.label])),
    ...Object.fromEntries(tags.map((tag) => [`tag-${tag.id}`, tag.label])),
  };

  const counts = {
    today: tasks.filter((task) => getTaskSection(task) === "today").length,

    upcoming: tasks.filter((task) =>
      ["today", "tomorrow", "week"].includes(getTaskSection(task)),
    ).length,

    calendar: 0,

    sticky: stickyNotesCount,

    ...Object.fromEntries(
      lists.map((list) => [
        list.id,
        tasks.filter((task) => task.list === list.id).length,
      ]),
    ),

    ...Object.fromEntries(
      tags.map((tag) => [
        `tag-${tag.id}`,
        tasks.filter((task) => (task.tags || []).includes(tag.label)).length,
      ]),
    ),

    "priority-low": tasks.filter(
      (task) => String(task.priority).toLowerCase() === "low",
    ).length,

    "priority-medium": tasks.filter(
      (task) => String(task.priority).toLowerCase() === "medium",
    ).length,

    "priority-high": tasks.filter(
      (task) => String(task.priority).toLowerCase() === "high",
    ).length,
  };

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
        createList,
        updateList,
        deleteList,
        createTag,
        updateTag,
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
