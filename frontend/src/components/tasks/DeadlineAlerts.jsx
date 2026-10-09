import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useTasks } from "../../context/TaskContext";

export default function DeadlineAlerts() {
  const { tasks } = useTasks();

  const [alerts, setAlerts] = useState([]);

  /*
   * ==========================================
   * CONFIGURAÇÃO DOS ALERTAS
   * ==========================================
   *
   * Futuramente você pode adicionar:
   *
   * { minutes: 5, label: "5 minutos" },
   * { minutes: 1, label: "1 minuto" },
   *
   * sem precisar alterar o restante da lógica.
   */

  const deadlineAlerts = [
    {
      minutes: 60,
      label: "1 hora"
    },
    {
      minutes: 30,
      label: "30 minutos"
    }
  ];

  /*
   * Guarda quais alertas já foram exibidos.
   *
   * Exemplo:
   *
   * 123-2026-08-15-14:00-60
   * 123-2026-08-15-14:00-30
   *
   * Isso impede que o mesmo alerta apareça
   * novamente a cada verificação.
   */

  const [shownAlerts, setShownAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "taskDeadlineAlerts"
      );

      return saved
        ? JSON.parse(saved)
        : [];
    } catch {
      return [];
    }
  });

  /*
   * Salva os alertas exibidos.
   */

  useEffect(() => {
    localStorage.setItem(
      "taskDeadlineAlerts",
      JSON.stringify(shownAlerts)
    );
  }, [shownAlerts]);

  /*
   * ==========================================
   * VERIFICA PRAZOS
   * ==========================================
   */

  useEffect(() => {
    function checkDeadlines() {
      const now = new Date();

      tasks.forEach(task => {
        /*
         * Task concluída não gera alerta.
         */

        if (task.completed) {
          return;
        }

        /*
         * Task sem data não gera alerta.
         */

        if (!task.dueDate) {
          return;
        }

        /*
         * Se não houver horário,
         * considera 23:59.
         */

        const dueDateTime = new Date(
          `${task.dueDate}T${task.dueTime || "23:59"}`
        );

        /*
         * Diferença em milissegundos.
         */

        const difference =
          dueDateTime.getTime() -
          now.getTime();

        /*
         * Se já expirou, não alerta.
         */

        if (difference <= 0) {
          return;
        }

        /*
         * ======================================
         * VERIFICA CADA ALERTA CONFIGURADO
         * ======================================
         */

        deadlineAlerts.forEach(alertConfig => {
          const alertTime =
            alertConfig.minutes * 60 * 1000;

          /*
           * Tolerância de 15 segundos.
           *
           * Como a verificação acontece a cada
           * 10 segundos, isso evita perder o
           * momento exato.
           *
           * Exemplo:
           *
           * 60:00
           * 59:59
           * 59:50
           *
           * ainda pode disparar.
           *
           * Mas 59 minutos NÃO dispara.
           */

          const tolerance = 6000;

          const reachedAlertTime =
            difference <= alertTime &&
            difference > alertTime - tolerance;

          if (!reachedAlertTime) {
            return;
          }

          /*
           * Identificador único daquele alerta.
           *
           * Se a mesma task tiver 1h e 30min,
           * serão dois alertas diferentes.
           */

          const alertKey =
            `${task.id}-${task.dueDate}-${task.dueTime || "23:59"}-${alertConfig.minutes}`;

          /*
           * Já apareceu?
           */

          if (shownAlerts.includes(alertKey)) {
            return;
          }

          /*
           * Mostra o alerta.
           */

          showAlert(
            task,
            alertConfig.label
          );

          /*
           * Marca como exibido.
           */

          setShownAlerts(prev => {
            if (prev.includes(alertKey)) {
              return prev;
            }

            return [
              ...prev,
              alertKey
            ];
          });
        });
      });
    }

    /*
     * Executa imediatamente.
     */

    checkDeadlines();

    /*
     * Depois verifica a cada 10 segundos.
     */

    const interval = setInterval(
      checkDeadlines,
      1000
    );

    return () => {
      clearInterval(interval);
    };

  }, [tasks, shownAlerts]);

  /*
   * ==========================================
   * CRIA ALERTA VISUAL
   * ==========================================
   */

  function showAlert(
    task,
    remainingText
  ) {
    const id =
      `${task.id}-${Date.now()}`;

    setAlerts(prev => [
      ...prev,
      {
        id,
        taskTitle: task.title,
        remainingText
      }
    ]);

    /*
     * Remove automaticamente depois
     * de 4 segundos.
     */

    setTimeout(() => {
      setAlerts(prev =>
        prev.filter(
          alert => alert.id !== id
        )
      );
    }, 6000);
  }

  /*
   * ==========================================
   * FECHAR MANUALMENTE
   * ==========================================
   */

  function removeAlert(id) {
    setAlerts(prev =>
      prev.filter(
        alert => alert.id !== id
      )
    );
  }


  const toastAnimation = `
  @keyframes deadlineToastIn {
    0% {
      opacity: 0;
      transform: translateY(70px);
    }

    60% {
      opacity: 1;
      transform: translateY(-8px);
    }

    80% {
      transform: translateY(3px);
    }

    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes deadlineToastFloat {
    0% {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-3px);
    }

    100% {
      transform: translateY(0);
    }
  }
`;


  return (
    
    <>
    <style>{toastAnimation}</style>

    <div
      className="
        fixed
        bottom-6
        right-6
        z-[9999]
        flex
        flex-col
        gap-3
        pointer-events-none
      "
    >

      {alerts.map(alert => (

        <div
          key={alert.id}
          className="
            pointer-events-auto
            w-[360px]
            rounded-xl
            border
            border-yellow-400/30
            bg-slate-900
            shadow-2xl
            shadow-black/40
            overflow-hidden
           
          "
        style={{
            animation:
                "deadlineToastIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards"
            }}


        >

          <div className="p-4">

            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                mb-3
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-yellow-400
                  font-semibold
                "
              >

                <AlertTriangle
                  size={18}
                  strokeWidth={2.5}
                />

                Atenção

              </div>

              <button
                onClick={() =>
                  removeAlert(alert.id)
                }
                className="
                  text-slate-500
                  hover:text-white
                  transition
                "
              >

                <X size={17} />

              </button>

            </div>


            {/* MENSAGEM */}

            <p
              className="
                text-sm
                text-slate-200
                leading-relaxed
              "
            >

              A task{" "}

              <span
                className="
                  font-semibold
                  text-white
                "
              >
                "{alert.taskTitle}"
              </span>{" "}

              está a{" "}

              <span
                className="
                  font-semibold
                  text-yellow-400
                "
              >
                {alert.remainingText}
              </span>{" "}

              de expirar.

            </p>

          </div>


          {/* BARRA DE TEMPO */}

          <div
            className="
              h-1
              bg-yellow-400/20
            "
          >

            <div
              className="
                h-full
                bg-yellow-400
                animate-deadline-progress
              "
            />

          </div>

        </div>

      ))}

    </div>
    </>
  );
   
}