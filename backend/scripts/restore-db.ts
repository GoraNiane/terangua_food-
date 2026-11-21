/**
 * SCRIPT DE RESTAURATION D'URGENCE (ROLLBACK) — TERANGA FOOD SAAS
 * 
 * Permet de restaurer l'intégralité de la base TiDB Cloud à partir
 * du fichier JSON de sauvegarde le plus récent ou spécifié.
 * 
 * Utilisation :
 * npx tsx scripts/restore-db.ts [--file backup_XXXXX.json] [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ordre de troncature inversé pour respecter les clés étrangères
const TRUNCATE_ORDER = [
  'OrderItemOption',
  'OrderItem',
  'OrderStatusHistory',
  'Sale',
  'Order',
  'ProductOptionValue',
  'ProductOption',
  'Product',
  'Category',
  'Table',
  'LoyaltyTransaction',
  'LoyaltyAccount',
  'Customer',
  'Promotion',
  'Review',
  'Notification',
  'DailyMenuSchedule',
  'RestaurantSettings',
  'User',
];

// Ordre d'insertion direct pour respecter les clés parent -> enfant
const INSERT_ORDER = [...TRUNCATE_ORDER].reverse();

async function runRestore() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const fileArgIdx = args.indexOf('--file');
  const backupDir = path.resolve(__dirname, '../backups');

  let backupFile: string | null = null;
  if (fileArgIdx !== -1 && args[fileArgIdx + 1]) {
    backupFile = path.resolve(backupDir, args[fileArgIdx + 1]);
  } else {
    // Sélectionner automatiquement la sauvegarde la plus récente
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir).filter(f => f.startsWith('backup_') && f.endsWith('.json'));
      if (files.length > 0) {
        files.sort().reverse();
        backupFile = path.join(backupDir, files[0]);
      }
    }
  }

  if (!backupFile || !fs.existsSync(backupFile)) {
    console.error('❌ Aucun fichier de sauvegarde valide trouvé dans :', backupDir);
    process.exit(1);
  }

  console.log('=====================================================');
  console.log(`🔄 SCRIPT DE RESTAURATION TERANGA FOOD`);
  console.log(`📂 Fichier source : ${backupFile}`);
  console.log(`⚙️ Mode : ${isDryRun ? 'DRY-RUN (Vérification seule)' : 'RESTAURATION ACTIVE'}`);
  console.log('=====================================================');

  const rawData = fs.readFileSync(backupFile, 'utf-8');
  const backupData: Record<string, any[]> = JSON.parse(rawData);

  let totalRestorable = 0;
  for (const table of INSERT_ORDER) {
    const count = (backupData[table] || []).length;
    totalRestorable += count;
    console.log(`📋 Table [${table}] : ${count} enregistrement(s) trouvé(s)`);
  }

  if (isDryRun) {
    console.log('=====================================================');
    console.log(`✅ DRY-RUN RÉUSSI : ${totalRestorable} lignes vérifiées et prêtes à restaurer.`);
    return;
  }

  console.log('\n⚠️ DÉBUT DE LA RESTAURATION EN BASE DE DONNÉES...');
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

  try {
    for (const table of TRUNCATE_ORDER) {
      await prisma.$executeRawUnsafe(`DELETE FROM \`${table}\`;`);
    }

    for (const table of INSERT_ORDER) {
      const rows = backupData[table] || [];
      if (rows.length === 0) continue;

      const columns = Object.keys(rows[0]);
      const colsSql = columns.map(c => `\`${c}\``).join(', ');

      for (const row of rows) {
        const valuesSql = columns.map(c => {
          const val = row[c];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return String(val);
          if (typeof val === 'boolean') return val ? '1' : '0';
          if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
        }).join(', ');

        await prisma.$executeRawUnsafe(`INSERT INTO \`${table}\` (${colsSql}) VALUES (${valuesSql});`);
      }
      console.log(` Restauration terminée pour [${table}] : ${rows.length} lignes`);
    }

    console.log('=====================================================');
    console.log('🎉 RESTAURATION COMPLÈTE TERMINÉE AVEC SUCCÈS !');
    console.log('=====================================================');
  } finally {
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
  }
}

runRestore()
  .catch(err => {
    console.error('❌ Échec critique de restauration :', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
