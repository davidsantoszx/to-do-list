import { useState } from "react";

const tagColors = [
  "bg-cyan-300",
  "bg-red-300",
  "bg-yellow-300",
  "bg-green-300",
  "bg-blue-300",
  "bg-purple-300",
  "bg-pink-300",
  "bg-orange-300",
];

export default function TagModal({ onClose, onSave }) {
  const [tagName, setTagName] = useState("");

  const [selectedColor, setSelectedColor] = useState(tagColors[0]);

  function handleSave() {
    if (!tagName.trim()) {
      return;
    }

    onSave({
      id: Date.now(),
      label: tagName.trim(),
      color: selectedColor,
    });
  }

  return (
    <div
      className="
      fixed
      inset-0
      bg-black/60
      flex
      items-center
      justify-center
      z-50
    "
    >
      <div
        className="
        bg-slate-800
        border
        border-slate-700
        rounded-xl
        w-96
        p-6
      "
      >
        <h2
          className="
          text-xl
          font-semibold
          text-white
          mb-6
        "
        >
          New Tag
        </h2>

        {/* NOME */}

        <input
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          placeholder="Tag name"
          className="
            w-full
            bg-slate-700
            border
            border-slate-600
            rounded-lg
            p-3
            outline-none
            text-white
            placeholder:text-slate-400
            focus:border-blue-500
          "
        />

        {/* COR */}

        <div className="mt-6">
          <label
            className="
            block
            text-xs
            uppercase
            tracking-wider
            text-slate-400
            mb-3
            font-semibold
          "
          >
            Color
          </label>

          <div
            className="
            flex
            flex-wrap
            gap-3
          "
          >
            {tagColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`
                  w-8
                  h-8
                  rounded-full
                  ${color}
                  transition
                  hover:scale-110
                  ${
                    selectedColor === color
                      ? "ring-2 ring-white ring-offset-2 ring-offset-slate-800"
                      : ""
                  }
                `}
              />
            ))}
          </div>
        </div>

        {/* PREVIEW */}

        <div className="mt-5">
          <p
            className="
            text-xs
            uppercase
            tracking-wider
            text-slate-400
            mb-2
            font-semibold
          "
          >
            Preview
          </p>

          <span
            className={`
            inline-flex
            px-3
            py-1
            rounded
            text-xs
            text-slate-900
            ${selectedColor}
          `}
          >
            {tagName.trim() || "Tag name"}
          </span>
        </div>

        {/* ACTIONS */}

        <div
          className="
          flex
          justify-end
          gap-3
          mt-7
        "
        >
          <button
            onClick={onClose}
            className="
              px-4
              py-2
              rounded-lg
              bg-slate-700
              hover:bg-slate-600
              transition
              text-white
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="
              px-4
              py-2
              rounded-lg
              bg-blue-600
              hover:bg-blue-700
              transition
              text-white
            "
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
