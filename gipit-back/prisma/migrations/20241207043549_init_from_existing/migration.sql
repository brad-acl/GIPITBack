-- CreateTable
CREATE TABLE "candidate_management" (
    "id" SERIAL NOT NULL,
    "candidate_id" INTEGER,
    "management_id" INTEGER,
    "status" VARCHAR(50),
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "position_id" INTEGER,

    CONSTRAINT "candidate_management_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_process" (
    "id" SERIAL NOT NULL,
    "candidate_id" INTEGER,
    "process_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "technical_skills" TEXT,
    "soft_skills" TEXT,
    "client_comments" TEXT,
    "match_percent" DECIMAL(5,2),
    "interview_questions" TEXT,

    CONSTRAINT "candidate_process_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "address" TEXT,
    "jsongpt_text" TEXT,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments_process" (
    "id" SERIAL NOT NULL,
    "candidate_process_id" INTEGER,
    "user_id" INTEGER,
    "comments" TEXT,

    CONSTRAINT "comments_process_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "logo" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "management_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_sales_activities" (
    "id" SERIAL NOT NULL,
    "candidate_management_id" INTEGER,
    "benefit" TEXT,
    "client_comment" TEXT,
    "date" DATE,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "eval_stack" BOOLEAN DEFAULT false,
    "eval_comunicacion" INTEGER,
    "eval_motivacion" INTEGER,
    "eval_cumplimiento" INTEGER,
    "acciones_acl" TEXT,
    "proyecction" TEXT,

    CONSTRAINT "post_sales_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pre_invoice_items" (
    "id" SERIAL NOT NULL,
    "pre_invoice_id" INTEGER,
    "candidate_id" INTEGER,
    "service" TEXT,
    "rate" DECIMAL(10,2),
    "hours" DECIMAL(5,2),
    "subtotal" DECIMAL(10,2),
    "vat" DECIMAL(10,2),
    "total" DECIMAL(10,2),
    "description" TEXT,

    CONSTRAINT "pre_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pre_invoices" (
    "id" SERIAL NOT NULL,
    "estimated_date" DATE,
    "expiration_date" DATE,
    "total_value" DECIMAL(10,2),
    "description" TEXT,
    "status" VARCHAR(20),

    CONSTRAINT "pre_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process" (
    "id" SERIAL NOT NULL,
    "job_offer" VARCHAR(255) NOT NULL,
    "job_offer_description" TEXT,
    "company_id" INTEGER,
    "opened_at" DATE,
    "closed_at" DATE,
    "pre_filtered" BOOLEAN DEFAULT false,
    "status" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "process_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "avatar" VARCHAR(255),
    "position_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_management" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "management_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_management_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migrate" (
    "field1" VARCHAR(100),
    "field2" DATE,
    "field3" VARCHAR(100),
    "field4" VARCHAR(100),
    "field5" VARCHAR(100),
    "field6" VARCHAR(100),
    "field7" VARCHAR(100)
);

-- CreateTable
CREATE TABLE "position" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "candidate_management" ADD CONSTRAINT "candidate_management_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "candidate_management" ADD CONSTRAINT "candidate_management_management_id_fkey" FOREIGN KEY ("management_id") REFERENCES "management"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "candidate_management" ADD CONSTRAINT "fk_position_candidate_management" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "candidate_process" ADD CONSTRAINT "candidate_process_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "candidate_process" ADD CONSTRAINT "candidate_process_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "process"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments_process" ADD CONSTRAINT "comments_process_candidate_process_id_fkey" FOREIGN KEY ("candidate_process_id") REFERENCES "candidate_process"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments_process" ADD CONSTRAINT "comments_process_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "management" ADD CONSTRAINT "management_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_sales_activities" ADD CONSTRAINT "post_sales_activities_candidate_management_id_fkey" FOREIGN KEY ("candidate_management_id") REFERENCES "candidate_management"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pre_invoice_items" ADD CONSTRAINT "pre_invoice_items_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pre_invoice_items" ADD CONSTRAINT "pre_invoice_items_pre_invoice_id_fkey" FOREIGN KEY ("pre_invoice_id") REFERENCES "pre_invoices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "process" ADD CONSTRAINT "process_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_position" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_management" ADD CONSTRAINT "users_management_management_id_fkey" FOREIGN KEY ("management_id") REFERENCES "management"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_management" ADD CONSTRAINT "users_management_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
