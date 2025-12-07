/**
 * Restore audit logging after temporary disable
 */

const fs = require('fs');
const path = require('path');

const auditServicePath = path.join(__dirname, '..', 'lib', 'services', 'audit-logger-service.ts');
const backupPath = auditServicePath + '.backup';

console.log('🔄 Restoring audit logging...');

if (fs.existsSync(backupPath)) {
  const backupContent = fs.readFileSync(backupPath, 'utf8');
  fs.writeFileSync(auditServicePath, backupContent);
  fs.unlinkSync(backupPath); // Remove backup
  console.log('✅ Audit logging restored');
  console.log('🔄 Restart your server: npm run dev');
} else {
  console.log('❌ No backup found - audit logging was not temporarily disabled');
}