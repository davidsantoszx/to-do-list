import { Router } from "express";
import type { Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import {
  authMiddleware,
  type AuthenticatedRequest,
} from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

const priorities = ["low", "medium", "high"] as const;

type Priority = (typeof priorities)[number];

type TaskBody = {
  title?: unknown;
  description?: unknown;
  completed?: unknown;
  priority?: unknown;
  dueDate?: unknown;
  dueTime?: unknown;
  listId?: unknown;
  parentTaskId?: unknown;
  tagIds?: unknown;
};

const taskInclude = {
  list: true,
  tags: {
    include: {
      tag: true,
    },
  },
  subtasks: {
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  },
  parentTask: true,
} satisfies Prisma.TaskInclude;

function getUserId(req: AuthenticatedRequest): string {
  return req.userId!;
}

function getRouteId(req: AuthenticatedRequest): string | null {
  const id = req.params.id;

  return typeof id === "string" && id.trim() !== "" ? id : null;
}

function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && priorities.includes(value as Priority);
}

function isValidTagIds(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((id: unknown) => typeof id === "string" && id.trim() !== "") &&
    new Set(value).size === value.length
  );
}

function parseOptionalText(
  value: unknown,
  maxLength: number,
): { valid: boolean; value?: string | null } {
  if (value === undefined) {
    return { valid: true };
  }

  if (value === null || value === "") {
    return { valid: true, value: null };
  }

  if (typeof value !== "string" || value.length > maxLength) {
    return { valid: false };
  }

  return { valid: true, value };
}

function parseDueDate(value: unknown): { valid: boolean; value?: Date | null } {
  if (value === undefined) {
    return { valid: true };
  }

  if (value === null || value === "") {
    return { valid: true, value: null };
  }

  if (typeof value !== "string") {
    return { valid: false };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { valid: false };
  }

  return { valid: true, value: date };
}

function parseDueTime(value: unknown): {
  valid: boolean;
  value?: string | null;
} {
  if (value === undefined) {
    return { valid: true };
  }

  if (value === null || value === "") {
    return { valid: true, value: null };
  }

  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    return { valid: false };
  }

  return { valid: true, value };
}

function parseOptionalRelationId(value: unknown): {
  valid: boolean;
  value?: string | null;
} {
  if (value === undefined) {
    return { valid: true };
  }

  if (value === null || value === "") {
    return { valid: true, value: null };
  }

  if (typeof value !== "string" || value.trim() === "") {
    return { valid: false };
  }

  return { valid: true, value };
}

async function userOwnsList(listId: string, userId: string): Promise<boolean> {
  const list = await prisma.taskList.findFirst({
    where: { id: listId, userId },
    select: { id: true },
  });

  return Boolean(list);
}

async function userOwnsTags(
  tagIds: string[],
  userId: string,
): Promise<boolean> {
  if (tagIds.length === 0) {
    return true;
  }

  const count = await prisma.tag.count({
    where: {
      id: { in: tagIds },
      userId,
    },
  });

  return count === tagIds.length;
}

async function findValidParent(
  parentTaskId: string,
  userId: string,
  currentTaskId?: string,
): Promise<boolean> {
  if (parentTaskId === currentTaskId) {
    return false;
  }

  const parent = await prisma.task.findFirst({
    where: {
      id: parentTaskId,
      userId,
      parentTaskId: null,
    },
    select: { id: true },
  });

  return Boolean(parent);
}

function tagConnections(tagIds: string[]) {
  return tagIds.map((tagId) => ({
    tag: {
      connect: { id: tagId },
    },
  }));
}

// GET /api/tasks
// Retorna as tarefas do usuário autenticado.
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);

    const tasks = await prisma.task.findMany({
      where: { userId },
      include: taskInclude,
      orderBy: { createdAt: "desc" },
    });

    return res.json(tasks);
  } catch (error) {
    console.error("Erro ao listar tarefas:", error);
    return res.status(500).json({
      message: "Erro interno ao listar tarefas.",
    });
  }
});

// GET /api/tasks/:id
// Retorna uma tarefa específica do usuário.
router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const taskId = getRouteId(req);

    if (!taskId) {
      return res.status(400).json({
        message: "ID da tarefa inválido.",
      });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
      include: taskInclude,
    });

    if (!task) {
      return res.status(404).json({
        message: "Tarefa não encontrada.",
      });
    }

    return res.json(task);
  } catch (error) {
    console.error("Erro ao buscar tarefa:", error);
    return res.status(500).json({
      message: "Erro interno ao buscar tarefa.",
    });
  }
});

// POST /api/tasks
// Cria uma tarefa, opcionalmente com lista, etiquetas e subtarefa.
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const body = req.body as TaskBody;

    const {
      title,
      description,
      priority,
      dueDate,
      dueTime,
      listId,
      parentTaskId,
      tagIds,
    } = body;

    if (
      typeof title !== "string" ||
      title.trim() === "" ||
      title.length > 200
    ) {
      return res.status(400).json({
        message: "O título é obrigatório e deve ter até 200 caracteres.",
      });
    }

    const parsedDescription = parseOptionalText(description, 5000);
    const parsedDueDate = parseDueDate(dueDate);
    const parsedDueTime = parseDueTime(dueTime);
    const parsedListId = parseOptionalRelationId(listId);
    const parsedParentTaskId = parseOptionalRelationId(parentTaskId);

    if (
      !parsedDescription.valid ||
      !parsedDueDate.valid ||
      !parsedDueTime.valid ||
      !parsedListId.valid ||
      !parsedParentTaskId.valid
    ) {
      return res.status(400).json({
        message: "Um ou mais campos da tarefa são inválidos.",
      });
    }

    if (priority !== undefined && !isPriority(priority)) {
      return res.status(400).json({
        message: "Prioridade inválida. Use low, medium ou high.",
      });
    }

    if (tagIds !== undefined && !isValidTagIds(tagIds)) {
      return res.status(400).json({
        message: "A lista de etiquetas é inválida.",
      });
    }

    const selectedTagIds = tagIds ?? [];

    if (
      !Array.isArray(selectedTagIds) ||
      !(await userOwnsTags(selectedTagIds, userId))
    ) {
      return res.status(400).json({
        message: "Uma ou mais etiquetas não foram encontradas.",
      });
    }

    const selectedListId = parsedListId.value ?? null;

    if (selectedListId && !(await userOwnsList(selectedListId, userId))) {
      return res.status(400).json({
        message: "A lista selecionada não foi encontrada.",
      });
    }

    const selectedParentId = parsedParentTaskId.value ?? null;

    if (
      selectedParentId &&
      !(await findValidParent(selectedParentId, userId))
    ) {
      return res.status(400).json({
        message:
          "A tarefa principal não foi encontrada ou não pode ser usada como pai.",
      });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: parsedDescription.value ?? null,
        priority: isPriority(priority) ? priority : "medium",
        dueDate: parsedDueDate.value ?? null,
        dueTime: parsedDueTime.value ?? null,
        user: {
          connect: { id: userId },
        },
        ...(selectedListId
          ? {
              list: {
                connect: { id: selectedListId },
              },
            }
          : {}),
        ...(selectedParentId
          ? {
              parentTask: {
                connect: { id: selectedParentId },
              },
            }
          : {}),
        ...(selectedTagIds.length > 0
          ? {
              tags: {
                create: tagConnections(selectedTagIds),
              },
            }
          : {}),
      },
      include: taskInclude,
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return res.status(500).json({
      message: "Erro interno ao criar tarefa.",
    });
  }
});

// PATCH /api/tasks/:id
// Atualiza os campos enviados, sem sobrescrever os que foram omitidos.
router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const taskId = getRouteId(req);
    const body = req.body as TaskBody;

    if (!taskId) {
      return res.status(400).json({
        message: "ID da tarefa inválido.",
      });
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
      select: {
        id: true,
        parentTaskId: true,
        _count: {
          select: {
            subtasks: true,
          },
        },
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Tarefa não encontrada.",
      });
    }

    const {
      title,
      description,
      completed,
      priority,
      dueDate,
      dueTime,
      listId,
      parentTaskId,
      tagIds,
    } = body;

    const data: Prisma.TaskUpdateInput = {};

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        title.trim() === "" ||
        title.length > 200
      ) {
        return res.status(400).json({
          message: "O título é obrigatório e deve ter até 200 caracteres.",
        });
      }

      data.title = title.trim();
    }

    if (description !== undefined) {
      const parsed = parseOptionalText(description, 5000);

      if (!parsed.valid) {
        return res.status(400).json({
          message: "A descrição deve ser um texto de até 5000 caracteres.",
        });
      }

      data.description = parsed.value ?? null;
    }

    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        return res.status(400).json({
          message: "O campo completed deve ser booleano.",
        });
      }

      data.completed = completed;
    }

    if (priority !== undefined) {
      if (!isPriority(priority)) {
        return res.status(400).json({
          message: "Prioridade inválida. Use low, medium ou high.",
        });
      }

      data.priority = priority;
    }

    if (dueDate !== undefined) {
      const parsed = parseDueDate(dueDate);

      if (!parsed.valid) {
        return res.status(400).json({
          message: "A data de vencimento é inválida.",
        });
      }

      data.dueDate = parsed.value ?? null;
    }

    if (dueTime !== undefined) {
      const parsed = parseDueTime(dueTime);

      if (!parsed.valid) {
        return res.status(400).json({
          message: "O horário deve estar no formato HH:mm.",
        });
      }

      data.dueTime = parsed.value ?? null;
    }

    if (listId !== undefined) {
      const parsed = parseOptionalRelationId(listId);

      if (!parsed.valid) {
        return res.status(400).json({
          message: "O ID da lista é inválido.",
        });
      }

      if (parsed.value) {
        const ownsList = await userOwnsList(parsed.value, userId);

        if (!ownsList) {
          return res.status(400).json({
            message: "A lista selecionada não foi encontrada.",
          });
        }

        data.list = {
          connect: { id: parsed.value },
        };
      } else {
        data.list = {
          disconnect: true,
        };
      }
    }

    if (parentTaskId !== undefined) {
      const parsed = parseOptionalRelationId(parentTaskId);

      if (!parsed.valid) {
        return res.status(400).json({
          message: "O ID da tarefa principal é inválido.",
        });
      }

      if (parsed.value) {
        if (existingTask._count.subtasks > 0) {
          return res.status(400).json({
            message:
              "Uma tarefa que possui subtarefas não pode virar subtarefa.",
          });
        }

        const validParent = await findValidParent(parsed.value, userId, taskId);

        if (!validParent) {
          return res.status(400).json({
            message:
              "A tarefa principal não foi encontrada ou não pode ser usada como pai.",
          });
        }

        data.parentTask = {
          connect: { id: parsed.value },
        };
      } else {
        data.parentTask = {
          disconnect: true,
        };
      }
    }

    if (tagIds !== undefined) {
      if (!isValidTagIds(tagIds)) {
        return res.status(400).json({
          message: "A lista de etiquetas é inválida.",
        });
      }

      const ownsAllTags = await userOwnsTags(tagIds, userId);

      if (!ownsAllTags) {
        return res.status(400).json({
          message: "Uma ou mais etiquetas não foram encontradas.",
        });
      }

      data.tags = {
        deleteMany: {},
        ...(tagIds.length > 0
          ? {
              create: tagConnections(tagIds),
            }
          : {}),
      };
    }

    const result = await prisma.task.updateMany({
      where: {
        id: taskId,
        userId,
      },
      data,
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: "Tarefa não encontrada.",
      });
    }

    const updatedTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
      include: taskInclude,
    });

    if (!updatedTask) {
      return res.status(404).json({
        message: "Tarefa não encontrada.",
      });
    }

    return res.json(updatedTask);

    return res.json(updatedTask);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    return res.status(500).json({
      message: "Erro interno ao atualizar tarefa.",
    });
  }
});

// DELETE /api/tasks/:id
// Exclui a tarefa do usuário autenticado.
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const taskId = getRouteId(req);

    if (!taskId) {
      return res.status(400).json({
        message: "ID da tarefa inválido.",
      });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
      select: { id: true },
    });

    if (!task) {
      return res.status(404).json({
        message: "Tarefa não encontrada.",
      });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);
    return res.status(500).json({
      message: "Erro interno ao excluir tarefa.",
    });
  }
});

export default router;
