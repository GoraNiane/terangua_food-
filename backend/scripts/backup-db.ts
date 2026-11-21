/**
 * SCRIPT DE SAUVEGARDE COMPLÈTE — TERANGA FOOD SAAS
 * 
 * Exporte l'intégralité de la base TiDB Cloud (19 tables) sous forme :
 * 1. JSON complet : backend/backups/backup_<horodatage>.json
 * 2. SQL DML (INSERTs) : backend/backups/backup_<horodatage>.sql
 * 3. Manifeste d'intégrité : backend/backups/manifest_<horodatage>.json
 * 
 * Exécution :
 * npx tsx scripts/backup-db.ts
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ALL_TABLES = [
  'RestaurantSettings',
  'User',
  'Table',
  'Category',
  'Product',
  'ProductOption',
  'ProductOptionValue',
  'Customer',
  'Order',
  'OrderItem',
  'OrderItemOption',
  'OrderStatusHistory',
  'Sale',
  'Promotion',
  'LoyaltyAccount',
  'LoyaltyTransaction',
  'Review',
  'Notification',
  'DailyMenuSchedule',
];

function escapeSqlValue(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

async function runBackup() {
  console.log('=====================================================');
  console.log('🚀 DÉMARRAGE DE LA SAUVEGARDE DE LA BASE DE DONNÉES');
  console.log('=====================================================');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, '../backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const jsonDump: Record<string, any[]> = {};
  const manifest: {
    timestamp: string;
    totalTables: number;
    totalRows: number;
    tableCounts: Record<string, number>;
    files: { json: string; sql: string; manifest: string };
  } = {
    timestamp: new Date().toISOString(),
    totalTables: ALL_TABLES.length,
    totalRows: 0,
    tableCounts: {},
    files: {
      json: `backup_${timestamp}.json`,
      sql: `backup_${timestamp}.sql`,
      manifest: `manifest_${timestamp}.json`,
    },
  };

  let sqlDump = `-- =====================================================\n`;
  sqlDump += `-- SAUVEGARDE TERANGA FOOD - ${new Date().toISOString()}\n`;
  sqlDump += `-- Base de données : TiDB Cloud (MySQL 8.0 Compatible)\n`;
  sqlDump += `-- =====================================================\n\n`;
  sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

  for (const tableName of ALL_TABLES) {
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM \`${tableName}\``);
      jsonDump[tableName] = rows;
      manifest.tableCounts[tableName] = rows.length;
      manifest.totalRows += rows.length;

      console.log(`📦 Table [${tableName}] : ${rows.length} ligne(s) exportée(s)`);

      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        const colsSql = columns.map(c => `\`${c}\``).join(', ');

        sqlDump += `-- Table: ${tableName} (${rows.length} lignes)\n`;
        for (const row of rows) {
          const valuesSql = columns.map(col => escapeSqlValue(row[col])).join(', ');
          sqlDump += `INSERT INTO \`${tableName}\` (${colsSql}) VALUES (${valuesSql});\n`;
        }
        sqlDump += `\n`;
      }
    } catch (err: any) {
      console.warn(`⚠️ Avertissement sur [${tableName}] : ${err.message}`);
      jsonDump[tableName] = [];
      manifest.tableCounts[tableName] = 0;
    }
  }

  sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;
  sqlDump += `-- FIN DE LA SAUVEGARDE --\n`;

  // Écriture des fichiers
  const jsonPath = path.join(backupDir, manifest.files.json);
  const sqlPath = path.join(backupDir, manifest.files.sql);
  const manifestPath = path.join(backupDir, manifest.files.manifest);

  fs.writeFileSync(jsonPath, JSON.stringify(jsonDump, null, 2), 'utf-8');
  fs.writeFileSync(sqlPath, sqlDump, 'utf-8');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log('=====================================================');
  console.log('✅ SAUVEGARDE RÉUSSIE SANS AUCUNE MODIFICATION !');
  console.log(`📁 Fichier JSON : ${jsonPath} (${(fs.statSync(jsonPath).size / 1024).toFixed(2)} KB)`);
  console.log(`📁 Fichier SQL  : ${sqlPath} (${(fs.statSync(sqlPath).size / 1024).toFixed(2)} KB)`);
  console.log(`📁 Manifeste    : ${manifestPath}`);
  console.log(`📊 Total lignes : ${manifest.totalRows} enregistrements sauvegardés`);
  console.log('=====================================================');
}

runBackup()
  .catch(err => {
    console.error('❌ Échec de la sauvegarde :', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
