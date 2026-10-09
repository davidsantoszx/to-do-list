/* ==========================
   SIDEBAR
========================= */

import { useState } from "react";
import { useTasks } from "../../context/TaskContext";
import ListModal from "../tasks/ListsModal";
import TagModal from "../tasks/TagModal";
import Modal from "../layout/Modal";
import { Trash2, LogOut } from "lucide-react";

export default function Sidebar({
  activeMenu,
  setActiveMenu,
  sidebarOpen,
  setSidebarOpen,
  handleSignOutClick,
}) {
  const tasksMenu = [
    { id: "dashboard", label: "▦ Dashboard" },
    { id: "upcoming", label: "➤ Upcoming" },
    { id: "today", label: "📄 Today" },
    { id: "calendar", label: "📅 Calendar" },
    { id: "sticky", label: "🧱 Sticky Wall" },
  ];

  const { counts, lists, tags, setLists, setTags, deleteList, deleteTag } =
    useTasks();

  const [showListModal, setShowListModal] = useState(false);

  const [showTagModal, setShowTagModal] = useState(false);

  const [showDeleteListModal, setShowDeleteListModal] = useState(false);

  const [selectedList, setSelectedList] = useState(null);

  const [showDeleteTagModal, setShowDeleteTagModal] = useState(false);

  const [selectedTag, setSelectedTag] = useState(null);

  function handleCreateList(newList) {
    setLists((prev) => [...prev, newList]);

    setShowListModal(false);
  }

  function handleDeleteList(list) {
    setSelectedList(list);
    setShowDeleteListModal(true);
  }

  function confirmDeleteList() {
    if (!selectedList) {
      return;
    }

    deleteList(selectedList.id);

    // Se o usuário estava dentro da lista excluída,
    // volta para Upcoming
    if (activeMenu === selectedList.id) {
      setActiveMenu("upcoming");
    }

    setShowDeleteListModal(false);
    setSelectedList(null);
  }

  function handleDeleteTag() {
    if (!selectedTag) {
      return;
    }

    deleteTag(selectedTag.id);

    setShowDeleteTagModal(false);
    setSelectedTag(null);
  }

  function handleCreateTag(newTag) {
    setTags((prev) => [...prev, newTag]);

    setShowTagModal(false);
  }

  return (
    <aside
      className={`transition-all duration-300 flex flex-col
      ${
        sidebarOpen
          ? "w-64 p-5 border-r border-slate-700 bg-gradient-to-br from-slate-700 via-gray-700 to-black"
          : "w-0 p-0 border-none overflow-hidden"
      }`}
    >
      {sidebarOpen && (
        <>
          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded hover:bg-slate-600 transition text-slate-200"
              >
                ☰
              </button>

              <span className="text-lg font-semibold text-slate-100">Menu</span>
            </div>
          </div>

          {/* TASKS */}
          <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">
            Tasks
          </h2>

          <ul className="flex flex-col gap-2">
            {tasksMenu.map((item) => (
              <li
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`
                  flex justify-between items-center
                  cursor-pointer
                  px-2 py-1
                  rounded
                  transition-all duration-200
                  ${
                    activeMenu === item.id
                      ? "bg-gray-100 text-black font-semibold"
                      : "hover:bg-gray-100 hover:text-black text-slate-200"
                  }
                `}
              >
                <span>{item.label}</span>

                {counts[item.id] > 0 && (
                  <span className="text-xs bg-gray-200 text-black px-2 rounded">
                    {counts[item.id]}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* LISTS */}
          <h2 className="text-xs font-semibold text-gray-400 uppercase mt-6 mb-2">
            Lists
          </h2>

          <ul className="flex flex-col gap-2">
            {lists.map((item) => (
              <li
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`
                group
                flex
                justify-between
                items-center
                cursor-pointer
                px-2
                py-1
                rounded
                transition-all
                duration-200
                ${
                  activeMenu === item.id
                    ? "bg-gray-100 text-black font-semibold"
                    : "hover:bg-gray-100 hover:text-black text-slate-200"
                }
              `}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${item.color}`}
                  />

                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(item);
                    }}
                    className="
                  opacity-0
                  group-hover:opacity-100
                  transition
                  p-1
                  rounded
                  text-slate-400
                  hover:text-red-400
                  hover:bg-red-500/10
                "
                    title="Excluir lista"
                  >
                    <Trash2 size={15} />
                  </button>

                  {counts[item.id] > 0 && (
                    <span
                      className="
                  text-xs
                  bg-gray-200
                  text-black
                  px-2
                  rounded
                "
                    >
                      {counts[item.id]}
                    </span>
                  )}
                </div>
              </li>
            ))}

            {/* ADD NEW LIST */}
            <li
              onClick={() => setShowListModal(true)}
              className="
                text-blue-400
                cursor-pointer
                px-2
                py-1
                hover:bg-gray-100
                hover:text-black
                rounded
                transition
              "
            >
              + Add New List
            </li>
          </ul>

          {/* PRIORITY */}

          {/* PRIORITY */}

          <h2 className="text-xs font-semibold text-gray-400 uppercase mt-6 mb-2">
            Priority
          </h2>

          <ul className="flex flex-col gap-2">
            {/* LOW */}

            <li
              onClick={() => setActiveMenu("priority-low")}
              className={`
      flex
      justify-between
      items-center
      cursor-pointer
      px-2
      py-1
      rounded
      transition-all
      duration-200
      ${
        activeMenu === "priority-low"
          ? "bg-gray-100 text-black font-semibold"
          : "hover:bg-gray-100 hover:text-black text-slate-200"
      }
    `}
            >
              <span className="flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-green-400" />
                <span className="text-sm">Low</span>
              </span>

              {counts["priority-low"] > 0 && (
                <span
                  className="
        text-xs
        bg-gray-200
        text-black
        px-2
        rounded
      "
                >
                  {counts["priority-low"]}
                </span>
              )}
            </li>

            {/* MEDIUM */}

            <li
              onClick={() => setActiveMenu("priority-medium")}
              className={`
      flex
      justify-between
      items-center
      cursor-pointer
      px-2
      py-1
      rounded
      transition-all
      duration-200
      ${
        activeMenu === "priority-medium"
          ? "bg-gray-100 text-black font-semibold"
          : "hover:bg-gray-100 hover:text-black text-slate-200"
      }
    `}
            >
              <span className="flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-yellow-400" />
                <span className="text-sm">Medium</span>
              </span>

              {counts["priority-medium"] > 0 && (
                <span
                  className="
        text-xs
        bg-gray-200
        text-black
        px-2
        rounded
      "
                >
                  {counts["priority-medium"]}
                </span>
              )}
            </li>

            {/* HIGH */}

            <li
              onClick={() => setActiveMenu("priority-high")}
              className={`
      flex
      justify-between
      items-center
      cursor-pointer
      px-2
      py-1
      rounded
      transition-all
      duration-200
      ${
        activeMenu === "priority-high"
          ? "bg-gray-100 text-black font-semibold"
          : "hover:bg-gray-100 hover:text-black text-slate-200"
      }
    `}
            >
              <span className="flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-red-400" />
                <span className="text-sm">High</span>
              </span>

              {counts["priority-high"] > 0 && (
                <span
                  className="
        text-xs
        bg-gray-200
        text-black
        px-2
        rounded
      "
                >
                  {counts["priority-high"]}
                </span>
              )}
            </li>
          </ul>

          {/* TAGS */}

          <div className="mt-6">
            <h2
              className="
          text-xs
          font-semibold
          text-gray-400
          uppercase
          mb-2
        "
            >
              Tags
            </h2>

            <div
              className="
          flex
          flex-wrap
          gap-2
        "
            >
              {tags.map((tag) => (
                <div key={tag.id} className="group">
                  <div
                    onClick={() => setActiveMenu(`tag-${tag.id}`)}
                    className={`
                  ${tag.color}
                  text-slate-900
                  px-3
                  py-1
                  rounded
                  text-xs
                  cursor-pointer
                  flex
                  items-center
                  gap-1.5
                  transition
                  hover:scale-105
                  ${
                    activeMenu === `tag-${tag.id}` ? "ring-2 ring-white/70" : ""
                  }
                `}
                  >
                    <span>{tag.label}</span>

                    {/* EXCLUIR */}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setSelectedTag(tag);
                        setShowDeleteTagModal(true);
                      }}
                      className="
                    opacity-0
                    group-hover:opacity-100
                    transition
                    hover:text-red-700
                  "
                      title="Excluir tag"
                    >
                      <Trash2 size={12} />
                    </button>

                    {/* CONTADOR */}

                    {counts[`tag-${tag.id}`] > 0 && (
                      <span
                        className="
                    ml-1
                    font-semibold
                  "
                      >
                        {counts[`tag-${tag.id}`]}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* ADD TAG */}

              <span
                onClick={() => setShowTagModal(true)}
                className="
              bg-gray-200
              text-gray-600
              px-3
              py-1
              rounded
              text-xs
              cursor-pointer
              hover:bg-white
              transition
            "
              >
                + Add Tag
              </span>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-auto flex flex-col gap-2 pt-6">
            <button
              onClick={handleSignOutClick}
              className="
            flex
            items-center
            gap-2
            text-slate-300
            hover:text-red-400
            transition
            text-sm
          "
            >
              <LogOut size={18} />
              <span>Sign out</span>
            </button>
          </div>

          {showListModal && (
            <ListModal
              onClose={() => setShowListModal(false)}
              onSave={handleCreateList}
            />
          )}

          {showTagModal && (
            <TagModal
              onClose={() => setShowTagModal(false)}
              onSave={handleCreateTag}
            />
          )}

          {showDeleteListModal && (
            <Modal
              title="Excluir Lista"
              message={`Tem certeza que deseja excluir a lista "${selectedList?.label}"? `}
              confirmText="Excluir lista"
              cancelText="Cancelar"
              onCancel={() => {
                setShowDeleteListModal(false);
                setSelectedList(null);
              }}
              onConfirm={confirmDeleteList}
            />
          )}

          {showDeleteTagModal && (
            <Modal
              title="Excluir Tag"
              message={
                <div className="text-slate-300">
                  <p>
                    Tem certeza que deseja excluir a tag{" "}
                    <span
                      className={`
                        inline-flex
                        items-center
                        px-2.5
                        py-1
                        mx-1
                        rounded-lg
                        text-sm
                        font-semibold
                        text-slate-900
                        ${selectedTag.color}
                        shadow-sm
                        align-middle
                      `}
                    >
                      {selectedTag.label}
                    </span>
                    ?
                  </p>
                </div>
              }
              confirmText="Excluir tag"
              cancelText="Cancelar"
              onCancel={() => {
                setShowDeleteTagModal(false);
                setSelectedTag(null);
              }}
              onConfirm={handleDeleteTag}
            />
          )}
        </>
      )}
    </aside>
  );
}
