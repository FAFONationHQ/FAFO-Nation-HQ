-- Commerce Foundation V1D. This additive migration is for disposable development/test PostgreSQL only.
CREATE TABLE "CommerceCart" ("id" TEXT PRIMARY KEY, "ownerKind" TEXT NOT NULL, "ownerRef" TEXT NOT NULL, "state" TEXT NOT NULL, "version" INTEGER NOT NULL, "snapshot" JSONB NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL);
CREATE TABLE "CommerceCheckoutSession" ("id" TEXT PRIMARY KEY, "cartId" TEXT NOT NULL, "cartVersion" INTEGER NOT NULL, "state" TEXT NOT NULL, "idempotencyKey" TEXT NOT NULL UNIQUE, "readiness" JSONB NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL);
CREATE TABLE "CommerceOrder" ("id" TEXT PRIMARY KEY, "checkoutId" TEXT NOT NULL, "cartVersion" INTEGER NOT NULL, "orderState" TEXT NOT NULL, "paymentState" TEXT NOT NULL, "fulfillmentState" TEXT NOT NULL, "productionState" TEXT NOT NULL, "shipmentState" TEXT NOT NULL, "subtotalMinor" INTEGER NOT NULL, "currency" TEXT NOT NULL, "snapshot" JSONB NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL);
CREATE TABLE "CommerceOrderItem" ("id" TEXT PRIMARY KEY, "orderId" TEXT NOT NULL REFERENCES "CommerceOrder"("id") ON DELETE RESTRICT, "snapshot" JSONB NOT NULL);
CREATE TABLE "CommerceOperation" ("id" TEXT PRIMARY KEY, "orderId" TEXT NOT NULL, "kind" TEXT NOT NULL, "provider" TEXT, "providerRef" TEXT, "state" TEXT NOT NULL, "idempotencyKey" TEXT NOT NULL UNIQUE, "reconciliation" TEXT NOT NULL, "version" INTEGER NOT NULL, "diagnostic" JSONB, "createdAt" TIMESTAMP(3) NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL);
CREATE TABLE "CommerceEvent" ("id" TEXT PRIMARY KEY, "orderId" TEXT, "operationId" TEXT, "eventType" TEXT NOT NULL, "correlationId" TEXT, "sequence" INTEGER NOT NULL, "occurredAt" TIMESTAMP(3) NOT NULL, "payload" JSONB);
CREATE TABLE "CommerceIdempotency" ("key" TEXT PRIMARY KEY, "operation" TEXT NOT NULL, "fingerprint" TEXT NOT NULL, "result" JSONB, "state" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL);
CREATE TABLE "CommerceManualReview" ("id" TEXT PRIMARY KEY, "orderId" TEXT NOT NULL, "operationId" TEXT, "reason" TEXT NOT NULL, "status" TEXT NOT NULL, "customerActionRequired" BOOLEAN NOT NULL, "operatorActionRequired" BOOLEAN NOT NULL, "diagnostic" JSONB, "createdAt" TIMESTAMP(3) NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL);
CREATE INDEX "CommerceCart_ownerKind_ownerRef_idx" ON "CommerceCart"("ownerKind", "ownerRef");
CREATE INDEX "CommerceOrder_checkoutId_idx" ON "CommerceOrder"("checkoutId");
CREATE INDEX "CommerceOrderItem_orderId_idx" ON "CommerceOrderItem"("orderId");
CREATE INDEX "CommerceOperation_orderId_kind_idx" ON "CommerceOperation"("orderId", "kind");
CREATE INDEX "CommerceEvent_orderId_occurredAt_idx" ON "CommerceEvent"("orderId", "occurredAt");
CREATE INDEX "CommerceManualReview_orderId_status_idx" ON "CommerceManualReview"("orderId", "status");
