import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // ============================================
  // 1. CREATE MOVERS
  // ============================================
  console.log('📦 Creating Movers...');
  
  const movers = await Promise.all([
    prisma.mover.create({
      data: {
        companyName: "Déménagements Bordeaux Pro",
        siret: "12345678901234",
        email: "contact@bordeaux-pro.fr",
        phone: "0556123456",
        address: "123 Rue Sainte-Catherine",
        city: "Bordeaux",
        postalCode: "33000",
        googlePlaceId: "ChIJ_bordeaux_123",
        googleRating: new Prisma.Decimal("4.5"),
        googleReviewsCount: 87,
        creditSafeScore: 75,
        creditSafeNotes: "Entreprise solide, 10 ans d'ancienneté",
        status: "ACTIVE",
        coverageZones: JSON.stringify(["33", "40", "47", "24"]),
      },
    }),
    prisma.mover.create({
      data: {
        companyName: "Paris Move Services",
        siret: "98765432109876",
        email: "hello@paris-move.fr",
        phone: "0145678901",
        address: "45 Avenue des Champs-Élysées",
        city: "Paris",
        postalCode: "75008",
        googlePlaceId: "ChIJ_paris_456",
        googleRating: new Prisma.Decimal("4.8"),
        googleReviewsCount: 152,
        creditSafeScore: 85,
        creditSafeNotes: "Excellent rating, leader parisien",
        status: "ACTIVE",
        coverageZones: JSON.stringify(["75", "92", "93", "94"]),
      },
    }),
    prisma.mover.create({
      data: {
        companyName: "Lyon Déménagement Express",
        siret: "11223344556677",
        email: "contact@lyon-express.fr",
        phone: "0472345678",
        address: "12 Place Bellecour",
        city: "Lyon",
        postalCode: "69002",
        googlePlaceId: "ChIJ_lyon_789",
        googleRating: new Prisma.Decimal("4.2"),
        googleReviewsCount: 64,
        creditSafeScore: 68,
        status: "ACTIVE",
        coverageZones: JSON.stringify(["69", "01", "42", "38"]),
      },
    }),
    prisma.mover.create({
      data: {
        companyName: "Marseille Logistique",
        siret: "22334455667788",
        email: "info@marseille-logistique.fr",
        phone: "0491234567",
        address: "7 Vieux-Port",
        city: "Marseille",
        postalCode: "13001",
        googlePlaceId: "ChIJ_marseille_101",
        googleRating: new Prisma.Decimal("4.0"),
        googleReviewsCount: 43,
        status: "PENDING",
        coverageZones: JSON.stringify(["13", "83", "84"]),
      },
    }),
    prisma.mover.create({
      data: {
        companyName: "Toulouse Trans Services",
        siret: "33445566778899",
        email: "contact@toulouse-trans.fr",
        phone: "0562987654",
        address: "22 Place du Capitole",
        city: "Toulouse",
        postalCode: "31000",
        googlePlaceId: "ChIJ_toulouse_202",
        googleRating: new Prisma.Decimal("4.6"),
        googleReviewsCount: 91,
        creditSafeScore: 80,
        status: "ACTIVE",
        coverageZones: JSON.stringify(["31", "32", "81", "82"]),
      },
    }),
  ]);
  
  console.log(`✅ Created ${movers.length} movers\n`);

  // ============================================
  // 2. CREATE PRICING GRIDS
  // ============================================
  console.log('💰 Creating Pricing Grids...');
  
  const pricingGridsData: Prisma.PricingGridCreateManyInput[] = [];
  
  for (const mover of movers.slice(0, 4)) { // Only first 4 movers have grids
    pricingGridsData.push(
      // Small volume, short distance
      {
        moverId: mover.id,
        volumeMin: new Prisma.Decimal("5"),
        volumeMax: new Prisma.Decimal("15"),
        distanceMin: new Prisma.Decimal("0"),
        distanceMax: new Prisma.Decimal("50"),
        basePrice: new Prisma.Decimal("400"),
        pricePerM3: new Prisma.Decimal("25"),
        pricePerKm: new Prisma.Decimal("1.5"),
        packingPrice: new Prisma.Decimal("150"),
        storagePrice: new Prisma.Decimal("20"),
        insurancePrice: new Prisma.Decimal("50"),
      },
      // Medium volume, medium distance
      {
        moverId: mover.id,
        volumeMin: new Prisma.Decimal("15"),
        volumeMax: new Prisma.Decimal("30"),
        distanceMin: new Prisma.Decimal("0"),
        distanceMax: new Prisma.Decimal("150"),
        basePrice: new Prisma.Decimal("800"),
        pricePerM3: new Prisma.Decimal("35"),
        pricePerKm: new Prisma.Decimal("2"),
        packingPrice: new Prisma.Decimal("250"),
        storagePrice: new Prisma.Decimal("30"),
        insurancePrice: new Prisma.Decimal("80"),
      },
      // Large volume, long distance
      {
        moverId: mover.id,
        volumeMin: new Prisma.Decimal("30"),
        volumeMax: new Prisma.Decimal("60"),
        distanceMin: new Prisma.Decimal("150"),
        distanceMax: new Prisma.Decimal("500"),
        basePrice: new Prisma.Decimal("1500"),
        pricePerM3: new Prisma.Decimal("50"),
        pricePerKm: new Prisma.Decimal("2.5"),
        packingPrice: new Prisma.Decimal("400"),
        storagePrice: new Prisma.Decimal("50"),
        insurancePrice: new Prisma.Decimal("120"),
      }
    );
  }
  
  await prisma.pricingGrid.createMany({ data: pricingGridsData });
  console.log(`✅ Created ${pricingGridsData.length} pricing grids\n`);

  // ============================================
  // 3. CREATE USERS
  // ============================================
  console.log('👥 Creating Users...');
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@moverz.fr",
        passwordHash: "$2a$10$KGR5O8XMvJxVg6JxqKZmXeP1Q8YqWYzKg5xKqZmXeP1Q8YqWYzKg5", // "password123"
        firstName: "Admin",
        lastName: "Moverz",
        phone: "0612345678",
        role: "ADMIN",
        active: true,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "operator@moverz.fr",
        passwordHash: "$2a$10$KGR5O8XMvJxVg6JxqKZmXeP1Q8YqWYzKg5xKqZmXeP1Q8YqWYzKg5",
        firstName: "Sarah",
        lastName: "Martin",
        phone: "0623456789",
        role: "OPERATOR",
        active: true,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "operator2@moverz.fr",
        passwordHash: "$2a$10$KGR5O8XMvJxVg6JxqKZmXeP1Q8YqWYzKg5xKqZmXeP1Q8YqWYzKg5",
        firstName: "Pierre",
        lastName: "Dubois",
        phone: "0634567890",
        role: "OPERATOR",
        active: true,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "owner@bordeaux-pro.fr",
        passwordHash: "$2a$10$KGR5O8XMvJxVg6JxqKZmXeP1Q8YqWYzKg5xKqZmXeP1Q8YqWYzKg5",
        firstName: "Jean",
        lastName: "Dupont",
        phone: "0645678901",
        role: "MOVER_OWNER",
        moverId: movers[0].id,
        active: true,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "owner@paris-move.fr",
        passwordHash: "$2a$10$KGR5O8XMvJxVg6JxqKZmXeP1Q8YqWYzKg5xKqZmXeP1Q8YqWYzKg5",
        firstName: "Marie",
        lastName: "Bernard",
        phone: "0656789012",
        role: "MOVER_OWNER",
        moverId: movers[1].id,
        active: true,
        emailVerified: true,
      },
    }),
  ]);
  
  console.log(`✅ Created ${users.length} users\n`);

  // ============================================
  // 4. CREATE CLIENTS, LEADS, FOLDERS
  // ============================================
  console.log('📋 Creating Clients, Leads & Folders...');
  
  const foldersCreated = [];
  
  // Folder 1: Bordeaux → Paris (QUOTES_PENDING)
  const client1 = await prisma.client.create({
    data: {
      email: "client1@example.com",
      phone: "0612345601",
      firstName: "Sophie",
      lastName: "Leroy",
    },
  });
  
  const lead1 = await prisma.lead.create({
    data: {
      source: "bordeaux-demenageur.fr",
      email: client1.email,
      phone: client1.phone,
      firstName: client1.firstName,
      lastName: client1.lastName,
      originAddress: "5 Place de la Bourse",
      originCity: "Bordeaux",
      originPostalCode: "33000",
      destAddress: "20 Rue de Rivoli",
      destCity: "Paris",
      destPostalCode: "75001",
      estimatedVolume: new Prisma.Decimal("18.5"),
      estimationMethod: "FORM",
      movingDate: new Date('2025-12-15'),
      status: "CONVERTED",
      convertedAt: new Date(),
    },
  });
  
  const folder1 = await prisma.folder.create({
    data: {
      leadId: lead1.id,
      clientId: client1.id,
      originAddress: lead1.originAddress,
      originCity: lead1.originCity,
      originPostalCode: lead1.originPostalCode,
      originFloor: 2,
      originElevator: true,
      destAddress: lead1.destAddress,
      destCity: lead1.destCity,
      destPostalCode: lead1.destPostalCode,
      destFloor: 3,
      destElevator: false,
      volume: new Prisma.Decimal("18.5"),
      distance: new Prisma.Decimal("584.2"),
      movingDate: new Date('2025-12-15'),
      needPacking: true,
      status: "QUOTES_PENDING",
      quotesRequestedAt: new Date(),
    },
  });
  foldersCreated.push(folder1);
  
  // Folder 2: Paris → Lyon (TOP3_READY)
  const client2 = await prisma.client.create({
    data: {
      email: "client2@example.com",
      phone: "0623456702",
      firstName: "Marc",
      lastName: "Petit",
    },
  });
  
  const folder2 = await prisma.folder.create({
    data: {
      clientId: client2.id,
      originAddress: "15 Avenue Montaigne",
      originCity: "Paris",
      originPostalCode: "75008",
      originFloor: 5,
      originElevator: true,
      destAddress: "8 Rue Victor Hugo",
      destCity: "Lyon",
      destPostalCode: "69002",
      destFloor: 1,
      destElevator: false,
      volume: new Prisma.Decimal("25.0"),
      distance: new Prisma.Decimal("465.0"),
      movingDate: new Date('2026-01-10'),
      needPacking: true,
      needInsurance: true,
      status: "TOP3_READY",
      quotesRequestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      top3ReadyAt: new Date(),
    },
  });
  foldersCreated.push(folder2);
  
  // Folder 3: Lyon → Marseille (CONFIRMED - with booking)
  const client3 = await prisma.client.create({
    data: {
      email: "client3@example.com",
      phone: "0634567803",
      firstName: "Julie",
      lastName: "Moreau",
    },
  });
  
  const folder3 = await prisma.folder.create({
    data: {
      clientId: client3.id,
      originAddress: "10 Rue de la République",
      originCity: "Lyon",
      originPostalCode: "69002",
      originFloor: 0,
      originElevator: false,
      destAddress: "32 La Canebière",
      destCity: "Marseille",
      destPostalCode: "13001",
      destFloor: 4,
      destElevator: true,
      volume: new Prisma.Decimal("12.0"),
      distance: new Prisma.Decimal("315.0"),
      movingDate: new Date('2026-02-01'),
      needStorage: true,
      status: "CONFIRMED",
      quotesRequestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      top3ReadyAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      confirmedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });
  foldersCreated.push(folder3);
  
  console.log(`✅ Created ${foldersCreated.length} clients, leads & folders\n`);

  // ============================================
  // 5. CREATE QUOTES
  // ============================================
  console.log('📄 Creating Quotes...');
  
  const quotes = [];
  
  // Folder 1: 4 quotes (mixed status)
  for (const [index, mover] of movers.slice(0, 4).entries()) {
    const quote = await prisma.quote.create({
      data: {
        folderId: folder1.id,
        moverId: mover.id,
        source: index < 3 ? "AUTO_GENERATED" : "EMAIL_PARSED",
        totalPrice: new Prisma.Decimal((1200 + index * 150).toFixed(2)),
        currency: "EUR",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        status: index === 0 ? "VALIDATED" : index === 1 ? "VALIDATED" : index === 2 ? "REMINDED" : "REQUESTED",
        reminderCount: index === 2 ? 1 : 0,
        lastRemindedAt: index === 2 ? new Date() : null,
        scorePrice: index < 2 ? new Prisma.Decimal((85 - index * 5).toFixed(2)) : null,
        scoreGoogle: index < 2 ? new Prisma.Decimal((90 - index * 3).toFixed(2)) : null,
        scoreFinancial: index < 2 ? new Prisma.Decimal((75 + index * 5).toFixed(2)) : null,
        scoreTotal: index < 2 ? new Prisma.Decimal((83.33 - index * 2).toFixed(2)) : null,
      },
    });
    quotes.push(quote);
  }
  
  // Folder 2: 5 quotes (TOP3_READY with scores)
  for (const [index, mover] of movers.entries()) {
    const quote = await prisma.quote.create({
      data: {
        folderId: folder2.id,
        moverId: mover.id,
        source: "AUTO_GENERATED",
        totalPrice: new Prisma.Decimal((1800 + index * 100).toFixed(2)),
        currency: "EUR",
        validUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: "VALIDATED",
        validatedByUserId: users[0].id, // Admin validated
        validatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        scorePrice: new Prisma.Decimal((90 - index * 5).toFixed(2)),
        scoreGoogle: new Prisma.Decimal((88 - index * 2).toFixed(2)),
        scoreFinancial: new Prisma.Decimal((75 + index * 3).toFixed(2)),
        scoreLitigations: new Prisma.Decimal((95 - index * 1).toFixed(2)),
        scoreTotal: new Prisma.Decimal((87 - index * 2.5).toFixed(2)),
      },
    });
    quotes.push(quote);
  }
  
  // Folder 3: 1 SELECTED quote (for booking)
  const selectedQuote = await prisma.quote.create({
    data: {
      folderId: folder3.id,
      moverId: movers[2].id,
      source: "AUTO_GENERATED",
      totalPrice: new Prisma.Decimal("950.00"),
      currency: "EUR",
      validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: "SELECTED",
      validatedByUserId: users[0].id,
      validatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      scorePrice: new Prisma.Decimal("92.00"),
      scoreGoogle: new Prisma.Decimal("88.00"),
      scoreFinancial: new Prisma.Decimal("78.00"),
      scoreTotal: new Prisma.Decimal("86.00"),
    },
  });
  quotes.push(selectedQuote);
  
  // Update folder3 with selectedQuoteId
  await prisma.folder.update({
    where: { id: folder3.id },
    data: { selectedQuoteId: selectedQuote.id },
  });
  
  console.log(`✅ Created ${quotes.length} quotes\n`);

  // ============================================
  // 6. CREATE TOP3 SELECTION (for folder2)
  // ============================================
  console.log('🏆 Creating Top3 Selection...');
  
  const folder2Quotes = quotes.filter(q => q.folderId === folder2.id);
  const top3Quotes = folder2Quotes.slice(0, 3); // Top 3 by scoreTotal
  
  const top3Selection = await prisma.top3Selection.create({
    data: {
      folderId: folder2.id,
      quote1Id: top3Quotes[0].id,
      quote2Id: top3Quotes[1].id,
      quote3Id: top3Quotes[2].id,
      quote1ScoreTotal: top3Quotes[0].scoreTotal!,
      quote1Price: top3Quotes[0].totalPrice,
      quote2ScoreTotal: top3Quotes[1].scoreTotal!,
      quote2Price: top3Quotes[1].totalPrice,
      quote3ScoreTotal: top3Quotes[2].scoreTotal!,
      quote3Price: top3Quotes[2].totalPrice,
      presentedAt: new Date(),
    },
  });
  
  console.log(`✅ Created 1 top3 selection\n`);

  // ============================================
  // 7. CREATE BOOKING & PAYMENT (for folder3)
  // ============================================
  console.log('💳 Creating Booking & Payment...');
  
  const booking = await prisma.booking.create({
    data: {
      folderId: folder3.id,
      quoteId: selectedQuote.id,
      totalAmount: selectedQuote.totalPrice,
      depositAmount: new Prisma.Decimal((parseFloat(selectedQuote.totalPrice.toString()) * 0.3).toFixed(2)),
      remainingAmount: new Prisma.Decimal((parseFloat(selectedQuote.totalPrice.toString()) * 0.7).toFixed(2)),
      status: "CONFIRMED",
      confirmedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      contactExchangedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });
  
  const depositAmount = parseFloat(booking.depositAmount.toString());
  const commissionRate = 0.10; // 10%
  const commissionAmount = depositAmount * commissionRate;
  const moverAmount = depositAmount - commissionAmount;
  
  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      type: "DEPOSIT",
      amount: booking.depositAmount,
      currency: "EUR",
      commissionRate: new Prisma.Decimal("0.10"),
      commissionAmount: new Prisma.Decimal(commissionAmount.toFixed(2)),
      moverAmount: new Prisma.Decimal(moverAmount.toFixed(2)),
      stripePaymentIntentId: "pi_test_123456789",
      idempotencyKey: "idem_folder3_deposit",
      status: "SUCCEEDED",
      paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });
  
  console.log(`✅ Created 1 booking & 1 payment\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('═══════════════════════════════════════════');
  console.log('✅ SEED COMPLETED SUCCESSFULLY');
  console.log('═══════════════════════════════════════════\n');
  console.log(`📊 Summary:`);
  console.log(`  • ${movers.length} Movers`);
  console.log(`  • ${pricingGridsData.length} Pricing Grids`);
  console.log(`  • ${users.length} Users`);
  console.log(`  • ${foldersCreated.length} Clients & Folders`);
  console.log(`  • ${quotes.length} Quotes`);
  console.log(`  • 1 Top3 Selection`);
  console.log(`  • 1 Booking`);
  console.log(`  • 1 Payment`);
  console.log('\n💡 Next steps:');
  console.log('  • npx prisma studio (view data)');
  console.log('  • pnpm db:test (test connection)');
  console.log('  • Start building API routes!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

