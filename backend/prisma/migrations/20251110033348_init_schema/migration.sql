-- CreateEnum
CREATE TYPE "EstimationMethod" AS ENUM ('AI_PHOTO', 'FORM', 'MANUAL_ADMIN');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "FolderStatus" AS ENUM ('CREATED', 'QUOTES_REQUESTED', 'QUOTES_PENDING', 'TOP3_READY', 'SENT_TO_CLIENT', 'AWAITING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MoverStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "QuoteSource" AS ENUM ('AUTO_GENERATED', 'EMAIL_PARSED', 'MANUAL');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('REQUESTED', 'REMINDED', 'EMAIL_RECEIVED', 'PARSED_PENDING', 'VALIDATED', 'REJECTED', 'PARSING_FAILED', 'EXPIRED', 'SELECTED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DEPOSIT', 'REMAINING', 'REFUND');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'TRANSFERRED', 'FAILED', 'REFUNDED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATOR', 'MOVER_OWNER', 'MOVER_USER');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('QUOTE_REQUEST', 'QUOTE_REMINDER', 'CLIENT_TOP3', 'PAYMENT_CONFIRMATION', 'CONTACT_EXCHANGE', 'MOVER_INVITATION');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'AWAITING_VALIDATION', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "originAddress" TEXT NOT NULL,
    "originCity" TEXT NOT NULL,
    "originPostalCode" TEXT NOT NULL,
    "destAddress" TEXT NOT NULL,
    "destCity" TEXT NOT NULL,
    "destPostalCode" TEXT NOT NULL,
    "estimatedVolume" DECIMAL(6,2),
    "estimationMethod" "EstimationMethod" NOT NULL DEFAULT 'FORM',
    "photosUrls" TEXT,
    "aiEstimationConfidence" DECIMAL(5,2),
    "movingDate" TIMESTAMP(3),
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "convertedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "clientId" TEXT NOT NULL,
    "selectedQuoteId" TEXT,
    "originAddress" TEXT NOT NULL,
    "originCity" TEXT NOT NULL,
    "originPostalCode" TEXT NOT NULL,
    "originFloor" INTEGER,
    "originElevator" BOOLEAN NOT NULL DEFAULT false,
    "destAddress" TEXT NOT NULL,
    "destCity" TEXT NOT NULL,
    "destPostalCode" TEXT NOT NULL,
    "destFloor" INTEGER,
    "destElevator" BOOLEAN NOT NULL DEFAULT false,
    "volume" DECIMAL(6,2) NOT NULL,
    "distance" DECIMAL(7,2) NOT NULL,
    "volumeAdjustedBy" TEXT,
    "volumeAdjustedAt" TIMESTAMP(3),
    "volumeAdjustmentReason" TEXT,
    "movingDate" TIMESTAMP(3) NOT NULL,
    "flexibleDate" BOOLEAN NOT NULL DEFAULT false,
    "needPacking" BOOLEAN NOT NULL DEFAULT false,
    "needStorage" BOOLEAN NOT NULL DEFAULT false,
    "needInsurance" BOOLEAN NOT NULL DEFAULT false,
    "specialItems" TEXT,
    "status" "FolderStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quotesRequestedAt" TIMESTAMP(3),
    "top3ReadyAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mover" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "siret" VARCHAR(14) NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "googlePlaceId" TEXT,
    "googleRating" DECIMAL(3,2),
    "googleReviewsCount" INTEGER,
    "creditSafeScore" INTEGER,
    "creditSafeNotes" TEXT,
    "coverageZones" TEXT NOT NULL,
    "status" "MoverStatus" NOT NULL DEFAULT 'PENDING',
    "blacklisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklistReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Mover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingGrid" (
    "id" TEXT NOT NULL,
    "moverId" TEXT NOT NULL,
    "volumeMin" DECIMAL(6,2) NOT NULL,
    "volumeMax" DECIMAL(6,2) NOT NULL,
    "distanceMin" DECIMAL(7,2) NOT NULL,
    "distanceMax" DECIMAL(7,2) NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "pricePerM3" DECIMAL(10,2) NOT NULL,
    "pricePerKm" DECIMAL(10,2) NOT NULL,
    "packingPrice" DECIMAL(10,2),
    "storagePrice" DECIMAL(10,2),
    "insurancePrice" DECIMAL(10,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PricingGrid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "moverId" TEXT NOT NULL,
    "source" "QuoteSource" NOT NULL,
    "pricingGridId" TEXT,
    "rawEmailId" TEXT,
    "parsedData" TEXT,
    "confidenceScore" DECIMAL(5,2),
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "validUntil" TIMESTAMP(3) NOT NULL,
    "breakdown" TEXT,
    "notes" TEXT,
    "status" "QuoteStatus" NOT NULL DEFAULT 'REQUESTED',
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "lastRemindedAt" TIMESTAMP(3),
    "validatedByUserId" TEXT,
    "validatedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "scorePrice" DECIMAL(5,2),
    "scoreGoogle" DECIMAL(5,2),
    "scoreFinancial" DECIMAL(5,2),
    "scoreLitigations" DECIMAL(5,2),
    "scoreTotal" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Top3Selection" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "quote1Id" TEXT NOT NULL,
    "quote2Id" TEXT NOT NULL,
    "quote3Id" TEXT NOT NULL,
    "quote1ScoreTotal" DECIMAL(5,2) NOT NULL,
    "quote1Price" DECIMAL(10,2) NOT NULL,
    "quote2ScoreTotal" DECIMAL(5,2) NOT NULL,
    "quote2Price" DECIMAL(10,2) NOT NULL,
    "quote3ScoreTotal" DECIMAL(5,2) NOT NULL,
    "quote3Price" DECIMAL(10,2) NOT NULL,
    "selectedQuoteId" TEXT,
    "clientViewedAt" TIMESTAMP(3),
    "clientSelectedAt" TIMESTAMP(3),
    "presentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Top3Selection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "depositAmount" DECIMAL(10,2) NOT NULL,
    "remainingAmount" DECIMAL(10,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "contactExchangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "commissionRate" DECIMAL(4,2),
    "commissionAmount" DECIMAL(10,2),
    "moverAmount" DECIMAL(10,2),
    "stripePaymentIntentId" TEXT,
    "stripeTransferId" TEXT,
    "idempotencyKey" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "transferredAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL,
    "moverId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "type" "EmailType" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "folderId" TEXT,
    "moverId" TEXT,
    "sentBy" TEXT,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "providerMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EmailType" NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "variables" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_source_idx" ON "Lead"("source");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_deletedAt_idx" ON "Lead"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_email_idx" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_deletedAt_idx" ON "Client"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_leadId_key" ON "Folder"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_selectedQuoteId_key" ON "Folder"("selectedQuoteId");

-- CreateIndex
CREATE INDEX "Folder_status_createdAt_idx" ON "Folder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Folder_clientId_idx" ON "Folder"("clientId");

-- CreateIndex
CREATE INDEX "Folder_movingDate_idx" ON "Folder"("movingDate");

-- CreateIndex
CREATE INDEX "Folder_originPostalCode_idx" ON "Folder"("originPostalCode");

-- CreateIndex
CREATE INDEX "Folder_destPostalCode_idx" ON "Folder"("destPostalCode");

-- CreateIndex
CREATE INDEX "Folder_deletedAt_idx" ON "Folder"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Mover_siret_key" ON "Mover"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "Mover_email_key" ON "Mover"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mover_googlePlaceId_key" ON "Mover"("googlePlaceId");

-- CreateIndex
CREATE INDEX "Mover_status_idx" ON "Mover"("status");

-- CreateIndex
CREATE INDEX "Mover_googlePlaceId_idx" ON "Mover"("googlePlaceId");

-- CreateIndex
CREATE INDEX "Mover_siret_idx" ON "Mover"("siret");

-- CreateIndex
CREATE INDEX "Mover_city_idx" ON "Mover"("city");

-- CreateIndex
CREATE INDEX "Mover_deletedAt_idx" ON "Mover"("deletedAt");

-- CreateIndex
CREATE INDEX "PricingGrid_moverId_active_idx" ON "PricingGrid"("moverId", "active");

-- CreateIndex
CREATE INDEX "PricingGrid_volumeMin_volumeMax_distanceMin_distanceMax_idx" ON "PricingGrid"("volumeMin", "volumeMax", "distanceMin", "distanceMax");

-- CreateIndex
CREATE INDEX "PricingGrid_deletedAt_idx" ON "PricingGrid"("deletedAt");

-- CreateIndex
CREATE INDEX "Quote_folderId_status_idx" ON "Quote"("folderId", "status");

-- CreateIndex
CREATE INDEX "Quote_folderId_scoreTotal_idx" ON "Quote"("folderId", "scoreTotal");

-- CreateIndex
CREATE INDEX "Quote_moverId_idx" ON "Quote"("moverId");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "Quote"("status");

-- CreateIndex
CREATE INDEX "Quote_validUntil_idx" ON "Quote"("validUntil");

-- CreateIndex
CREATE INDEX "Quote_deletedAt_idx" ON "Quote"("deletedAt");

-- CreateIndex
CREATE INDEX "Top3Selection_folderId_idx" ON "Top3Selection"("folderId");

-- CreateIndex
CREATE INDEX "Top3Selection_presentedAt_idx" ON "Top3Selection"("presentedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_folderId_key" ON "Booking"("folderId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_quoteId_key" ON "Booking"("quoteId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_confirmedAt_idx" ON "Booking"("confirmedAt");

-- CreateIndex
CREATE INDEX "Booking_deletedAt_idx" ON "Booking"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeTransferId_key" ON "Payment"("stripeTransferId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_paidAt_idx" ON "Payment"("paidAt");

-- CreateIndex
CREATE INDEX "Payment_stripePaymentIntentId_idx" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_deletedAt_idx" ON "Payment"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_active_idx" ON "User"("role", "active");

-- CreateIndex
CREATE INDEX "User_moverId_idx" ON "User"("moverId");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "EmailLog_type_status_idx" ON "EmailLog"("type", "status");

-- CreateIndex
CREATE INDEX "EmailLog_folderId_idx" ON "EmailLog"("folderId");

-- CreateIndex
CREATE INDEX "EmailLog_moverId_idx" ON "EmailLog"("moverId");

-- CreateIndex
CREATE INDEX "EmailLog_recipient_idx" ON "EmailLog"("recipient");

-- CreateIndex
CREATE INDEX "EmailLog_sentAt_idx" ON "EmailLog"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "EmailTemplate"("name");

-- CreateIndex
CREATE INDEX "EmailTemplate_type_active_idx" ON "EmailTemplate"("type", "active");

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_selectedQuoteId_fkey" FOREIGN KEY ("selectedQuoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingGrid" ADD CONSTRAINT "PricingGrid_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "Mover"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "Mover"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_pricingGridId_fkey" FOREIGN KEY ("pricingGridId") REFERENCES "PricingGrid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_validatedByUserId_fkey" FOREIGN KEY ("validatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Top3Selection" ADD CONSTRAINT "Top3Selection_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Top3Selection" ADD CONSTRAINT "Top3Selection_quote1Id_fkey" FOREIGN KEY ("quote1Id") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Top3Selection" ADD CONSTRAINT "Top3Selection_quote2Id_fkey" FOREIGN KEY ("quote2Id") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Top3Selection" ADD CONSTRAINT "Top3Selection_quote3Id_fkey" FOREIGN KEY ("quote3Id") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "Mover"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "Mover"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_sentBy_fkey" FOREIGN KEY ("sentBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
