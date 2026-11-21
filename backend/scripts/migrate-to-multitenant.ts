/**
 * SCRIPT DE MIGRATION SÉCURISÉ — MULTI-TENANT TERANGA FOOD SAAS
 * 
 * Ce script exécute la transition progressive vers l'architecture multi-tenant :
 * 1. Création de la table `Restaurant`
 * 2. Insertion du tenant par défaut `teranga-default` ('teranga-food')
 * 3. Ajout de `restaurantId` (nullable) sur toutes les tables
 * 4. Backfill sans perte des 534 enregistrements existants vers `teranga-default`
 * 5. Migration des contraintes uniques simples vers composites
 * 6. Ajout des index d'isolation
 * 7. Passage en NOT NULL des colonnes métier
 * 8. Ajout des clés étrangères (Foreign Keys)
 * 9. Extension du rôle `SUPER_ADMIN`
 * 
 * Exécution :
 * npx tsx scripts/migrate-to-multitenant.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function hasColumn(table: string, column: string): Promise<boolean> {
  const result: any[] = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) as count 
    FROM information_schema.columns 
    WHERE table_schema = DATABASE() 
      AND table_name = '${table}' 
      AND column_name = '${column}';
  `);
  return Number(result[0]?.count || 0) > 0;
}

async function hasIndex(table: string, indexName: string): Promise<boolean> {
  const result: any[] = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) as count 
    FROM information_schema.statistics 
    WHERE table_schema = DATABASE() 
      AND table_name = '${table}' 
      AND index_name = '${indexName}';
  `);
  return Number(result[0]?.count || 0) > 0;
}

async function hasForeignKey(table: string, fkName: string): Promise<boolean> {
  const result: any[] = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) as count 
    FROM information_schema.table_constraints 
    WHERE table_schema = DATABASE() 
      AND table_name = '${table}' 
      AND constraint_name = '${fkName}' 
      AND constraint_type = 'FOREIGN KEY';
  `);
  return Number(result[0]?.count || 0) > 0;
}

async function runMigration() {
  console.log('=================================================================');
  console.log('🚀 DÉMARRAGE DE LA MIGRATION VERS TERANGA FOOD SAAS MULTI-TENANT');
  console.log('=================================================================');

  // --- ÉTAPE 1 : CRÉATION DE LA TABLE RESTAURANT ---
  console.log('\n[Étape 1/9] Création de la table `Restaurant`...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`Restaurant\` (
      \`id\` VARCHAR(191) NOT NULL PRIMARY KEY,
      \`slug\` VARCHAR(191) NOT NULL UNIQUE,
      \`name\` VARCHAR(191) NOT NULL,
      \`legalName\` VARCHAR(191) NULL,
      \`phone\` VARCHAR(191) NOT NULL,
      \`whatsappNumber\` VARCHAR(191) NOT NULL,
      \`email\` VARCHAR(191) NOT NULL,
      \`address\` VARCHAR(191) NOT NULL,
      \`city\` VARCHAR(191) NOT NULL DEFAULT 'Dakar',
      \`status\` ENUM('ACTIVE', 'SUSPENDED', 'TRIAL', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
      \`plan\` ENUM('FREE_TRIAL', 'STARTER', 'PRO', 'ENTERPRISE') NOT NULL DEFAULT 'PRO',
      \`subscriptionEnd\` DATETIME(3) NULL,
      \`logoUrl\` TEXT NULL,
      \`coverUrl\` TEXT NULL,
      \`currency\` VARCHAR(191) NOT NULL DEFAULT 'FCFA',
      \`maxTables\` INT NOT NULL DEFAULT 30,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      INDEX \`Restaurant_slug_idx\` (\`slug\`),
      INDEX \`Restaurant_status_idx\` (\`status\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ Table `Restaurant` vérifiée/créée.');

  // --- ÉTAPE 2 : INSERTION DU TENANT INITIAL ---
  console.log('\n[Étape 2/9] Insertion du restaurant par défaut `teranga-default`...');
  await prisma.$executeRawUnsafe(`
    INSERT INTO \`Restaurant\` (
      \`id\`, \`slug\`, \`name\`, \`legalName\`, \`phone\`, \`whatsappNumber\`, \`email\`, \`address\`, \`city\`, \`status\`, \`plan\`, \`logoUrl\`,\`coverUrl\`, \`currency\`
    ) VALUES (
      'teranga-default',
      'teranga-food',
      'TERANGA FOOD',
      'TERANGA FOOD SARL',
      '+221 33 821 40 50',
      '221774888464',
      'contact@terangafood.sn',
      '14 Rue Victor Schoelcher, Dakar-Plateau',
      'Dakar',
      'ACTIVE',
      'PRO',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
      'FCFA'
    ) ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
  `);
  console.log('✅ Restaurant initial `teranga-default` (slug: teranga-food) configuré.');

  // --- ÉTAPE 3 : AJOUT DES COLONNES RESTAURANTID (NULLABLE) ---
  console.log('\n[Étape 3/9] Ajout des colonnes `restaurantId` (nullable)...');
  const tablesWithTenant = [
    'RestaurantSettings',
    'User',
    'Table',
    'Category',
    'Product',
    'Customer',
    'Order',
    'Promotion',
    'Review',
    'Notification',
    'DailyMenuSchedule',
  ];

  for (const table of tablesWithTenant) {
    const exists = await hasColumn(table, 'restaurantId');
    if (!exists) {
      await prisma.$executeRawUnsafe(`ALTER TABLE \`${table}\` ADD COLUMN \`restaurantId\` VARCHAR(191) NULL;`);
      console.log(` Colone \`restaurantId\` ajoutée à [${table}]`);
    } else {
      console.log(`ℹ️ Colonne \`restaurantId\` déjà présente dans [${table}]`);
    }
  }

  // --- ÉTAPE 4 : BACKFILL DES DONNÉES EXISTANTES ---
  console.log('\n[Étape 4/9] Rattachement des données historiques vers `teranga-default`...');
  for (const table of tablesWithTenant) {
    const updateResult = await prisma.$executeRawUnsafe(`
      UPDATE \`${table}\` SET \`restaurantId\` = 'teranga-default' WHERE \`restaurantId\` IS NULL;
    `);
    console.log(` Données rattachées dans [${table}] (lignes mises à jour : ${updateResult})`);
  }

  // --- ÉTAPE 5 : MISE À JOUR DE L'ENUM ROLE POUR SUPER_ADMIN ---
  console.log('\n[Étape 5/9] Élargissement des rôles utilisateurs (Ajout de SUPER_ADMIN)...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE \`User\` MODIFY COLUMN \`role\` ENUM('SUPER_ADMIN', 'ADMIN', 'STAFF', 'KITCHEN') NOT NULL DEFAULT 'STAFF';
  `);
  console.log('✅ Rôle `SUPER_ADMIN` activé dans la table `User`.');

  // --- ÉTAPE 6 : MIGRATION DES CONTRAINTES D'UNICITÉ GLOBALES VERS COMPOSITES ---
  console.log('\n[Étape 6/9] Restructuration des contraintes uniques composites...');
  
  // Table.number
  if (await hasIndex('Table', 'Table_number_key')) {
    await prisma.$executeRawUnsafe(`ALTER TABLE \`Table\` DROP INDEX \`Table_number_key\`;`);
    console.log(' Ancien index global Table_number_key supprimé');
  }
  if (!(await hasIndex('Table', 'Table_restaurantId_number_key'))) {
    await prisma.$executeRawUnsafe(`ALTER TABLE \`Table\` ADD UNIQUE INDEX \`Table_restaurantId_number_key\` (\`restaurantId\`, \`number\`);`);
    console.log('✅ Index composite Table(restaurantId, number) créé');
  }

  // Category.slug
  if (await hasIndex('Category', 'Category_slug_key')) {
    await prisma.$executeRawUnsafe(`ALTER TABLE \`Category\` DROP INDEX \`Category_slug_key\`;`);
    console.log(' Ancien index global Category_slug_key supprimé');
  }
  if (!(await hasIndex('Category', 'Category_restaurantId_slug_key'))) {
    await prisma.$executeRawUnsafe(`ALTER TABLE \`Category\` ADD UNIQUE INDEX \`Category_restaurantId_slug_key\` (\`restaurantId\`, \`slug\`);`);
    console.log('✅ Index composite Category(restaurantId, slug) créé');
  }

  // Customer.phone
  if (await hasIndex('Customer', 'Customer_phone_key')) {
    await prisma.$executeRawUnsafe(`ALTER TABLE \`Customer\` DROP INDEX \`Customer_phone_key\`;`);
    console.log(' Ancien index global Customer_phone_key supprimé');
  }
  if (!(await hasIndex('Customer', 'Customer_restaurantId_phone_key'))) {
    await prisma.$executeRawUnsafe(`ALTER TABLE \`Customer\` ADD UNIQUE INDEX \`Customer_restaurantId_phone_key\` (\`restaurantId\`, \`phone\`);`);
    console.log('✅ Index composite Customer(restaurantId, phone) créé');
  }

  // DailyMenuSchedule.dayOfWeek
  if (await hasIndex('DailyMenuSchedule', 'DailyMenuSchedule_dayOfWeek_key')) {
    await prisma.$executeRawUnsafe(`ALTER TABLE \`DailyMenuSchedule\` DROP INDEX \`DailyMenuSchedule_dayOfWeek_key\`;`);
    console.log(' Ancien index global DailyMenuSchedule_dayOfWeek_key supprimé');
  }
  if (!(await hasIndex('DailyMenuSchedule', 'DailyMenuSchedule_restaurantId_dayOfWeek_key'))) {
    await prisma.$executeRawUnsafe(`ALTER TABLE \`DailyMenuSchedule\` ADD UNIQUE INDEX \`DailyMenuSchedule_restaurantId_dayOfWeek_key\` (\`restaurantId\`, \`dayOfWeek\`);`);
    console.log('✅ Index composite DailyMenuSchedule(restaurantId, dayOfWeek) créé');
  }

  // RestaurantSettings.restaurantId (1-1)
  if (!(await hasIndex('RestaurantSettings', 'RestaurantSettings_restaurantId_key'))) {
    await prisma.$executeRawUnsafe(`ALTER TABLE \`RestaurantSettings\` ADD UNIQUE INDEX \`RestaurantSettings_restaurantId_key\` (\`restaurantId\`);`);
    console.log('✅ Index unique RestaurantSettings(restaurantId) créé');
  }

  // --- ÉTAPE 7 : INDEX DE PERFORMANCE MULTI-TENANT ---
  console.log('\n[Étape 7/9] Ajout des index de performance par tenant...');
  const indexSpecs = [
    { table: 'Product', index: 'Product_restaurantId_idx', cols: '`restaurantId`' },
    { table: 'Order', index: 'Order_restaurantId_idx', cols: '`restaurantId`' },
    { table: 'Order', index: 'Order_restaurantId_status_idx', cols: '`restaurantId`, `status`' },
    { table: 'Order', index: 'Order_restaurantId_createdAt_idx', cols: '`restaurantId`, `createdAt`' },
    { table: 'Promotion', index: 'Promotion_restaurantId_idx', cols: '`restaurantId`' },
    { table: 'Review', index: 'Review_restaurantId_idx', cols: '`restaurantId`' },
    { table: 'Notification', index: 'Notification_restaurantId_idx', cols: '`restaurantId`' },
    { table: 'User', index: 'User_restaurantId_idx', cols: '`restaurantId`' },
  ];

  for (const spec of indexSpecs) {
    if (!(await hasIndex(spec.table, spec.index))) {
      await prisma.$executeRawUnsafe(`ALTER TABLE \`${spec.table}\` ADD INDEX \`${spec.index}\` (${spec.cols});`);
      console.log(` Index [${spec.index}] créé sur [${spec.table}]`);
    }
  }

  // --- ÉTAPE 8 : PASSAGE EN NOT NULL DES COLONNES REQUISES ---
  console.log('\n[Étape 8/9] Application de la contrainte NOT NULL sur les tables métier...');
  const notNullTables = [
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
  ];

  for (const table of notNullTables) {
    await prisma.$executeRawUnsafe(`ALTER TABLE \`${table}\` MODIFY COLUMN \`restaurantId\` VARCHAR(191) NOT NULL;`);
    console.log(` Colonne \`restaurantId\` rendue NOT NULL sur [${table}]`);
  }
  console.log('ℹ️ Remarque : `User.restaurantId` est volontairement conservée NULLABLE pour le rôle `SUPER_ADMIN`.');

  // --- ÉTAPE 9 : CLÉS ÉTRANGÈRES VERS RESTAURANT(ID) ---
  console.log('\n[Étape 9/9] Mise en place des clés étrangères vers Restaurant(id)...');
  const fkTables = [...notNullTables, 'User'];

  for (const table of fkTables) {
    const fkName = `${table}_restaurantId_fkey`;
    if (!(await hasForeignKey(table, fkName))) {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`${table}\` 
        ADD CONSTRAINT \`${fkName}\` 
        FOREIGN KEY (\`restaurantId\`) 
        REFERENCES \`Restaurant\`(\`id\`) 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log(` Clé étrangère [${fkName}] créée sur [${table}]`);
    } else {
      console.log(`ℹ️ Clé étrangère [${fkName}] déjà présente sur [${table}]`);
    }
  }

  console.log('=================================================================');
  console.log('🎉 MIGRATION MULTI-TENANT TERMINÉE AVEC SUCCÈS SANS PERTE !');
  console.log('=================================================================');
}

runMigration()
  .catch(err => {
    console.error('❌ Échec de la migration :', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
