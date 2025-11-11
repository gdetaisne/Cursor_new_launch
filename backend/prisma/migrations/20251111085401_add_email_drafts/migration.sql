-- CreateTable
CREATE TABLE "EmailDraft" (
    "id" TEXT NOT NULL,
    "to" TEXT[],
    "cc" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bcc" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "authorId" TEXT,
    "folderId" TEXT,
    "inReplyToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailDraft_authorId_idx" ON "EmailDraft"("authorId");

-- CreateIndex
CREATE INDEX "EmailDraft_folderId_idx" ON "EmailDraft"("folderId");

-- AddForeignKey
ALTER TABLE "EmailDraft" ADD CONSTRAINT "EmailDraft_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailDraft" ADD CONSTRAINT "EmailDraft_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailDraft" ADD CONSTRAINT "EmailDraft_inReplyToId_fkey" FOREIGN KEY ("inReplyToId") REFERENCES "EmailLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
