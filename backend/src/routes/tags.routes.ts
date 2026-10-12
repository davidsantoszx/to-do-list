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

// Listar tags do usuário
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { userId: getUserId(req) },
      include: {
        _count: { select: { tasks: true } },
      },
      orderBy: { name: "asc" },
    });

    res.json(tags);
  } catch (error) {
    console.error("Erro ao listar tags:", error);
    res.status(500).json({ message: "Não foi possível listar as tags." });
  }
});

// Criar tag
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, color } = req.body ?? {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 50
    ) {
      res.status(400).json({ message: "Informe um nome de até 50 caracteres." });
      return;
    }

    if (color !== undefined && (
      typeof color !== "string" ||
      !/^#[0-9a-fA-F]{6}$/.test(color)
    )) {
      res.status(400).json({ message: "Cor inválida. Use o formato #RRGGBB." });
      return;
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color ?? "#8b5cf6",
        userId: getUserId(req),
      },
    });

    res.status(201).json(tag);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({ message: "Você já possui uma tag com esse nome." });
      return;
    }

    console.error("Erro ao criar tag:", error);
    res.status(500).json({ message: "Não foi possível criar a tag." });
  }
});

// Atualizar tag
router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, color } = req.body ?? {};
    const tagId = req.params.id;
    const userId = getUserId(req);

    if (typeof tagId !== "string") {
      res.status(400).json({ message: "ID da tag inválido." });
      return;
    }

    if (
      name !== undefined &&
      (typeof name !== "string" || !name.trim() || name.trim().length > 50)
    ) {
      res.status(400).json({ message: "Nome da tag inválido." });
      return;
    }

    if (color !== undefined && (
      typeof color !== "string" ||
      !/^#[0-9a-fA-F]{6}$/.test(color)
    )) {
      res.status(400).json({ message: "Cor inválida. Use o formato #RRGGBB." });
      return;
    }

    const existing = await prisma.tag.findFirst({
      where: { id: tagId, userId },
      select: { id: true },
    });

    if (!existing) {
      res.status(404).json({ message: "Tag não encontrada." });
      return;
    }

    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(color !== undefined && { color }),
      },
    });

    res.json(tag);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({ message: "Você já possui uma tag com esse nome." });
      return;
    }

    console.error("Erro ao atualizar tag:", error);
    res.status(500).json({ message: "Não foi possível atualizar a tag." });
  }
});

// Excluir tag
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tagId = req.params.id;

    if (typeof tagId !== "string") {
      res.status(400).json({ message: "ID da tag inválido." });
      return;
    }

    const existing = await prisma.tag.findFirst({
      where: { id: tagId, userId: getUserId(req) },
      select: { id: true },
    });

    if (!existing) {
      res.status(404).json({ message: "Tag não encontrada." });
      return;
    }

    await prisma.tag.delete({ where: { id: tagId } });

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir tag:", error);
    res.status(500).json({ message: "Não foi possível excluir a tag." });
  }
});

export default router;