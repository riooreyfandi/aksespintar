-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN "material_id" UUID;

-- AlterTable
ALTER TABLE "answer_options" ADD COLUMN "order_index" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "body" VARCHAR(1000) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quizzes_material_id_idx" ON "quizzes"("material_id");

-- CreateIndex
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages"("created_at");

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "learning_materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
