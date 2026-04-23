-- CreateTable
CREATE TABLE "pesticides" (
    "id" SERIAL NOT NULL,
    "registration_number" TEXT NOT NULL,
    "pesticide_type" TEXT NOT NULL,
    "pesticide_name" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "active_ingredient" TEXT NOT NULL,
    "active_ingredient_for_total_count" TEXT NOT NULL,
    "concentration" TEXT NOT NULL,
    "mix_count" INTEGER NOT NULL,
    "usage" TEXT NOT NULL,
    "formulation" TEXT NOT NULL,
    "registration_date" TIMESTAMP(3),

    CONSTRAINT "pesticides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesticide_applications" (
    "id" SERIAL NOT NULL,
    "registration_number" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "pesticide_type" TEXT NOT NULL,
    "pesticide_name" TEXT NOT NULL,
    "company_abbreviation" TEXT NOT NULL,
    "crop_name" TEXT NOT NULL,
    "application_place" TEXT,
    "pest_name" TEXT NOT NULL,
    "purpose" TEXT,
    "dilution_rate" TEXT NOT NULL,
    "spray_volume" TEXT,
    "usage_period" TEXT NOT NULL,
    "max_count" TEXT NOT NULL,
    "usage_method" TEXT NOT NULL,
    "fumigation_time" TEXT,
    "fumigation_temperature" TEXT,
    "application_soil" TEXT,
    "application_area" TEXT,
    "application_pesticide_name" TEXT,
    "mix_count" INTEGER NOT NULL,
    "total_max_count_1" TEXT,
    "total_max_count_2" TEXT,
    "total_max_count_3" TEXT,
    "total_max_count_4" TEXT,
    "total_max_count_5" TEXT,

    CONSTRAINT "pesticide_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pesticides_registration_number_key" ON "pesticides"("registration_number");

-- CreateIndex
CREATE INDEX "pesticide_applications_crop_name_idx" ON "pesticide_applications"("crop_name");

-- CreateIndex
CREATE INDEX "pesticide_applications_registration_number_idx" ON "pesticide_applications"("registration_number");

-- AddForeignKey
ALTER TABLE "pesticide_applications" ADD CONSTRAINT "pesticide_applications_registration_number_fkey" FOREIGN KEY ("registration_number") REFERENCES "pesticides"("registration_number") ON DELETE RESTRICT ON UPDATE CASCADE;
