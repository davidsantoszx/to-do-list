import { useState } from "react";
import { CalendarClock, X } from "lucide-react";

export default function RescheduleModal({
  task,
  onClose,
  onSave,
}) {
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  const [dueTime, setDueTime] = useState(
    task?.dueTime || "23:59"
  );
  const [error, setError] = useState("");

  function handleSave() {
    if (!dueDate) {
      setError("Informe uma nova data.");
      return;
    }

    const selectedDateTime = new Date(
      `${dueDate}T${dueTime || "23:59"}`
    );

    const now = new Date();

    if (selectedDateTime <= now) {
      setError(
        "A nova data e horário precisam ser posteriores ao momento atual."
      );
      return;
    }

    setError("");

    onSave({
      ...task,
      dueDate,
      dueTime: dueTime || "23:59",
    });
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/60
        backdrop-blur-sm
        p-4
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-md
          bg-slate-800
          border
          border-slate-600
          rounded-2xl
          shadow-2xl
          p-6
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-blue-500/10
                text-blue-400
                flex
                items-center
                justify-center
              "
            >
              <CalendarClock size={21} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Reagendar tarefa
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                {task?.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              w-9
              h-9
              rounded-lg
              flex
              items-center
              justify-center
              text-slate-400
              hover:text-white
              hover:bg-slate-700
              transition
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* DATA */}

        <div className="space-y-5">
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
              Nova data
            </label>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setError("");
              }}
              className="
                w-full
                bg-slate-900
                border
                border-slate-700
                rounded-xl
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
              "
            />
          </div>

          {/* HORÁRIO */}

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
              Novo horário
            </label>

            <input
              type="time"
              value={dueTime}
              onChange={(e) => {
                setDueTime(e.target.value);
                setError("");
              }}
              className="
                w-full
                bg-slate-900
                border
                border-slate-700
                rounded-xl
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
              "
            />
          </div>

          {/* ERRO */}

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* ACTIONS */}

        <div
          className="
            flex
            justify-end
            gap-3
            mt-7
            pt-5
            border-t
            border-slate-700
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              px-5
              py-2.5
              rounded-xl
              bg-slate-700
              hover:bg-slate-600
              text-slate-200
              transition
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="
              px-5
              py-2.5
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-medium
              transition
            "
          >
            Reagendar
          </button>
        </div>
      </div>
    </div>
  );
}

