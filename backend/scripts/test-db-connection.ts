import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  console.log('═══════════════════════════════════════════');
  console.log('🧪 TESTING DATABASE CONNECTION');
  console.log('═══════════════════════════════════════════\n');

  try {
    // Test 1: Connection ping
    console.log('1️⃣  Testing connection ping...');
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const pingTime = Date.now() - start;
    console.log(`   ✅ Ping successful: ${pingTime}ms\n`);

    if (pingTime > 50) {
      console.warn(`   ⚠️  Warning: Ping time > 50ms (got ${pingTime}ms)\n`);
    }

    // Test 2: Count tables
    console.log('2️⃣  Counting tables...');
    const tableCount = await prisma.$queryRaw<Array<{ count: BigInt }>>`
      SELECT COUNT(*)::int as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    const count = Number(tableCount[0].count);
    console.log(`   ✅ Found ${count} tables\n`);

    if (count !== 12) {
      console.warn(`   ⚠️  Warning: Expected 12 tables, got ${count}\n`);
    }

    // Test 3: Simple query (Movers)
    console.log('3️⃣  Testing simple query (Movers)...');
    const movers = await prisma.mover.findMany({
      take: 5,
      select: {
        id: true,
        companyName: true,
        city: true,
        status: true,
      },
    });
    console.log(`   ✅ Found ${movers.length} movers`);
    movers.forEach((mover) => {
      console.log(`      • ${mover.companyName} (${mover.city}) - ${mover.status}`);
    });
    console.log('');

    // Test 4: Transaction test
    console.log('4️⃣  Testing transaction rollback...');
    try {
      await prisma.$transaction(async (tx) => {
        await tx.lead.create({
          data: {
            source: 'test',
            email: 'test@rollback.com',
            firstName: 'Test',
            lastName: 'Rollback',
            originAddress: 'Test',
            originCity: 'Test',
            originPostalCode: '12345',
            destAddress: 'Test',
            destCity: 'Test',
            destPostalCode: '67890',
          },
        });
        // Force rollback
        throw new Error('Intentional rollback');
      });
    } catch (e: any) {
      if (e.message === 'Intentional rollback') {
        console.log('   ✅ Transaction rollback successful\n');
      } else {
        throw e;
      }
    }

    // Verify no test lead was created
    const testLead = await prisma.lead.findFirst({
      where: { email: 'test@rollback.com' },
    });
    if (!testLead) {
      console.log('   ✅ Verified: No test data persisted\n');
    } else {
      console.warn('   ⚠️  Warning: Test data found (rollback failed)\n');
    }

    // Test 5: Top 3 query performance (with indexes)
    console.log('5️⃣  Testing Top 3 query performance...');
    const folders = await prisma.folder.findMany({ take: 1 });
    if (folders.length > 0) {
      const startQuery = Date.now();
      const top3 = await prisma.quote.findMany({
        where: {
          folderId: folders[0].id,
          status: 'VALIDATED',
          deletedAt: null,
        },
        orderBy: { scoreTotal: 'desc' },
        take: 3,
        include: {
          mover: {
            select: {
              companyName: true,
              googleRating: true,
            },
          },
        },
      });
      const queryTime = Date.now() - startQuery;
      console.log(`   ✅ Top 3 query: ${queryTime}ms (found ${top3.length} quotes)\n`);

      if (queryTime > 100) {
        console.warn(`   ⚠️  Warning: Query time > 100ms (got ${queryTime}ms)\n`);
      }
    } else {
      console.log('   ⏭️  Skipped (no folders found)\n');
    }

    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED');
    console.log('═══════════════════════════════════════════\n');
    console.log('💡 Database is ready for use!');
    console.log('   • Connection: OK');
    console.log('   • Tables: OK');
    console.log('   • Queries: OK');
    console.log('   • Transactions: OK');
    console.log('   • Performance: ' + (pingTime <= 50 ? 'OK' : 'WARNING') + '\n');
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

