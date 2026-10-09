export default function Input({
  label, type = "text", placeholder, value, onChange, className = ""
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-semibold text-gray-300">
          {label}
        </label>
      )} 

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`border border-gray-300 px-3 py-2 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-gray-400
          ${className}`}
      />
    </div>
  );
}
