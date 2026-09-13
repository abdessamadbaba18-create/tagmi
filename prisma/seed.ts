import { PrismaClient, Role, PropertyStatus, TransactionType, PropertyType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.review.deleteMany();
  await prisma.blogTag.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.blogCategory.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.order.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.leadInteraction.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.propertyView.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.propertyVideo.deleteMany();
  await prisma.propertyFeature.deleteMany();
  await prisma.property.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.developmentUnit.deleteMany();
  await prisma.developmentProject.deleteMany();
  await prisma.developer.deleteMany();
  await prisma.neighborhood.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("Password123!", 12);

  // Create Users
  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@tagmi.ma",
      passwordHash,
      firstName: "Admin",
      lastName: "TAGMI",
      role: Role.SUPER_ADMIN,
      emailVerified: true,
    },
  });

  const agencyOwner = await prisma.user.create({
    data: {
      email: "agency@tagmi.ma",
      passwordHash,
      firstName: "Mohammed",
      lastName: "Alami",
      phone: "+212600000001",
      role: Role.AGENCY_OWNER,
      emailVerified: true,
    },
  });

  const agent1User = await prisma.user.create({
    data: {
      email: "agent1@tagmi.ma",
      passwordHash,
      firstName: "Fatima",
      lastName: "Benali",
      phone: "+212600000002",
      role: Role.AGENT,
      emailVerified: true,
    },
  });

  const agent2User = await prisma.user.create({
    data: {
      email: "agent2@tagmi.ma",
      passwordHash,
      firstName: "Youssef",
      lastName: "Tazi",
      phone: "+212600000003",
      role: Role.AGENT,
      emailVerified: true,
    },
  });

  const buyer1 = await prisma.user.create({
    data: {
      email: "buyer1@tagmi.ma",
      passwordHash,
      firstName: "Sara",
      lastName: "Idrissi",
      phone: "+212600000004",
      role: Role.BUYER,
      emailVerified: true,
    },
  });

  const propertyOwner1 = await prisma.user.create({
    data: {
      email: "owner1@tagmi.ma",
      passwordHash,
      firstName: "Khalid",
      lastName: "Bennani",
      phone: "+212600000005",
      role: Role.PROPERTY_OWNER,
      emailVerified: true,
    },
  });

  console.log("✅ Users created");

  // Create Cities
  const marrakech = await prisma.city.create({
    data: {
      name: "Marrakech",
      slug: "marrakech",
      nameAr: "مراكش",
      nameFr: "Marrakech",
      description: "La perle du sud marocain",
      latitude: 31.6295,
      longitude: -7.9811,
    },
  });

  const casablanca = await prisma.city.create({
    data: {
      name: "Casablanca",
      slug: "casablanca",
      nameAr: "الدار البيضاء",
      nameFr: "Casablanca",
      description: "La capitale économique du Maroc",
      latitude: 33.5731,
      longitude: -7.5898,
    },
  });

  const rabat = await prisma.city.create({
    data: {
      name: "Rabat",
      slug: "rabat",
      nameAr: "الرباط",
      nameFr: "Rabat",
      description: "La capitale administrative",
      latitude: 34.0209,
      longitude: -6.8416,
    },
  });

  const agadir = await prisma.city.create({
    data: {
      name: "Agadir",
      slug: "agadir",
      nameAr: "أكادير",
      nameFr: "Agadir",
      description: "Perle de l'Atlantique",
      latitude: 30.4278,
      longitude: -9.5981,
    },
  });

  console.log("✅ Cities created");

  // Create Neighborhoods
  const gueliz = await prisma.neighborhood.create({
    data: {
      name: "Gueliz",
      slug: "gueliz",
      nameAr: "گليز",
      nameFr: "Gueliz",
      description: "Le quartier moderne de Marrakech",
      cityId: marrakech.id,
      latitude: 31.6373,
      longitude: -7.9891,
    },
  });

  const hivernage = await prisma.neighborhood.create({
    data: {
      name: "Hivernage",
      slug: "hivernage",
      nameAr: "إيفريناج",
      nameFr: "Hivernage",
      description: "Quartier luxueux de Marrakech",
      cityId: marrakech.id,
      latitude: 31.6222,
      longitude: -8.0096,
    },
  });

  const medina = await prisma.neighborhood.create({
    data: {
      name: "Medina",
      slug: "medina",
      nameAr: "المدينة القديمة",
      nameFr: "Médina",
      description: "La vieille ville de Marrakech",
      cityId: marrakech.id,
      latitude: 31.6325,
      longitude: -7.9922,
    },
  });

  const targa = await prisma.neighborhood.create({
    data: {
      name: "Targa",
      slug: "targa",
      nameAr: "تارقة",
      nameFr: "Targa",
      description: "Quartier résidentiel prisé",
      cityId: marrakech.id,
      latitude: 31.6450,
      longitude: -7.9600,
    },
  });

  const centreCasablanca = await prisma.neighborhood.create({
    data: {
      name: "Centre-ville",
      slug: "centre-ville",
      nameAr: "وسط المدينة",
      nameFr: "Centre-ville",
      description: "Le cœur de Casablanca",
      cityId: casablanca.id,
      latitude: 33.5731,
      longitude: -7.5898,
    },
  });

  console.log("✅ Neighborhoods created");

  // Create Agency
  const agency = await prisma.agency.create({
    data: {
      name: "TAGMI Immobilier",
      slug: "tagmi-immobilier",
      description: "Agence immobilière de premier plan à Marrakech",
      email: "contact@tagmi-immobilier.ma",
      phone: "+212500000001",
      whatsapp: "+212600000001",
      city: "Marrakech",
      verified: true,
      verifiedAt: new Date(),
      licenseNumber: "AG-2024-001",
      ownerId: agencyOwner.id,
    },
  });

  console.log("✅ Agency created");

  // Create Agents
  const agent1 = await prisma.agent.create({
    data: {
      bio: "Spécialiste de l'immobilier de luxe à Marrakech. Plus de 10 ans d'expérience.",
      licenseNumber: "AGT-2024-001",
      specialization: "Luxe, Riads, Villas",
      verified: true,
      verifiedAt: new Date(),
      yearsExperience: 12,
      userId: agent1User.id,
      agencyId: agency.id,
    },
  });

  const agent2 = await prisma.agent.create({
    data: {
      bio: "Expert en appartements et locations saisonnières à Casablanca et Marrakech.",
      licenseNumber: "AGT-2024-002",
      specialization: "Appartements, Locations",
      verified: true,
      verifiedAt: new Date(),
      yearsExperience: 8,
      userId: agent2User.id,
      agencyId: agency.id,
    },
  });

  console.log("✅ Agents created");

  // Create Properties
  const properties = [
    {
      title: "Appartement moderne 3 chambres à Gueliz",
      slug: "appartement-moderne-3-chambres-gueliz-marrakech",
      description:
        "Superbe appartement moderne situé dans le quartier de Gueliz, au cœur de Marrakech. Cet appartement offre un espace de vie lumineux et spacieux avec une vue dégagée sur la ville. Idéal pour les familles cherchant un cadre de vie agréable et pratique.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.APARTMENT,
      price: 1200000,
      surfaceArea: 120,
      bedrooms: 3,
      bathrooms: 2,
      floor: 4,
      totalFloors: 6,
      yearBuilt: 2020,
      furnished: false,
      parking: true,
      garden: false,
      pool: false,
      terrace: true,
      balcony: true,
      elevator: true,
      airConditioning: true,
      heating: false,
      security: true,
      status: PropertyStatus.PUBLISHED,
      publishedAt: new Date(),
      cityId: marrakech.id,
      neighborhoodId: gueliz.id,
      agentId: agent1.id,
      agencyId: agency.id,
      ownerId: propertyOwner1.id,
      reference: "TAGMI-00000001",
    },
    {
      title: "Villa de luxe avec piscine et jardin",
      slug: "villa-luxe-piscine-jardin-hivernage-marrakech",
      description:
        "Magnifique villa de luxe située dans le quartier prestigieux d'Hivernage. Cette villa offre un jardin paysager, une piscine chauffée, et des finitions haut de gamme. Un havre de paix à proximité de tous les commodités.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.VILLA,
      price: 4500000,
      surfaceArea: 350,
      landArea: 500,
      bedrooms: 5,
      bathrooms: 4,
      yearBuilt: 2022,
      furnished: false,
      parking: true,
      garden: true,
      pool: true,
      terrace: true,
      balcony: false,
      elevator: false,
      airConditioning: true,
      heating: true,
      security: true,
      status: PropertyStatus.PUBLISHED,
      publishedAt: new Date(),
      cityId: marrakech.id,
      neighborhoodId: hivernage.id,
      agentId: agent1.id,
      agencyId: agency.id,
      ownerId: propertyOwner1.id,
      reference: "TAGMI-00000002",
    },
    {
      title: "Riad traditionnel rénové avec riad de charme",
      slug: "riad-traditionnel-renove-medina-marrakech",
      description:
        "Magnifique riad entièrement rénové dans la médina de Marrakech. Ce riad offre une architecture traditionnelle marocaine avec des zelliges, des stucs sculptés et une cour intérieure avec fontaine. Idéal comme résidence principale ou investissement locatif.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.RIAD,
      price: 2800000,
      surfaceArea: 280,
      bedrooms: 6,
      bathrooms: 5,
      yearBuilt: 1950,
      furnished: true,
      parking: false,
      garden: true,
      pool: true,
      terrace: true,
      balcony: false,
      elevator: false,
      airConditioning: true,
      heating: false,
      security: true,
      status: PropertyStatus.PUBLISHED,
      publishedAt: new Date(),
      cityId: marrakech.id,
      neighborhoodId: medina.id,
      agentId: agent1.id,
      agencyId: agency.id,
      ownerId: propertyOwner1.id,
      reference: "TAGMI-00000003",
    },
    {
      title: "Appartement meublé centre-ville",
      slug: "appartement-meuble-centre-ville-casablanca",
      description:
        "Bel appartement meublé au centre-ville de Casablanca. Idéal pour les professionnels ou les étudiants. À proximité des transports en commun, commerces et restaurants.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.APARTMENT,
      price: 850000,
      surfaceArea: 75,
      bedrooms: 2,
      bathrooms: 1,
      floor: 3,
      totalFloors: 5,
      yearBuilt: 2015,
      furnished: true,
      parking: false,
      garden: false,
      pool: false,
      terrace: false,
      balcony: true,
      elevator: true,
      airConditioning: true,
      heating: false,
      security: false,
      status: PropertyStatus.PUBLISHED,
      publishedAt: new Date(),
      cityId: casablanca.id,
      neighborhoodId: centreCasablanca.id,
      agentId: agent2.id,
      agencyId: agency.id,
      ownerId: propertyOwner1.id,
      reference: "TAGMI-00000004",
    },
    {
      title: "Studio moderne near Guéliz",
      slug: "studio-moderne-gueliz-marrakech",
      description:
        "Studio moderne et fonctionnel à Guéliz, parfait pour un célibataire ou un couple. Commodités modernes et emplacement idéal.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.APARTMENT,
      price: 480000,
      surfaceArea: 45,
      bedrooms: 1,
      bathrooms: 1,
      floor: 2,
      totalFloors: 4,
      yearBuilt: 2021,
      furnished: true,
      parking: false,
      garden: false,
      pool: false,
      terrace: false,
      balcony: true,
      elevator: true,
      airConditioning: true,
      heating: false,
      security: false,
      status: PropertyStatus.PUBLISHED,
      publishedAt: new Date(),
      cityId: marrakech.id,
      neighborhoodId: gueliz.id,
      agentId: agent1.id,
      agencyId: agency.id,
      ownerId: propertyOwner1.id,
      reference: "TAGMI-00000005",
    },
    {
      title: "Terrain constructible Targa",
      slug: "terrain-constructible-targa-marrakech",
      description:
        "Terrain de 400m² constructible dans le quartier de Targa. Idéal pour la construction d'une villa. Tous les raccordements disponibles.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.LAND,
      price: 800000,
      surfaceArea: 400,
      status: PropertyStatus.PUBLISHED,
      publishedAt: new Date(),
      cityId: marrakech.id,
      neighborhoodId: targa.id,
      agentId: agent1.id,
      agencyId: agency.id,
      ownerId: propertyOwner1.id,
      reference: "TAGMI-00000006",
    },
  ];

  for (const prop of properties) {
    await prisma.property.create({ data: prop });
  }

  console.log("✅ Properties created");

  // Create Blog Categories
  const buyingGuide = await prisma.blogCategory.create({
    data: {
      name: "Guide d'achat",
      slug: "guide-achat",
      description: "Conseils pour acheter un bien immobilier au Maroc",
    },
  });

  const investment = await prisma.blogCategory.create({
    data: {
      name: "Investissement",
      slug: "investissement",
      description: "Opportunités d'investissement immobilier",
    },
  });

  const marketTrends = await prisma.blogCategory.create({
    data: {
      name: "Tendances du marché",
      slug: "tendances-marche",
      description: "Analyse du marché immobilier marocain",
    },
  });

  // Create Blog Posts
  await prisma.blogPost.create({
    data: {
      title: "Guide complet pour acheter un appartement à Marrakech",
      slug: "guide-acheter-appartement-marrakech",
      excerpt:
        "Découvrez tout ce que vous devez savoir pour acheter un appartement à Marrakech : quartiers, prix, démarches et conseils pratiques.",
      content:
        "Acheter un appartement à Marrakech est un projet passionnant. Cette ville offre un cadre de vie exceptionnel avec son climat ensoleillé, sa culture riche et son patrimoine architectural unique...",
      published: true,
      publishedAt: new Date(),
      authorId: agent1User.id,
      categoryId: buyingGuide.id,
    },
  });

  await prisma.blogPost.create({
    data: {
      title: "Investir dans l'immobilier à Marrakech : opportunités 2024",
      slug: "investir-immobilier-marrakech-2024",
      excerpt:
        "Marrakech reste une destination prisée pour l'investissement immobilier. Découvrez les meilleures opportunités de cette année.",
      content:
        "Le marché immobilier de Marrakech continue d'attirer les investisseurs nationaux et internationaux. Avec un rendement locatif attractif et une appréciation constante des valeurs...",
      published: true,
      publishedAt: new Date(),
      authorId: agencyOwner.id,
      categoryId: investment.id,
    },
  });

  console.log("✅ Blog posts created");

  // Create Settings
  await prisma.setting.createMany({
    data: [
      { key: "site_name", value: "TAGMI" },
      { key: "site_tagline", value: "Immobilier Maroc" },
      { key: "contact_email", value: "contact@tagmi.ma" },
      { key: "contact_phone", value: "+212500000000" },
      { key: "whatsapp_number", value: "+212600000000" },
      { key: "max_upload_size", value: "10485760" },
      { key: "max_images_per_property", value: "20" },
      { key: "currency", value: "MAD" },
    ],
  });

  console.log("✅ Settings created");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
