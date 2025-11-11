import { prisma } from '../db/client.js';
import { sendEmail } from './email.service.js';
import type { EmailDraftInput } from '../schemas/emailDraft.schema.js';

/**
 * Create a new draft
 */
export async function createDraft(data: EmailDraftInput, authorId?: string) {
  return prisma.emailDraft.create({
    data: {
      to: data.to,
      cc: data.cc || [],
      bcc: data.bcc || [],
      subject: data.subject,
      bodyHtml: data.bodyHtml,
      authorId: null, // TODO: Link to real User when auth is ready
      folderId: data.folderId || null,
      inReplyToId: data.inReplyToId || null,
    },
    include: {
      author: {
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
  });
}

/**
 * Update existing draft
 */
export async function updateDraft(
  draftId: string,
  data: Partial<EmailDraftInput>,
  authorId?: string
) {
  // Verify ownership if authorId provided
  if (authorId) {
    const draft = await prisma.emailDraft.findUnique({
      where: { id: draftId },
      select: { authorId: true },
    });
    
    if (draft?.authorId && draft.authorId !== authorId) {
      throw new Error('Unauthorized: not the draft author');
    }
  }

  return prisma.emailDraft.update({
    where: { id: draftId },
    data: {
      ...(data.to && { to: data.to }),
      ...(data.cc && { cc: data.cc }),
      ...(data.bcc && { bcc: data.bcc }),
      ...(data.subject && { subject: data.subject }),
      ...(data.bodyHtml && { bodyHtml: data.bodyHtml }),
      ...(data.folderId && { folderId: data.folderId }),
    },
    include: {
      author: {
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
  });
}

/**
 * Get draft by ID
 */
export async function getDraft(draftId: string) {
  return prisma.emailDraft.findUnique({
    where: { id: draftId },
    include: {
      author: {
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
      inReplyTo: {
        select: {
          id: true,
          subject: true,
          recipient: true,
          sentAt: true,
        },
      },
    },
  });
}

/**
 * List drafts with pagination
 */
export async function listDrafts(params: {
  page: number;
  limit: number;
  authorId?: string;
  folderId?: string;
}) {
  const { page, limit, authorId, folderId } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (authorId) where.authorId = authorId;
  if (folderId) where.folderId = folderId;

  const [drafts, total] = await Promise.all([
    prisma.emailDraft.findMany({
      where,
      include: {
        author: {
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
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.emailDraft.count({ where }),
  ]);

  return {
    data: drafts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Delete draft
 */
export async function deleteDraft(draftId: string, authorId?: string) {
  // Verify ownership if authorId provided
  if (authorId) {
    const draft = await prisma.emailDraft.findUnique({
      where: { id: draftId },
      select: { authorId: true },
    });
    
    if (draft?.authorId && draft.authorId !== authorId) {
      throw new Error('Unauthorized: not the draft author');
    }
  }

  return prisma.emailDraft.delete({
    where: { id: draftId },
  });
}

/**
 * Send draft (convert to EmailLog and delete draft)
 */
export async function sendDraft(draftId: string, userId: string) {
  const draft = await getDraft(draftId);
  
  if (!draft) {
    throw new Error('Draft not found');
  }

  // Send email to all recipients
  const results = [];
  for (const recipient of draft.to) {
    try {
      const result = await sendEmail({
        to: recipient,
        subject: draft.subject,
        html: draft.bodyHtml,
        userId,
        folderId: draft.folderId || undefined,
        type: 'CONTACT_EXCHANGE',
      });
      results.push(result);
    } catch (error) {
      console.error(`Failed to send to ${recipient}:`, error);
      throw error;
    }
  }

  // Delete draft after successful send
  await deleteDraft(draftId);

  return {
    success: true,
    sentCount: results.length,
    emailLogIds: results.map((r) => r.emailLogId),
  };
}

