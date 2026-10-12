import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token de autenticação não informado." });
    return;
  }

  const token = authorization.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ message: "Configuração de autenticação ausente." });
    return;
  }

  try {
    const payload = jwt.verify(token, secret);

    if (
      typeof payload === "string" ||
      !payload.sub ||
      typeof payload.sub !== "string"
    ) {
      res.status(401).json({ message: "Token inválido." });
      return;
    }

    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido ou expirado." });
  }
}
