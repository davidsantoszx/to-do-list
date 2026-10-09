export function getTaskSection(task) {
  if (!task.dueDate) return "today";

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  // Converte YYYY-MM-DD para uma data LOCAL,
  // evitando problemas de timezone do JavaScript.
  const [year, month, day] = task.dueDate.split("-").map(Number);

  const due = new Date(year, month - 1, day);

  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (due - today) / (1000 * 60 * 60 * 24)
  );

  // Tarefa atrasada
  if (diffDays < 0) return "overdue";

  // Hoje
  if (diffDays === 0) return "today";

  // Amanhã
  if (diffDays === 1) return "tomorrow";

  // Próximos 7 dias
  if (diffDays >= 2 && diffDays <= 7) return "week";

  // Mais de 7 dias
  return "future";
}