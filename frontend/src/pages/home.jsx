import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Modal from "../components/layout/Modal";
import TaskSection from "../components/tasks/TaskSection";
import { useTasks } from "../context/TaskContext";
import DeadlineAlerts from "../components/tasks/DeadlineAlerts";

export default function Home() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { activeMenu, setActiveMenu, counts, titles } = useTasks();

  const confirmSignOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleSignOutClick={() => setShowModal(true)}
        counts={counts}
      />

      <TaskSection
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <DeadlineAlerts />

      {showModal && (
        <Modal
           title="Sair da conta"
  message="Deseja realmente encerrar sua sessão?"
  confirmText="Sair"
  cancelText="Cancelar"
  onConfirm={confirmSignOut}
  onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}