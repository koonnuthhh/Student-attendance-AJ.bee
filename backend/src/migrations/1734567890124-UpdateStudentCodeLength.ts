import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStudentCodeLength1734567890124 implements MigrationInterface {
  name = 'UpdateStudentCodeLength1734567890124';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, check and update any existing codes that are longer than 5 characters
    // Update any codes that match the old format
    await queryRunner.query(`UPDATE "users" SET "student_code" = '12345' WHERE "student_code" = 'STU001'`);
    await queryRunner.query(`UPDATE "users" SET "student_code" = '67890' WHERE "student_code" = 'STU002'`);
    
    // Handle any other long codes by truncating or setting to null
    await queryRunner.query(`UPDATE "users" SET "student_code" = NULL WHERE LENGTH("student_code") > 5`);
    
    // Update student table to match
    await queryRunner.query(`UPDATE "students" SET "studentId" = '12345' WHERE "studentId" = 'STU001'`);
    await queryRunner.query(`UPDATE "students" SET "studentId" = '67890' WHERE "studentId" = 'STU002'`);
    
    // Then update the student_code column to allow 5 characters instead of 8
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "student_code" TYPE character varying(5)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert student IDs back to original format
    await queryRunner.query(`UPDATE "students" SET "studentId" = 'STU001' WHERE "studentId" = '12345'`);
    await queryRunner.query(`UPDATE "students" SET "studentId" = 'STU002' WHERE "studentId" = '67890'`);
    
    // Revert user codes back to original format
    await queryRunner.query(`UPDATE "users" SET "student_code" = 'STU001' WHERE "student_code" = '12345'`);
    await queryRunner.query(`UPDATE "users" SET "student_code" = 'STU002' WHERE "student_code" = '67890'`);
    
    // Revert the column length back to 8
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "student_code" TYPE character varying(8)`);
  }
}