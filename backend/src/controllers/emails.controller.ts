import type { Request, Response } from 'express';
import { sendEmail } from '../services/email.service.js';
import { sendEmailSchema } from '../schemas/email.schema.js';
import { prisma } from '../db/client.js';
import { getPaginationParams } from '../utils/pagination.js';

/**
 * Send email
 */
export async function sendEmailHandler(req: Request, res: Response) {
  const data = sendEmailSchema.parse(req.body);

  const result = await sendEmail({
    to: data.to,
    subject: data.subject,
    html: data.body,
    userId: req.userId!,
    folderId: data.folderId,
    type: data.type,
  });

  res.status(201).json(result);
}

/**
 * List emails (EmailLog)
 */
export async function listEmailsHandler(req: Request, res: Response) {
  const { page, limit, skip } = getPaginationParams(req);
  const status = req.query.status as string;

  const where: any = {};
  if (status) {
    where.status = status;
  }

  const [logs, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      include: {
        sentByUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        folder: {
          select: {
            id: true,
            originCity: true,
            destCity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.emailLog.count({ where }),
  ]);

  res.json({
    data: logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

