import nodemailer from 'nodemailer';
import { prisma } from '../db/client.js';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send email and log to database
 */
export async function sendEmail(data: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  userId: string;
  folderId?: string;
  type?: string;
}) {
  try {
    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Moverz'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text || stripHtml(data.html),
    });

    // Log success to database
    const emailLog = await prisma.emailLog.create({
      data: {
        type: (data.type as any) || 'OTHER',
        sentById: data.userId,
        recipientEmail: data.to,
        subject: data.subject,
        bodyHtml: data.html,
        bodyText: data.text || stripHtml(data.html),
        status: 'SENT',
        sentAt: new Date(),
        folderId: data.folderId || null,
      },
    });

    return {
      success: true,
      emailLogId: emailLog.id,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Email sending failed:', error);

    // Log failure to database
    await prisma.emailLog.create({
      data: {
        type: (data.type as any) || 'OTHER',
        sentById: data.userId,
        recipientEmail: data.to,
        subject: data.subject,
        bodyHtml: data.html,
        bodyText: data.text,
        status: 'FAILED',
        folderId: data.folderId || null,
      },
    });

    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

