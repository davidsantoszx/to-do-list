import {
  Pencil,
  Trash2,
  GripVertical
} from "lucide-react";

import { useState } from "react";

import {
  CSS
} from "@dnd-kit/utilities";

import {
  useSortable
} from "@dnd-kit/sortable";

export default function StickyNoteCard({
  note,
  onEdit,
  onDelete,
  onDuplicate,
  onTogglePinned
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: note.id
  });

  const style = {
    transform: CSS.Transform.toString(
      transform
    ),
    transition

    

  };

  const [showMenu, setShowMenu] =
  useState(false);

const [menuPosition, setMenuPosition] =
  useState({
    x: 0,
    y: 0
  });


function handleContextMenu(e) {
  e.preventDefault();

  setMenuPosition({
    x: e.clientX,
    y: e.clientY
  });

  setShowMenu(true);
}


  return (
    <div
      ref={setNodeRef}
      style={style}
      onContextMenu={handleContextMenu}
      className={`
        ${note.color}
        relative
        rounded-lg
        shadow-md
        p-5
        min-h-[220px]
        text-gray-800
        overflow-hidden
        group
        ${
          isDragging
            ? "opacity-50 scale-105 z-50"
            : ""
        }
      `}
    >


      <div
        className="
          absolute
          inset-0
          bg-black/20
          opacity-0
          group-hover:opacity-100
          transition-all
          duration-200
          rounded-lg
        "
      />

      
<div className="relative z-10">

  <div className="flex justify-between items-start mb-4">

    <div className="flex items-center gap-2">

      <button
        {...attributes}
        {...listeners}
        className="
          opacity-0
          group-hover:opacity-100
          transition
          cursor-grab
          active:cursor-grabbing
          p-1
          rounded
          hover:bg-white/30
        "
      >
        <GripVertical size={18} />
      </button>

        {note.pinned && (
        <span
          className="text-sm"
          title="Nota fixada"
        >
          📌
        </span>
      )}

      

      <h3 className="font-bold text-xl">
        {note.title}
      </h3>

    </div>

    <div
      className="
        flex
        gap-2
        opacity-0
        group-hover:opacity-100
        transition
      "
    >
      <button
        onClick={() => onEdit(note)}
        className="
          p-2
          rounded-lg
          bg-white/70
          backdrop-blur-sm
          hover:bg-white
          transition
          shadow-sm
        "
      >
        <Pencil size={16} />
      </button>

      <button
        onClick={() => onDelete(note)}
        className="
          p-2
          rounded-lg
          bg-white/70
          backdrop-blur-sm
          hover:bg-red-500
          hover:text-white
          transition
          shadow-sm
        "
      >
        <Trash2 size={16} />
      </button>
    </div>

  </div>

  <ul className="space-y-1 text-sm">
    {note.content.map((item, index) => (
      <li key={index}>
        • {item}
      </li>
    ))}
  </ul>

</div>

{showMenu && (
  <>
    <div
      className="fixed inset-0 z-40"
      onClick={() =>
        setShowMenu(false)
      }
    />

    <div
      className="
        fixed
        z-50
        bg-slate-800
        border
        border-slate-600
        rounded-lg
        overflow-hidden
        shadow-xl
        min-w-[180px]
      "
      style={{
        left: menuPosition.x,
        top: menuPosition.y
      }}
    >
      <button
        onClick={() => {
          onTogglePinned(note);
          setShowMenu(false);
        }}
        className="
          w-full
          text-left
          px-4
          py-3
          hover:bg-slate-700
          text-white
        "
      >
        {note.pinned
          ? "📌 Desafixar"
          : "📌 Fixar"}
      </button>

      <button
        onClick={() => {
          onDuplicate(note);
          setShowMenu(false);
        }}
        className="
          w-full
          text-left
          px-4
          py-3
          hover:bg-slate-700
          text-white
        "
      >
        📄 Duplicar
      </button>
    </div>
  </>
)}


    </div>

    





  );
}