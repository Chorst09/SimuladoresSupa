-- AlterTable
ALTER TABLE "public"."oportunidades_parceiro" 
ADD COLUMN "acompanhamentos" JSONB NOT NULL DEFAULT '[]';
