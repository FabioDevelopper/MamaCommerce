import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';

async function main() {
  console.log('🌱 Démarrage du seed pour Sokho Viandes (SQLite)...');

  // Nettoyage préalable ordonné
  await prisma.stockMovement.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.shipmentItem.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 1. Utilisateurs
  const adminHash = await bcrypt.hash('Admin123!', 12);
  const managerHash = await bcrypt.hash('Manager123!', 12);
  const staffHash = await bcrypt.hash('Staff123!', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Aïcha Sokho',
      email: 'admin@sokho-viandes.tg',
      passwordHash: adminHash,
      phone: '+22890123456',
      role: 'ADMIN',
      active: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Moussa Diop',
      email: 'manager@sokho-viandes.tg',
      passwordHash: managerHash,
      phone: '+221771234567',
      role: 'MANAGER',
      active: true,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Koffi Amégan',
      email: 'vendeur@sokho-viandes.tg',
      passwordHash: staffHash,
      phone: '+22891234567',
      role: 'STAFF',
      active: true,
    },
  });

  console.log('✅ 3 Utilisateurs créés (Admin, Manager, Staff)');

  // 2. Produits
  const pBoeufDes = await prisma.product.create({
    data: {
      sku: 'BOEUF-DES',
      name: 'Viande de Bœuf désossée',
      description: 'Morceaux de premier choix conditionnés sous froid',
      unit: 'kg',
      purchasePrice: 4200,
      salePrice: 6000,
      reorderLevel: 30,
    },
  });

  const pBoeufOs = await prisma.product.create({
    data: {
      sku: 'BOEUF-OS',
      name: 'Viande de Bœuf avec os',
      description: 'Côtes et morceaux avec os pour grillades et ragoûts',
      unit: 'kg',
      purchasePrice: 3200,
      salePrice: 4800,
      reorderLevel: 25,
    },
  });

  const pMouton = await prisma.product.create({
    data: {
      sku: 'MOUTON-SAH',
      name: 'Viande de Mouton du Sahel',
      description: 'Mouton tendre du Sénégal idéal pour fêtes et réceptions',
      unit: 'kg',
      purchasePrice: 5200,
      salePrice: 7500,
      reorderLevel: 20,
    },
  });

  const pChevre = await prisma.product.create({
    data: {
      sku: 'CHEVRE-FRAIS',
      name: 'Viande de Chèvre fraîche',
      description: 'Viande caprine fraîche sélectionnée',
      unit: 'kg',
      purchasePrice: 4000,
      salePrice: 5800,
      reorderLevel: 15,
    },
  });

  const pAbats = await prisma.product.create({
    data: {
      sku: 'ABATS-MIX',
      name: 'Abats frais mélangés',
      description: 'Foie, cœur, rognons et tripes fraîches',
      unit: 'kg',
      purchasePrice: 2600,
      salePrice: 4000,
      reorderLevel: 10,
    },
  });

  const pPoulet = await prisma.product.create({
    data: {
      sku: 'POULET-GOL',
      name: 'Poulet Goliath fermier',
      description: 'Poulet fermier élevé au grain, prêt à cuire',
      unit: 'pièce',
      purchasePrice: 3200,
      salePrice: 4800,
      reorderLevel: 15,
    },
  });

  console.log('✅ 6 Produits créés');

  // 3. Fournisseurs au Sénégal
  const fDakar = await prisma.supplier.create({
    data: {
      code: 'FOU-001',
      name: 'Dakar Viandes Express',
      company: 'Abattoirs de Rufisque & Dakar',
      phone: '+221770001122',
      whatsapp: '+221770001122',
      email: 'contact@dakarviandes.sn',
      address: 'Rufisque Nord, Dakar',
      country: 'Sénégal',
    },
  });

  const fTouba = await prisma.supplier.create({
    data: {
      code: 'FOU-002',
      name: 'Boucherie Touba Fret',
      company: 'Gare Routière Beaux Maraîchers',
      phone: '+221780002233',
      whatsapp: '+221780002233',
      address: 'Pikine Beaux Maraîchers, Dakar',
      country: 'Sénégal',
    },
  });

  console.log('✅ 2 Fournisseurs créés');

  // 4. Clients au Togo
  const cGrace = await prisma.customer.create({
    data: {
      code: 'CLI-001',
      name: 'Koffi Mensah',
      businessName: 'Restaurant La Grâce',
      phone: '+22890112233',
      whatsapp: '+22890112233',
      city: 'Lomé',
      address: 'Boulevard du 13 Janvier, Bé-Kpota',
      creditLimit: 300000,
    },
  });

  const cCampement = await prisma.customer.create({
    data: {
      code: 'CLI-002',
      name: 'Afi Dossou',
      businessName: 'Maquis Le Campement',
      phone: '+22891223344',
      whatsapp: '+22891223344',
      city: 'Lomé',
      address: 'Tokoin Doumasséssé',
      creditLimit: 200000,
    },
  });

  const cTonton = await prisma.customer.create({
    data: {
      code: 'CLI-003',
      name: 'Amavi Lawson',
      businessName: 'Grillades Chez Tonton',
      phone: '+22892334455',
      whatsapp: '+22892334455',
      city: 'Lomé',
      address: 'Marché Hedzranawoé',
      creditLimit: 350000,
    },
  });

  const cConcorde = await prisma.customer.create({
    data: {
      code: 'CLI-004',
      name: 'Kodjo Agbéti',
      businessName: 'Supermarché La Concorde',
      phone: '+22893445566',
      whatsapp: '+22893445566',
      city: 'Lomé',
      address: 'Avenue de la Libération, Nyékonakpoé',
      creditLimit: 600000,
    },
  });

  console.log('✅ 4 Clients créés');

  // 5. Arrivages Sénégal -> Togo & Mouvements de stock Entrants
  const now = new Date();
  const dateArrivage1 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const dateArrivage2 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

  // Arrivage 1 : Réceptionné
  const arr1 = await prisma.shipment.create({
    data: {
      reference: 'ARR-2026-001',
      supplierId: fDakar.id,
      origin: 'Sénégal (Dakar)',
      destination: 'Togo (Lomé)',
      status: 'RECEIVED',
      departureDate: new Date(dateArrivage1.getTime() - 2 * 24 * 60 * 60 * 1000),
      arrivalDate: dateArrivage1,
      transportCost: 95000,
      otherCosts: 25000,
      notes: 'Transport par bus frigorifique Dakar-Lomé via Cotonou',
      items: {
        create: [
          {
            productId: pBoeufDes.id,
            quantity: 200,
            unitCost: 4200,
            totalCost: 840000,
          },
          {
            productId: pMouton.id,
            quantity: 120,
            unitCost: 5200,
            totalCost: 624000,
          },
          {
            productId: pAbats.id,
            quantity: 60,
            unitCost: 2600,
            totalCost: 156000,
          },
        ],
      },
    },
  });

  // Mouvements de stock pour l'arrivage 1
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: pBoeufDes.id,
        type: 'IN',
        quantity: 200,
        unitCost: 4200,
        reference: arr1.reference,
        note: 'Réception arrivage ARR-2026-001',
        createdAt: dateArrivage1,
      },
      {
        productId: pMouton.id,
        type: 'IN',
        quantity: 120,
        unitCost: 5200,
        reference: arr1.reference,
        note: 'Réception arrivage ARR-2026-001',
        createdAt: dateArrivage1,
      },
      {
        productId: pAbats.id,
        type: 'IN',
        quantity: 60,
        unitCost: 2600,
        reference: arr1.reference,
        note: 'Réception arrivage ARR-2026-001',
        createdAt: dateArrivage1,
      },
    ],
  });

  // Arrivage 2 : Réceptionné
  const arr2 = await prisma.shipment.create({
    data: {
      reference: 'ARR-2026-002',
      supplierId: fTouba.id,
      origin: 'Sénégal (Dakar)',
      destination: 'Togo (Lomé)',
      status: 'RECEIVED',
      departureDate: new Date(dateArrivage2.getTime() - 2 * 24 * 60 * 60 * 1000),
      arrivalDate: dateArrivage2,
      transportCost: 80000,
      otherCosts: 20000,
      notes: 'Deuxième lot viande bovine avec os et volaille',
      items: {
        create: [
          {
            productId: pBoeufOs.id,
            quantity: 150,
            unitCost: 3200,
            totalCost: 480000,
          },
          {
            productId: pChevre.id,
            quantity: 80,
            unitCost: 4000,
            totalCost: 320000,
          },
          {
            productId: pPoulet.id,
            quantity: 45,
            unitCost: 3200,
            totalCost: 144000,
          },
        ],
      },
    },
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        productId: pBoeufOs.id,
        type: 'IN',
        quantity: 150,
        unitCost: 3200,
        reference: arr2.reference,
        note: 'Réception arrivage ARR-2026-002',
        createdAt: dateArrivage2,
      },
      {
        productId: pChevre.id,
        type: 'IN',
        quantity: 80,
        unitCost: 4000,
        reference: arr2.reference,
        note: 'Réception arrivage ARR-2026-002',
        createdAt: dateArrivage2,
      },
      {
        productId: pPoulet.id,
        type: 'IN',
        quantity: 45,
        unitCost: 3200,
        reference: arr2.reference,
        note: 'Réception arrivage ARR-2026-002',
        createdAt: dateArrivage2,
      },
    ],
  });

  // Arrivage 3 : En cours de transit
  await prisma.shipment.create({
    data: {
      reference: 'ARR-2026-003',
      supplierId: fDakar.id,
      origin: 'Sénégal (Dakar)',
      destination: 'Togo (Lomé)',
      status: 'IN_TRANSIT',
      departureDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      arrivalDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      transportCost: 110000,
      otherCosts: 30000,
      notes: 'Cargaison en cours de route via corridor routier',
      items: {
        create: [
          {
            productId: pBoeufDes.id,
            quantity: 250,
            unitCost: 4200,
            totalCost: 1050000,
          },
          {
            productId: pMouton.id,
            quantity: 150,
            unitCost: 5200,
            totalCost: 780000,
          },
        ],
      },
    },
  });

  console.log('✅ 3 Arrivages créés (2 réceptionnés avec entrées en stock, 1 en transit)');

  // 6. Commandes, Paiements & Sorties de Stock
  const dateCmd1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dateCmd2 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const dateCmd3 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const dateCmd4 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  // Commande 1 : Restaurant La Grâce (Partiellement payée avec crédit restant)
  // 30 kg Boeuf Des @ 6000 = 180000 + 10 kg Mouton @ 7500 = 75000 => Total 255000 FCFA
  const cmd1 = await prisma.order.create({
    data: {
      number: 'CMD-20260911-001',
      customerId: cGrace.id,
      userId: staff.id,
      status: 'CONFIRMED',
      orderDate: dateCmd1,
      dueDate: new Date(dateCmd1.getTime() + 14 * 24 * 60 * 60 * 1000),
      subtotal: 255000,
      discount: 0,
      total: 255000,
      paidTotal: 150000,
      creditTotal: 105000,
      notes: 'Acompte espèces versé à la livraison',
      items: {
        create: [
          {
            productId: pBoeufDes.id,
            quantity: 30,
            unitPrice: 6000,
            total: 180000,
          },
          {
            productId: pMouton.id,
            quantity: 10,
            unitPrice: 7500,
            total: 75000,
          },
        ],
      },
      payments: {
        create: {
          reference: 'PAY-20260911-001',
          customerId: cGrace.id,
          userId: staff.id,
          amount: 150000,
          method: 'CASH',
          receivedAt: dateCmd1,
          note: 'Acompte commande CMD-20260911-001',
        },
      },
    },
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        productId: pBoeufDes.id,
        type: 'OUT',
        quantity: 30,
        unitCost: 4200,
        reference: cmd1.number,
        note: 'Vente Restaurant La Grâce',
        createdAt: dateCmd1,
      },
      {
        productId: pMouton.id,
        type: 'OUT',
        quantity: 10,
        unitCost: 5200,
        reference: cmd1.number,
        note: 'Vente Restaurant La Grâce',
        createdAt: dateCmd1,
      },
    ],
  });

  // Commande 2 : Maquis Le Campement (Payée intégralement par TMoney)
  // 25 kg Boeuf avec os @ 4800 = 120000 + 15 kg Abats @ 4000 = 60000 => Total 180000 FCFA
  const cmd2 = await prisma.order.create({
    data: {
      number: 'CMD-20260913-002',
      customerId: cCampement.id,
      userId: staff.id,
      status: 'DELIVERED',
      orderDate: dateCmd2,
      subtotal: 180000,
      discount: 0,
      total: 180000,
      paidTotal: 180000,
      creditTotal: 0,
      notes: 'Règlement total via TMoney',
      items: {
        create: [
          {
            productId: pBoeufOs.id,
            quantity: 25,
            unitPrice: 4800,
            total: 120000,
          },
          {
            productId: pAbats.id,
            quantity: 15,
            unitPrice: 4000,
            total: 60000,
          },
        ],
      },
      payments: {
        create: {
          reference: 'PAY-20260913-002',
          customerId: cCampement.id,
          userId: staff.id,
          amount: 180000,
          method: 'TMONEY',
          receivedAt: dateCmd2,
          note: 'Règlement TMoney n° 91223344',
        },
      },
    },
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        productId: pBoeufOs.id,
        type: 'OUT',
        quantity: 25,
        unitCost: 3200,
        reference: cmd2.number,
        note: 'Vente Maquis Le Campement',
        createdAt: dateCmd2,
      },
      {
        productId: pAbats.id,
        type: 'OUT',
        quantity: 15,
        unitCost: 2600,
        reference: cmd2.number,
        note: 'Vente Maquis Le Campement',
        createdAt: dateCmd2,
      },
    ],
  });

  // Commande 3 : Grillades Chez Tonton (Crédit en retard - alerte dashboard)
  // 35 kg Boeuf Des @ 6000 = 210000 + 12 pcs Poulet @ 4800 = 57600 => Total 267600 FCFA
  // Payé 50 000, Reste 217 600 FCFA avec échéance dépassée il y a 1 jour
  const cmd3 = await prisma.order.create({
    data: {
      number: 'CMD-20260916-003',
      customerId: cTonton.id,
      userId: staff.id,
      status: 'CONFIRMED',
      orderDate: dateCmd3,
      dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // En retard !
      subtotal: 267600,
      discount: 0,
      total: 267600,
      paidTotal: 50000,
      creditTotal: 217600,
      notes: 'Promesse de virement sous 48h (Relance requise)',
      items: {
        create: [
          {
            productId: pBoeufDes.id,
            quantity: 35,
            unitPrice: 6000,
            total: 210000,
          },
          {
            productId: pPoulet.id,
            quantity: 12,
            unitPrice: 4800,
            total: 57600,
          },
        ],
      },
      payments: {
        create: {
          reference: 'PAY-20260916-003',
          customerId: cTonton.id,
          userId: staff.id,
          amount: 50000,
          method: 'MOOV_MONEY',
          receivedAt: dateCmd3,
          note: 'Acompte Moov Money',
        },
      },
    },
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        productId: pBoeufDes.id,
        type: 'OUT',
        quantity: 35,
        unitCost: 4200,
        reference: cmd3.number,
        note: 'Vente Grillades Chez Tonton',
        createdAt: dateCmd3,
      },
      {
        productId: pPoulet.id,
        type: 'OUT',
        quantity: 12,
        unitCost: 3200,
        reference: cmd3.number,
        note: 'Vente Grillades Chez Tonton',
        createdAt: dateCmd3,
      },
    ],
  });

  // Commande 4 : Supermarché La Concorde (Payée par Virement)
  // 50 kg Boeuf Des @ 6000 = 300000 + 30 kg Mouton @ 7500 = 225000 => Total 525000 FCFA
  const cmd4 = await prisma.order.create({
    data: {
      number: 'CMD-20260917-004',
      customerId: cConcorde.id,
      userId: admin.id,
      status: 'DELIVERED',
      orderDate: dateCmd4,
      subtotal: 525000,
      discount: 0,
      total: 525000,
      paidTotal: 525000,
      creditTotal: 0,
      notes: 'Commande hebdomadaire rayon boucherie',
      items: {
        create: [
          {
            productId: pBoeufDes.id,
            quantity: 50,
            unitPrice: 6000,
            total: 300000,
          },
          {
            productId: pMouton.id,
            quantity: 30,
            unitPrice: 7500,
            total: 225000,
          },
        ],
      },
      payments: {
        create: {
          reference: 'PAY-20260917-004',
          customerId: cConcorde.id,
          userId: admin.id,
          amount: 525000,
          method: 'BANK_TRANSFER',
          receivedAt: dateCmd4,
          note: 'Virement bancaire Ecobank Togo',
        },
      },
    },
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        productId: pBoeufDes.id,
        type: 'OUT',
        quantity: 50,
        unitCost: 4200,
        reference: cmd4.number,
        note: 'Vente Supermarché La Concorde',
        createdAt: dateCmd4,
      },
      {
        productId: pMouton.id,
        type: 'OUT',
        quantity: 30,
        unitCost: 5200,
        reference: cmd4.number,
        note: 'Vente Supermarché La Concorde',
        createdAt: dateCmd4,
      },
    ],
  });

  console.log('✅ 4 Commandes créées avec paiements et mouvements de stock sortants');

  // 7. Dépenses d'exploitation
  await prisma.expense.createMany({
    data: [
      {
        reference: 'DEP-20260910-001',
        category: 'TRANSPORT',
        amount: 95000,
        expenseDate: dateArrivage1,
        description: 'Frais fret routier bus Dakar - Lomé (ARR-2026-001)',
        shipmentId: arr1.id,
        userId: manager.id,
      },
      {
        reference: 'DEP-20260910-002',
        category: 'MANUTENTION',
        amount: 25000,
        expenseDate: dateArrivage1,
        description: 'Déchargement et transport vers chambre froide Lomé',
        shipmentId: arr1.id,
        userId: admin.id,
      },
      {
        reference: 'DEP-20260912-003',
        category: 'CARBURANT',
        amount: 15000,
        expenseDate: dateCmd1,
        description: 'Carburant moto triporteur pour livraisons clients Lomé',
        userId: staff.id,
      },
      {
        reference: 'DEP-20260914-004',
        category: 'TRANSPORT',
        amount: 80000,
        expenseDate: dateArrivage2,
        description: 'Fret arrivage lot 2 (ARR-2026-002)',
        shipmentId: arr2.id,
        userId: manager.id,
      },
      {
        reference: 'DEP-20260915-005',
        category: 'COMMUNICATION',
        amount: 10000,
        expenseDate: dateCmd3,
        description: 'Forfait internet et communications WhatsApp Sénégal-Togo',
        userId: admin.id,
      },
    ],
  });

  console.log('✅ 5 Dépenses enregistrées');

  console.log('\n======================================================');
  console.log('🎉 Initialisation terminée avec succès !');
  console.log('Base de données : dev.db (SQLite)');
  console.log('Comptes de test disponibles :');
  console.log('  👑 ADMIN   : admin@sokho-viandes.tg    / Admin123!');
  console.log('  👔 MANAGER : manager@sokho-viandes.tg  / Manager123!');
  console.log('  🛒 STAFF   : vendeur@sokho-viandes.tg  / Staff123!');
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
