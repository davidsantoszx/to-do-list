import { useState } from "react";
import toast from "react-hot-toast";

export default function ListModal({
  onClose,
  onSave
}) {
  const [name, setName] = useState("");

  const colors = [
    "bg-red-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-purple-400"
  ];

  const [color, setColor] = useState(colors[0]);

  function handleSave() {

  if (!name.trim()) {

    toast.error("Informe um nome para a lista.", {
      duration: 3000
    });

    return;
  }

  onSave({
    id: name.toLowerCase().replace(/\s/g, ""),
    label: name.trim(),
    color
  });

}

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-slate-800 p-6 rounded-xl w-96">

        <h2 className="text-xl font-semibold mb-4 text-white">
          Nova Lista
        </h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da lista"
          className="w-full p-3 rounded bg-slate-700 mb-4"
        />

        <div className="flex gap-2 mb-6">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full ${c}`}
            />
          ))}
        </div>

        <div className="flex justify-end gap-2">

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 rounded"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 rounded" 
          >
            Criar
          </button>

        </div>
      </div>

    </div>
  );
}