import { db } from './database';

/**
 * Migration Service
 * Handles migrating local data from "default-user" to authenticated user
 */

export const migrationService = {
  /**
   * Migrate all local data from default-user to the authenticated user's ID
   */
  async migrateLocalDataToUser(newUserId: string): Promise<void> {
    console.log('🔄 Starting data migration from default-user to', newUserId);

    try {
      // Check if migration already done
      const existingUser = await db.users.get(newUserId);
      if (existingUser) {
        console.log('✅ Data already migrated for this user');
        return;
      }

      // 1. Migrate user profile
      const defaultUser = await db.users.get('default-user');
      if (defaultUser) {
        const newUser = {
          ...defaultUser,
          id: newUserId,
          updatedAt: new Date(),
        };
        await db.users.add(newUser);
        console.log('✅ Migrated user profile');
      }

      // 2. Migrate workout templates
      const templates = await db.workoutTemplates
        .where('userId')
        .equals('default-user')
        .toArray();

      for (const template of templates) {
        await db.workoutTemplates.update(template.id, {
          userId: newUserId,
          updatedAt: new Date(),
        });
      }
      console.log(`✅ Migrated ${templates.length} workout templates`);

      // 3. Migrate workout logs
      const logs = await db.workoutLogs
        .where('userId')
        .equals('default-user')
        .toArray();

      for (const log of logs) {
        await db.workoutLogs.update(log.id, {
          userId: newUserId,
        });
      }
      console.log(`✅ Migrated ${logs.length} workout logs`);

      // 4. Migrate personal records
      const prs = await db.personalRecords
        .where('userId')
        .equals('default-user')
        .toArray();

      for (const pr of prs) {
        await db.personalRecords.update(pr.id, {
          userId: newUserId,
        });
      }
      console.log(`✅ Migrated ${prs.length} personal records`);

      // 5. Migrate programs
      const programs = await db.programs
        .where('userId')
        .equals('default-user')
        .toArray();

      for (const program of programs) {
        await db.programs.update(program.id, {
          userId: newUserId,
          updatedAt: new Date(),
        });
      }
      console.log(`✅ Migrated ${programs.length} programs`);

      // 6. Custom exercises are shared globally (no userId field)
      // They are identified by isCustom=true and don't need migration
      console.log('✅ Custom exercises are shared globally (no migration needed)');

      // 7. Migrate body measurements (if any)
      const measurements = await db.bodyMeasurements
        .where('userId')
        .equals('default-user')
        .toArray();

      for (const measurement of measurements) {
        await db.bodyMeasurements.update(measurement.id, {
          userId: newUserId,
        });
      }
      console.log(`✅ Migrated ${measurements.length} body measurements`);

      // 8. Delete old default-user profile (optional - keep for now as backup)
      // await db.users.delete('default-user');

      console.log('🎉 Data migration complete!');
      console.log('Summary:', {
        templates: templates.length,
        logs: logs.length,
        prs: prs.length,
        programs: programs.length,
        customExercises: customExercises.length,
        measurements: measurements.length,
      });
    } catch (error) {
      console.error('❌ Error during data migration:', error);
      throw error;
    }
  },

  /**
   * Check if user has any local data that needs migration
   */
  async hasLocalData(): Promise<boolean> {
    const templates = await db.workoutTemplates
      .where('userId')
      .equals('default-user')
      .count();

    const logs = await db.workoutLogs
      .where('userId')
      .equals('default-user')
      .count();

    const programs = await db.programs
      .where('userId')
      .equals('default-user')
      .count();

    return templates > 0 || logs > 0 || programs > 0;
  },

  /**
   * Get migration summary
   */
  async getMigrationSummary(): Promise<{
    templates: number;
    logs: number;
    prs: number;
    programs: number;
  }> {
    const templates = await db.workoutTemplates
      .where('userId')
      .equals('default-user')
      .count();

    const logs = await db.workoutLogs
      .where('userId')
      .equals('default-user')
      .count();

    const prs = await db.personalRecords
      .where('userId')
      .equals('default-user')
      .count();

    const programs = await db.programs
      .where('userId')
      .equals('default-user')
      .count();

    return { templates, logs, prs, programs };
  },
};
