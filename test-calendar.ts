import { prisma } from './lib/prisma';

async function checkTokens() {
  const tokens = await prisma.calendarToken.findMany();
  console.log("Tokens:", tokens);
  
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1
  });
  console.log("Latest Booking:", bookings);
  
  if (bookings.length > 0) {
    const booking = bookings[0];
    console.log("Tenant ID:", booking.tenantId);
    const token = await prisma.calendarToken.findFirst({
        where: { tenantId: booking.tenantId, provider: "GOOGLE" },
    });
    console.log("Google Token for tenant:", token ? "Exists" : "Does not exist");
  }
}

checkTokens().catch(console.error).finally(() => prisma.$disconnect());
