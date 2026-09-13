import { db } from "@/lib/db";
import { ContactInput } from "@/lib/validation";
import { LeadSource, LeadStatus } from "@prisma/client";

export async function createLead(
  data: ContactInput,
  source: LeadSource = LeadSource.WEBSITE,
  agentId?: string,
  agencyId?: string
) {
  return db.lead.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      source,
      status: LeadStatus.NEW,
      score: 0,
      propertyId: data.propertyId,
      agentId,
      agencyId,
      ownerId: agentId
        ? (
            await db.agent.findUnique({
              where: { id: agentId },
              select: { userId: true },
            })
          )?.userId ?? ""
        : "",
    },
  });
}

export async function getLeadsByAgent(agentId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    db.lead.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            currency: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        visits: {
          orderBy: { scheduledAt: "desc" },
          take: 1,
        },
      },
    }),
    db.lead.count({ where: { agentId } }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  return db.lead.update({
    where: { id: leadId },
    data: { status },
  });
}

export async function addLeadInteraction(
  leadId: string,
  type: string,
  content: string,
  direction: "inbound" | "outbound"
) {
  await db.lead.update({
    where: { id: leadId },
    data: { lastContact: new Date() },
  });

  return db.leadInteraction.create({
    data: {
      leadId,
      type,
      content,
      direction,
    },
  });
}

export async function calculateLeadScore(leadId: string) {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: {
      property: true,
      visits: true,
      interactions: true,
    },
  });

  if (!lead) return 0;

  let score = 0;

  // Base score from source
  if (lead.source === LeadSource.REFERRAL) score += 20;
  if (lead.source === LeadSource.DIRECT) score += 15;

  // Has email
  if (lead.email) score += 5;

  // Has phone
  if (lead.phone) score += 10;

  // Has message
  if (lead.message && lead.message.length > 20) score += 10;

  // Has budget
  if (lead.budget) score += 15;

  // Has property interest
  if (lead.propertyId) score += 10;

  // Visits
  score += lead.visits.length * 30;

  // Interactions
  score += lead.interactions.length * 10;

  // Cap at 100
  score = Math.min(score, 100);

  // Update score
  await db.lead.update({
    where: { id: leadId },
    data: { score },
  });

  return score;
}
