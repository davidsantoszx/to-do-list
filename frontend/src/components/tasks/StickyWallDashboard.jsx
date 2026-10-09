import { useEffect, useState } from "react";
import { useTasks } from "../../context/TaskContext";
import stickyNotes from "../../data/stickyNotes";

import StickyNoteCard from "./StickyNoteCard";
import StickyNoteModal from "./StickyNoteModal";
import Modal from "../layout/Modal";
import toast from "react-hot-toast";

import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";

import {
  SortableContext,
  rectSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";

export default function StickyWallDashboard() {

  const {
    setStickyNotesCount
  } = useTasks();

  const [notes, setNotes] =
    useState(stickyNotes);

  const [showNoteModal, setShowNoteModal] =
    useState(false);

  const [selectedNote, setSelectedNote] =
    useState(null);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);


  /*
   * Recupera as notas salvas
   */
  useEffect(() => {

    const savedNotes =
      localStorage.getItem("stickyNotes");

    if (savedNotes) {

      try {

        const parsedNotes =
          JSON.parse(savedNotes);

        if (Array.isArray(parsedNotes)) {
          setNotes(parsedNotes);
        }

      } catch (error) {

        console.error(
          "Erro ao carregar Sticky Notes:",
          error
        );

      }

    }

  }, []);


  /*
   * Sempre que a quantidade de notas mudar:
   *
   * 1. Salva as notas
   * 2. Atualiza o contador da Sidebar
   */
  useEffect(() => {

    localStorage.setItem(
      "stickyNotes",
      JSON.stringify(notes)
    );

    setStickyNotesCount(
      notes.length
    );

  }, [notes, setStickyNotesCount]);


  function handleCreate() {

    setSelectedNote(null);

    setShowNoteModal(true);

  }


  function handleEdit(note) {

    setSelectedNote(note);

    setShowNoteModal(true);

  }


  function handleDelete(note) {

    setSelectedNote(note);

    setShowDeleteModal(true);

  }


  function confirmDelete() {

    setNotes(prev =>
      prev.filter(
        note =>
          note.id !== selectedNote.id
      )
    );

    toast.success(
      "Nota excluída."
    );

    setShowDeleteModal(false);

    setSelectedNote(null);

  }


  function saveNote(noteData) {

    if (selectedNote) {

      setNotes(prev =>
        prev.map(note =>
          note.id === selectedNote.id
            ? {
                ...note,
                ...noteData
              }
            : note
        )
      );

      toast.success(
        "Nota atualizada."
      );

    } else {

      const newNote = {
        id: Date.now(),
        ...noteData
      };

      setNotes(prev => [
        ...prev,
        newNote
      ]);

      toast.success(
        "Nota criada."
      );

    }

    setShowNoteModal(false);

    setSelectedNote(null);

  }


  function duplicateNote(note) {

    const duplicated = {
      ...note,
      id: Date.now(),
      title: `${note.title} (cópia)`
    };

    setNotes(prev => [
      ...prev,
      duplicated
    ]);

    toast.success(
      "Nota duplicada."
    );

  }


  function togglePinned(note) {

    setNotes(prev => {

      const updated =
        prev.map(item =>
          item.id === note.id
            ? {
                ...item,
                pinned: !item.pinned
              }
            : item
        );

      updated.sort((a, b) => {

        return (
          (b.pinned || false) -
          (a.pinned || false)
        );

      });

      return updated;

    });

    toast.success(
      note.pinned
        ? "Nota desafixada."
        : "Nota fixada."
    );

  }


  function handleDragEnd(event) {

    const {
      active,
      over
    } = event;

    if (!over) {
      return;
    }

    if (active.id !== over.id) {

      setNotes(items => {

        const oldIndex =
          items.findIndex(
            item =>
              item.id === active.id
          );

        const newIndex =
          items.findIndex(
            item =>
              item.id === over.id
          );

        return arrayMove(
          items,
          oldIndex,
          newIndex
        );

      });

      toast.success(
        "Nota movida."
      );

    }

  }


  return (
    <>

      <div
        className="
          bg-slate-800/40
          border
          border-slate-600
          rounded
          p-6
        "
      >

        <DndContext
          collisionDetection={
            closestCenter
          }
          onDragEnd={handleDragEnd}
        >

          <SortableContext
            items={notes.map(
              note => note.id
            )}
            strategy={
              rectSortingStrategy
            }
          >

            <div
              className="
                grid
                grid-cols-3
                gap-6
              "
            >

              {notes.map(note => (

                <StickyNoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDuplicate={
                    duplicateNote
                  }
                  onTogglePinned={
                    togglePinned
                  }
                />

              ))}


              <button
                onClick={handleCreate}
                className="
                  bg-slate-700/40
                  border
                  border-slate-500
                  rounded-lg
                  min-h-[220px]
                  flex
                  items-center
                  justify-center
                  text-5xl
                  text-slate-300
                  hover:bg-slate-700/60
                  transition
                "
              >
                +
              </button>

            </div>

          </SortableContext>

        </DndContext>

      </div>


      {showNoteModal && (

        <StickyNoteModal
          note={selectedNote}

          onClose={() => {
            setShowNoteModal(false);
            setSelectedNote(null);
          }}

          onSave={saveNote}
        />

      )}


      {showDeleteModal && (

        <Modal
          title="Excluir nota"
          message="Deseja realmente excluir esta nota?"
          confirmText="Excluir"
          cancelText="Cancelar"

          onConfirm={confirmDelete}

          onCancel={() =>
            setShowDeleteModal(false)
          }
        />

      )}

    </>
  );

}