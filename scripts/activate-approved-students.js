const { PrismaClient, Role, SchoolCategory, SubscriptionStatus, StudyMode } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

const GRADE_ID = "cmvus9qi20005p68tyhihu2od"; // الصف الثاني الثانوي (تانية بكالوريا)
const SYSTEM_ID = "cmvus9qhv0000p68t660p5ce1"; // البكالوريا المصرية
const DEFAULT_PASSWORD_HASH = "$2b$10$FiJK0lVDMDyU2dvWjrxIQuGqQ0tya8Qa5ITxRmP42ACCYP.Z/W95K";

function parseCsv(content) {
  const lines = content.trim().split('\n');
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line taking quotes into account
    const cols = [];
    let cur = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cols.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());

    rows.push({
      csvId: cols[0],
      name: cols[1],
      phone: cols[2]?.replace(/\D/g, '') || '',
      parentPhone: cols[3]?.replace(/\D/g, '') || '',
      accessCode: cols[4]?.trim().toUpperCase() || '',
      track: cols[5]?.trim() || '',
      center: cols[6]?.replace(/^"+|"+$/g, '').trim() || '',
      schoolName: cols[10]?.replace(/^"+|"+$/g, '').trim() || '',
      email: cols[11]?.replace(/^"+|"+$/g, '').trim() || '',
      status: cols[12]?.trim() || '',
      paymentStatus: cols[13]?.trim() || '',
    });
  }
  return rows;
}

async function run() {
  console.log("=== STARTING STUDENT ACTIVATION MIGRATION ===");
  
  const csvPath = fs.existsSync('/app/books/students_2nd_bac_approved_all.csv')
    ? '/app/books/students_2nd_bac_approved_all.csv'
    : 'books/students_2nd_bac_approved_all.csv';

  console.log(`Reading CSV from: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const csvStudents = parseCsv(csvContent);
  console.log(`Parsed ${csvStudents.length} students from CSV.`);

  // 1. Fetch all existing users from DB
  const existingUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      loginCode: true,
      role: true,
      isActive: true,
      subscriptionStatus: true,
    }
  });
  console.log(`Found ${existingUsers.length} total users in DB.`);

  const dbPhoneMap = new Map();
  const dbCodeMap = new Map();
  for (const u of existingUsers) {
    if (u.phone) dbPhoneMap.set(u.phone.trim(), u);
    if (u.loginCode) dbCodeMap.set(u.loginCode.trim().toUpperCase(), u);
  }

  const approvedDbUserIds = new Set();
  const existingToUpdate = [];
  const newToInsert = [];

  for (const s of csvStudents) {
    const uByCode = s.accessCode ? dbCodeMap.get(s.accessCode) : null;
    const uByPhone = s.phone ? dbPhoneMap.get(s.phone) : null;
    const matched = uByCode || uByPhone;

    const schoolCat = s.track === 'لغات' ? SchoolCategory.LANGUAGES : SchoolCategory.ARABIC;
    const studyMode = s.center ? StudyMode.OFFLINE : StudyMode.ONLINE;

    if (matched) {
      approvedDbUserIds.add(matched.id);
      existingToUpdate.push({
        id: matched.id,
        name: s.name || matched.name,
        phone: s.phone || matched.phone,
        loginCode: s.accessCode || matched.loginCode,
        schoolCategory: schoolCat,
        studyMode,
        centerName: s.center || null,
      });
    } else {
      newToInsert.push({
        name: s.name,
        phone: s.phone,
        loginCode: s.accessCode,
        role: Role.STUDENT,
        gradeId: GRADE_ID,
        systemId: SYSTEM_ID,
        schoolCategory: schoolCat,
        studyMode,
        centerName: s.center || null,
        isActive: true,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        password: DEFAULT_PASSWORD_HASH,
      });
    }
  }

  console.log(`- Existing students to activate & update: ${existingToUpdate.length}`);
  console.log(`- New students to insert & activate: ${newToInsert.length}`);

  // 2. Perform updates for existing matched students in a transaction or batches
  console.log("Updating existing approved students...");
  for (const u of existingToUpdate) {
    await prisma.user.update({
      where: { id: u.id },
      data: {
        isActive: true,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        schoolCategory: u.schoolCategory,
        studyMode: u.studyMode,
        centerName: u.centerName,
        gradeId: GRADE_ID,
        systemId: SYSTEM_ID,
      }
    });
  }
  console.log("Existing students successfully updated to ACTIVE.");

  // 3. Insert the new approved students
  console.log("Inserting new approved students...");
  for (const n of newToInsert) {
    const created = await prisma.user.create({
      data: n,
      select: { id: true, name: true, loginCode: true }
    });
    approvedDbUserIds.add(created.id);
    console.log(`  + Created: ${created.name} (${created.loginCode})`);
  }
  console.log("New students successfully inserted and set to ACTIVE.");

  // 4. Identify students to deactivate
  const toDeactivate = existingUsers.filter(u => u.role === Role.STUDENT && !approvedDbUserIds.has(u.id));
  const toDeactivateIds = toDeactivate.map(u => u.id);
  console.log(`Found ${toDeactivateIds.length} other students to DEACTIVATE.`);

  // Safety confirmation: Staff check
  const staffAccounts = existingUsers.filter(u => u.role !== Role.STUDENT);
  console.log(`Staff accounts preserved untouched (${staffAccounts.length}):`, staffAccounts.map(s => `${s.name} [${s.role}]`));

  // 5. Batch deactivate other students
  if (toDeactivateIds.length > 0) {
    const updateResult = await prisma.user.updateMany({
      where: {
        id: { in: toDeactivateIds },
        role: Role.STUDENT // strict safety
      },
      data: {
        isActive: false,
        subscriptionStatus: SubscriptionStatus.TRIAL,
      }
    });
    console.log(`Deactivated ${updateResult.count} other student accounts.`);

    // Revoke all their active sessions
    const deletedSessions = await prisma.session.deleteMany({
      where: { userId: { in: toDeactivateIds } }
    });
    console.log(`Revoked ${deletedSessions.count} active sessions for deactivated students.`);
  }

  // 6. Post-migration verification
  console.log("\n=== POST-MIGRATION AUDIT ===");
  const auditUsers = await prisma.user.findMany({
    select: {
      id: true,
      role: true,
      isActive: true,
      subscriptionStatus: true,
      schoolCategory: true,
    }
  });

  const activeStudents = auditUsers.filter(u => u.role === Role.STUDENT && u.isActive === true);
  const inactiveStudents = auditUsers.filter(u => u.role === Role.STUDENT && u.isActive === false);
  const activeStaff = auditUsers.filter(u => u.role !== Role.STUDENT && u.isActive === true);

  console.log(`Total users in DB: ${auditUsers.length}`);
  console.log(`ACTIVE approved students: ${activeStudents.length} (Expected: 315)`);
  console.log(`DEACTIVATED other students: ${inactiveStudents.length} (Expected: ${toDeactivateIds.length})`);
  console.log(`Active staff accounts: ${activeStaff.length} (Expected: ${staffAccounts.length})`);

  if (activeStudents.length === 315 && inactiveStudents.length === toDeactivateIds.length && activeStaff.length === staffAccounts.length) {
    console.log("SUCCESS: All verification checks passed with 100% precision!");
  } else {
    console.warn("WARNING: Counts differed from expected, check audit numbers above!");
  }
}

run()
  .catch(err => {
    console.error("Migration error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
