import { prisma } from "./db";

export async function getAdminOverview() {
  const days = await prisma.day.findMany({
    orderBy: { order: "asc" },
    include: {
      blocks: {
        orderBy: { order: "asc" },
        include: {
          programItems: {
            orderBy: { order: "asc" },
            include: {
              _count: {
                select: {
                  registrations: true,
                  waitlistEntries: { where: { status: "WAITING" } },
                },
              },
            },
          },
        },
      },
    },
  });

  const approvedEmailCount = await prisma.approvedEmail.count();
  const participantCount = await prisma.participant.count();

  return { days, approvedEmailCount, participantCount };
}
