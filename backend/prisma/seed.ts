import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Travel', icon: '✈️', color: '#3B82F6' },
  { name: 'Business', icon: '💼', color: '#8B5CF6' },
  { name: 'Daily Life', icon: '🏠', color: '#10B981' },
  { name: 'Food & Drink', icon: '🍜', color: '#F59E0B' },
  { name: 'Technology', icon: '💻', color: '#6366F1' },
];

const CARDS: Record<string, { front: string; back: string }[]> = {
  Travel: [
    { front: 'boarding pass', back: 'thẻ lên máy bay' },
    { front: 'customs declaration', back: 'tờ khai hải quan' },
    { front: 'departure lounge', back: 'phòng chờ khởi hành' },
    { front: 'round trip', back: 'vé khứ hồi' },
    { front: 'jet lag', back: 'mệt do lệch múi giờ' },
    { front: 'carry-on luggage', back: 'hành lý xách tay' },
    { front: 'connecting flight', back: 'chuyến bay nối chuyến' },
    { front: 'passport control', back: 'kiểm soát hộ chiếu' },
    { front: 'travel insurance', back: 'bảo hiểm du lịch' },
    { front: 'itinerary', back: 'lịch trình' },
  ],
  Business: [
    { front: 'quarterly report', back: 'báo cáo hàng quý' },
    { front: 'stakeholder', back: 'các bên liên quan' },
    { front: 'due diligence', back: 'thẩm định cẩn thận' },
    { front: 'revenue stream', back: 'nguồn doanh thu' },
    { front: 'leverage', back: 'tận dụng lợi thế' },
    { front: 'benchmark', back: 'tiêu chuẩn so sánh' },
    { front: 'synergy', back: 'sức mạnh tổng hợp' },
    { front: 'turnaround', back: 'cải thiện tình hình kinh doanh' },
    { front: 'bottom line', back: 'lợi nhuận ròng / điểm mấu chốt' },
    { front: 'scalable', back: 'có khả năng mở rộng' },
  ],
  'Daily Life': [
    { front: 'commute', back: 'đi lại hàng ngày' },
    { front: 'groceries', back: 'thực phẩm / đồ mua ở siêu thị' },
    { front: 'appliance', back: 'thiết bị gia dụng' },
    { front: 'landlord', back: 'chủ nhà' },
    { front: 'utility bill', back: 'hóa đơn tiện ích (điện, nước, gas)' },
    { front: 'neighbourhood', back: 'khu phố, xóm' },
    { front: 'errand', back: 'việc vặt cần làm' },
    { front: 'prescription', back: 'đơn thuốc' },
    { front: 'chore', back: 'việc nhà' },
    { front: 'appointment', back: 'cuộc hẹn' },
  ],
  'Food & Drink': [
    { front: 'cuisine', back: 'ẩm thực' },
    { front: 'appetizer', back: 'món khai vị' },
    { front: 'marinate', back: 'ướp (thực phẩm)' },
    { front: 'sauté', back: 'xào nhanh với ít dầu' },
    { front: 'garnish', back: 'trang trí món ăn' },
    { front: 'savory', back: 'mặn / thơm ngon (không ngọt)' },
    { front: 'portion', back: 'khẩu phần, phần ăn' },
    { front: 'infusion', back: 'nước ngâm chiết xuất' },
    { front: 'fermented', back: 'lên men' },
    { front: 'condiment', back: 'gia vị / nước chấm' },
  ],
  Technology: [
    { front: 'algorithm', back: 'thuật toán' },
    { front: 'bandwidth', back: 'băng thông' },
    { front: 'cache', back: 'bộ nhớ đệm' },
    { front: 'encryption', back: 'mã hoá' },
    { front: 'latency', back: 'độ trễ' },
    { front: 'repository', back: 'kho lưu trữ mã nguồn' },
    { front: 'deployment', back: 'triển khai (phần mềm)' },
    { front: 'authentication', back: 'xác thực' },
    { front: 'middleware', back: 'phần mềm trung gian' },
    { front: 'scalability', back: 'khả năng mở rộng' },
  ],
};

async function main() {
  console.log('🌱 Seeding database...');

  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isPreloaded: true,
      },
    });

    const existing = await prisma.deck.findFirst({
      where: { categoryId: category.id, isPreloaded: true },
    });

    if (existing) {
      console.log(`  ✓ ${cat.name} deck already seeded`);
      continue;
    }

    const deck = await prisma.deck.create({
      data: {
        title: `${cat.name} Essentials`,
        description: `Essential vocabulary for ${cat.name.toLowerCase()}`,
        isPreloaded: true,
        clientId: 'preloaded',
        categoryId: category.id,
      },
    });

    const cards = CARDS[cat.name] || [];
    for (const card of cards) {
      await prisma.card.create({
        data: {
          front: card.front,
          back: card.back,
          deckId: deck.id,
          clientId: 'preloaded',
          dueDate: new Date(),
        },
      });
    }

    console.log(`  ✓ Seeded ${cat.name}: ${cards.length} cards`);
  }

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
