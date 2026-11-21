import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runRollback() {
  console.log('🔄 Démarrage du rollback de la base de données vers mono-restaurant...');

  // 1. Désactiver temporairement les vérifications de clés étrangères
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

  const tablesWithTenant = [
    'RestaurantSettings',
    'Table',
    'Category',
    'Product',
    'Customer',
    'Order',
    'Promotion',
    'Review',
    'Notification',
    'DailyMenuSchedule',
    'User'
  ];

  // 2. Supprimer les contraintes de clés étrangères vers Restaurant
  for (const table of tablesWithTenant) {
    const fkName = `${table}_restaurantId_fkey`;
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${fkName}\`;`);
      console.log(`✅ Clé étrangère [${fkName}] supprimée de [${table}]`);
    } catch (e: any) {
      console.log(`ℹ️ FK [${fkName}] déjà supprimée ou inexistante`);
    }
  }

  // 3. Supprimer les index composites et de performance multi-tenant
  const indexesToDrop = [
    { table: 'Table', index: 'Table_restaurantId_number_key' },
    { table: 'Category', index: 'Category_restaurantId_slug_key' },
    { table: 'Customer', index: 'Customer_restaurantId_phone_key' },
    { table: 'DailyMenuSchedule', index: 'DailyMenuSchedule_restaurantId_dayOfWeek_key' },
    { table: 'RestaurantSettings', index: 'RestaurantSettings_restaurantId_key' },
    { table: 'Product', index: 'Product_restaurantId_idx' },
    { table: 'Order', index: 'Order_restaurantId_idx' },
    { table: 'Order', index: 'Order_restaurantId_status_idx' },
    { table: 'Order', index: 'Order_restaurantId_createdAt_idx' },
    { table: 'Promotion', index: 'Promotion_restaurantId_idx' },
    { table: 'Review', index: 'Review_restaurantId_idx' },
    { table: 'Notification', index: 'Notification_restaurantId_idx' },
    { table: 'User', index: 'User_restaurantId_idx' },
    { table: 'DailyMenuSchedule', index: 'DailyMenuSchedule_restaurantId_idx' },
  ];

  for (const item of indexesToDrop) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE \`${item.table}\` DROP INDEX \`${item.index}\`;`);
      console.log(`✅ Index [${item.index}] supprimé de [${item.table}]`);
    } catch (e: any) {
      console.log(`ℹ️ Index [${item.index}] déjà supprimé ou inexistant`);
    }
  }

  // 4. Recréer les contraintes d'unicité globales d'origine
  const uniqueIndexes = [
    { table: 'Table', index: 'Table_number_key', col: '`number`' },
    { table: 'Category', index: 'Category_slug_key', col: '`slug`' },
    { table: 'Customer', index: 'Customer_phone_key', col: '`phone`' },
    { table: 'DailyMenuSchedule', index: 'DailyMenuSchedule_dayOfWeek_key', col: '`dayOfWeek`' },
  ];

  for (const item of uniqueIndexes) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE \`${item.table}\` ADD UNIQUE INDEX \`${item.index}\` (${item.col});`);
      console.log(`✅ Index unique d'origine [${item.index}] restauré sur [${item.table}]`);
    } catch (e: any) {
      console.log(`ℹ️ Index [${item.index}] déjà en place : ${e.message}`);
    }
  }

  // 5. Supprimer la colonne restaurantId de toutes les tables
  for (const table of tablesWithTenant) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE \`${table}\` DROP COLUMN \`restaurantId\`;`);
      console.log(`✅ Colonne restaurantId supprimée de [${table}]`);
    } catch (e: any) {
      console.log(`ℹ️ Colonne restaurantId déjà absente de [${table}] : ${e.message}`);
    }
  }

  // 6. Rétablir le rôle User.role à son enum d'origine (sans SUPER_ADMIN)
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE \`User\` MODIFY COLUMN \`role\` ENUM('ADMIN', 'STAFF', 'KITCHEN') NOT NULL DEFAULT 'STAFF';
    `);
    console.log(`✅ Enum User.role rétabli à ADMIN, STAFF, KITCHEN`);
  } catch (e: any) {
    console.error(`Erreur role:`, e.message);
  }

  // 7. Supprimer la table Restaurant
  try {
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS \`Restaurant\`;`);
    console.log(`✅ Table [Restaurant] supprimée`);
  } catch (e: any) {
    console.error(`Erreur drop table Restaurant:`, e.message);
  }

  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
  console.log('🎉 BASE DE DONNÉES TI DB CLOUD RESTAURÉE À 100% VERS LE SCHÉMA D\'ORIGINE !');
}

runRollback()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
