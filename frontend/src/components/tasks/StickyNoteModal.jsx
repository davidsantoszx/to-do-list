import { useState } from "react";

export default function StickyNoteModal({
  note,
  onClose,
  onSave
}) {
  const [title, setTitle] = useState(
    note?.title || ""
  );

  const [content, setContent] = useState(
    note?.content?.join("\n") || ""
  );

 
  const [selectedColor, setSelectedColor] = useState(
    note?.color || "bg-yellow-200"
  );

  
  const colors = [
    "bg-red-200",
    "bg-blue-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-purple-200",
    "bg-orange-200"
  ];

  function handleSubmit() {
    onSave({
      ...note,
      title,

      content: content
        .split("\n")
        .filter(item => item.trim()),

    
      color: selectedColor
    });
  }



  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 w-[500px]">

        <h2 className="text-2xl font-semibold text-white mb-5">
          {note
            ? "Editar Nota"
            : "Nova Nota"}
        </h2>

        <div className="flex flex-col gap-4">

          {/* TÍTULO */}
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="
              bg-slate-700
              border
              border-slate-600
              rounded
              p-3
              text-white
            "
          />

          {/* CONTEÚDO */}
          <textarea
            rows="6"
            placeholder="Conteúdo"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="
              bg-slate-700
              border
              border-slate-600
              rounded
              p-3
              text-white
            "
          />

         
          <div>
            <p className="text-slate-300 mb-3">
              Cor da nota
            </p>

            <div className="flex gap-3">

              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setSelectedColor(color)
                  }
                  className={`
                    w-10
                    h-10
                    rounded-full
                    ${color}
                    border-4
                    transition-all
                    duration-200
                    ${
                      selectedColor === color
                        ? "border-white scale-110"
                        : "border-transparent"
                    }
                  `}
                />
              ))}

            </div>
          </div>

          {/* BOTÕES */}
          <div className="flex justify-end gap-3">

            <button
              onClick={onClose}
              className="
                px-4
                py-2
                rounded
                bg-slate-600
                hover:bg-slate-500
                transition
              "
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              className="
                px-4
                py-2
                rounded
                bg-blue-500
                text-white
                hover:bg-blue-600
                transition
              "
            >
              Salvar
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}