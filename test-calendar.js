const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkTokens() {
  const tokens = await prisma.calendarToken.findMany();
  console.log("Tokens:", tokens);
  
  const bookings = await prisma.booking.findMany();
  console.log("Bookings:", bookings);
}

checkTokens().catch(console.error).finally(() => prisma.$disconnect());
