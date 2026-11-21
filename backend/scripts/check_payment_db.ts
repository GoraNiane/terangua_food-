import { prisma } from '../src/config';

async function main() {
  const count = await prisma.order.count();
  const paymentCount = await prisma.payment.count();
  console.log(`ORDER_COUNT: ${count}, PAYMENT_COUNT: ${paymentCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
