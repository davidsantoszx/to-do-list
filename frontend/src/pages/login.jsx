import React, { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import eleve from "../assets/imgs/elevate.png";


import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isPasswordStrong = password.length >= 6;

  const navigate = useNavigate();

  const handleRegisterClick = () => {
    setIsRegistering(!isRegistering);
    setError("");
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // =========================
    // CADASTRO
    // =========================
    if (isRegistering) {
      if (!name.trim()) return showError("Por favor, insira seu nome.");
      if (!email.trim()) return showError("Informe um e-mail válido.");
      if (!password.trim()) return showError("A senha não pode ser vazia.");
      if (password !== confirmPassword)
        return showError("As senhas não coincidem.");

      try {
        setLoading(true);

        const response = await fetch(
          "http://26.51.220.173:2020/v1/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              username: name,
              email,
              password
            })
          }
        );

        if (!response.ok) {
          throw new Error("Erro no cadastro");
        }

        alert("Cadastro realizado com sucesso!");
        setIsRegistering(false);
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

      } catch (err) {
        showError("Erro ao cadastrar. Verifique os dados.");
      } finally {
        setLoading(false);
      }

      return;
    }

    // =========================
    // LOGIN
    // =========================
    try {
  setLoading(true);

  const response = await fetch(
    "http://26.51.220.173:2020/v1/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    }
  );

  if (!response.ok) {
    throw new Error("Login inválido");
  }

  
  const token = await response.text();

  console.log("Token recebido:", token);

  if (!token) {
    throw new Error("Token não retornado pelo backend");
  }

  // salva token
  localStorage.setItem("token", token);

  console.log("Redirecionando para /home...");

  // redireciona pra pagina principal
  navigate("/home");

} catch (err) {
  console.error("Erro no login:", err);
  showError("Erro ao realizar o login.");
} finally {
  setLoading(false);
}}

  // =========================
  // JSX
  // =========================
  return (
    <div className="min-h-screen flex items-center justify-center
  bg-gradient-to-br from-slate-800 via-gray-800 to-black p-4">
      <div className="flex w-full max-w-2xl h-[520px] bg-gray shadow-xl rounded-2xl overflow-hidden">

        {/* LADO ESQUERDO */}
        <div className="w-1/2 bg-black relative overflow-hidden">
          <img
            src={eleve}
            alt="eleve"
            className="w-full h-full object-cover object-left"
          />
        <div className="absolute bottom-4 right-6 text-right">
        <p className="text-sm font-semibold text-gray-400 leading-tight">
          Menos caos.<br />
          Mais foco.
        </p>
      </div>
          
          
        </div>

        {/* LADO DIREITO */}
        <div className="w-1/2 p-9 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold text-gray-100 mb-6">
            {isRegistering ? "Cadastrar" : "Entrar"}
          </h2>

          <div className="min-h-[2px] mb-4">
            {error && (
              <div className="bg-red-200 text-red-800 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className={`flex flex-col gap-2 ${
              isRegistering ? "mt-6" : "mt-0"
            }`}>
            {isRegistering && (
              <Input
                label="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <Input
              label="E-mail"
              type="email"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
            />

            {isRegistering && (
              <Input
                className="text-gray-400 font-bold "
                label="Confirmar Senha "
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}

            {isRegistering && password && (
              <p className={`text-xs ${
                isPasswordStrong ? "text-green-600" : "text-red-500"
              }`}>
                {isPasswordStrong
                  ? "Senha forte"
                  : "Senha fraca (mín. 6 caracteres)"}
              </p>
            )}




            <Button
              type="submit"
              disabled={loading}
              className="text-gray-400 font-bold mt-4"
            >
              {loading
                ? "Processando..."
                : isRegistering
                ? "Cadastrar"
                : "Entrar"}
            </Button>

            <p
              className="text-sm mt-4 text-center text-gray-600 cursor-pointer font-semibold"
              onClick={handleRegisterClick}
            >
              {isRegistering
                ? "Já tem uma conta? Faça login"
                : "Cadastre-se"}
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}
