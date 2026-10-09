export default function Button({ children, className = "", ...rest }) { 
  return (
    <button
      className={`px-4 py-2 rounded transition font-medium ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}  
