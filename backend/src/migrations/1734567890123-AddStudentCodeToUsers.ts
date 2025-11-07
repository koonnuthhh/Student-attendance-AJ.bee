import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddStudentCodeToUsers1734567890123 implements MigrationInterface {
  name = 'AddStudentCodeToUsers1734567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add studentCode column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'student_code',
        type: 'varchar',
        length: '8',
        isNullable: true,
        isUnique: true,
        comment: 'Unique student identification code for class enrollment',
      })
    );

    // Add studentCodeGeneratedAt column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'student_code_generated_at',
        type: 'timestamp',
        isNullable: true,
        comment: 'When the student code was generated',
      })
    );

    // Add studentCodeUsed column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'student_code_used',
        type: 'boolean',
        default: false,
        comment: 'Whether the student code has been used for registration',
      })
    );

    // Create unique index
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_STUDENT_CODE',
        columnNames: ['student_code'],
        isUnique: true,
        where: 'student_code IS NOT NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_USERS_STUDENT_CODE');
    await queryRunner.dropColumn('users', 'student_code_used');
    await queryRunner.dropColumn('users', 'student_code_generated_at');
    await queryRunner.dropColumn('users', 'student_code');
  }
}
