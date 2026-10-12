import { Router } from "express";
import type { Response } from "express";
import prisma from "../lib/prisma";
import {
  authMiddleware,
  type AuthenticatedRequest,
} from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

function getUserId(req: AuthenticatedRequest): string {
  return req.userId!;
}

// Listar listas do usuário
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lists = await prisma.taskList.findMany({
      where: { userId: getUserId(req) },
      include: {
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(lists);
  } catch (error) {
    console.error("Erro ao listar listas:", error);
    res.status(500).json({ message: "Não foi possível listar as listas." });
  }
});

// Criar lista
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, color } = req.body ?? {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100
    ) {
      res.status(400).json({ message: "Informe um nome de até 100 caracteres." });
      return;
    }

    if (color !== undefined && (
      typeof color !== "string" ||
      !/^#[0-9a-fA-F]{6}$/.test(color)
    )) {
      res.status(400).json({ message: "Cor inválida. Use o formato #RRGGBB." });
      return;
    }

    const list = await prisma.taskList.create({
      data: {
        name: name.trim(),
        color: color ?? "#64748b",
        userId: getUserId(req),
      },
    });

    res.status(201).json(list);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({ message: "Você já possui uma lista com esse nome." });
      return;
    }

    console.error("Erro ao criar lista:", error);
    res.status(500).json({ message: "Não foi possível criar a lista." });
  }
});

// Atualizar lista
router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, color } = req.body ?? {};
    const userId = getUserId(req);
    const listId = req.params.id;

    if (typeof listId !== "string") {
      res.status(400).json({ message: "ID da lista inválido." });
      return;
    }

    if (
      name !== undefined &&
      (typeof name !== "string" || !name.trim() || name.trim().length > 100)
    ) {
      res.status(400).json({ message: "Nome da lista inválido." });
      return;
    }

    if (color !== undefined && (
      typeof color !== "string" ||
      !/^#[0-9a-fA-F]{6}$/.test(color)
    )) {
      res.status(400).json({ message: "Cor inválida. Use o formato #RRGGBB." });
      return;
    }

    const existing = await prisma.taskList.findFirst({
      where: { id: listId, userId },
      select: { id: true },
    });

    if (!existing) {
      res.status(404).json({ message: "Lista não encontrada." });
      return;
    }

    const list = await prisma.taskList.update({
      where: { id: listId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(color !== undefined && { color }),
      },
    });

    res.json(list);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({ message: "Você já possui uma lista com esse nome." });
      return;
    }

    console.error("Erro ao atualizar lista:", error);
    res.status(500).json({ message: "Não foi possível atualizar a lista." });
  }
});

// Excluir lista
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const listId = req.params.id;

    if (typeof listId !== "string") {
      res.status(400).json({ message: "ID da lista inválido." });
      return;
    }

    const existing = await prisma.taskList.findFirst({
      where: { id: listId, userId: getUserId(req) },
      select: { id: true },
    });

    if (!existing) {
      res.status(404).json({ message: "Lista não encontrada." });
      return;
    }

    await prisma.taskList.delete({ where: { id: listId } });

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir lista:", error);
    res.status(500).json({ message: "Não foi possível excluir a lista." });
  }
});

export default router;