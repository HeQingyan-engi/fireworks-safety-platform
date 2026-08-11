import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 0. 清理旧数据（按依赖关系顺序删除）
  await prisma.safetyAgreement.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.flowReg.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.inspection.deleteMany()
  await prisma.alert.deleteMany()
  await prisma.camera.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.user.deleteMany()
  await prisma.store.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  console.log('🧹 Cleaned old data')

  // 1. 创建产品分类
  const categories = await Promise.all([
    prisma.category.create({ data: { name: '组合烟花' } }),
    prisma.category.create({ data: { name: '喷花类' } }),
    prisma.category.create({ data: { name: '旋转类' } }),
    prisma.category.create({ data: { name: '吐珠类' } }),
    prisma.category.create({ data: { name: '儿童玩具烟花' } }),
    prisma.category.create({ data: { name: '礼花弹' } }),
  ])
  console.log(`✅ Created ${categories.length} categories`)

  // 2. 创建产品
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: '恭喜发财大型礼花', categoryId: categories[0].id, price: 168,
        safetyLevel: 'C', powderQuantity: '500', safetyDistance: '30',
        standards: 'GB 10631-2025', description: '适用于各类庆典场合，燃放高度约30米',
        isKidFriendly: false, isOnSale: false,
        effectVideoUrl: '/videos/firework1_effect.mp4',
        appearanceVideoUrl: '/videos/firework1_appearance.mp4',
      },
    }),
    prisma.product.create({
      data: {
        name: '富贵花开组合烟花', categoryId: categories[0].id, price: 288,
        safetyLevel: 'C', powderQuantity: '800', safetyDistance: '40',
        standards: 'GB 10631-2025', description: '多种颜色组合绽放，视觉效果极佳',
        isKidFriendly: false, isOnSale: true, originalPrice: 350,
      },
    }),
    prisma.product.create({
      data: {
        name: '金色喷泉喷花', categoryId: categories[1].id, price: 58,
        safetyLevel: 'D', powderQuantity: '200', safetyDistance: '10',
        standards: 'GB 10631-2025', description: '金色火花如喷泉般涌出，安全美观',
        isKidFriendly: true, isOnSale: false,
      },
    }),
    prisma.product.create({
      data: {
        name: '彩虹喷花筒', categoryId: categories[1].id, price: 68,
        safetyLevel: 'D', powderQuantity: '250', safetyDistance: '15',
        standards: 'GB 10631-2025', description: '多色彩喷花，持续时间约60秒',
        isKidFriendly: true, isOnSale: false,
      },
    }),
    prisma.product.create({
      data: {
        name: '旋转魔法棒', categoryId: categories[2].id, price: 38,
        safetyLevel: 'D', powderQuantity: '100', safetyDistance: '5',
        standards: 'GB 10631-2025', description: '手持旋转烟花，适合儿童使用（需成人陪同）',
        isKidFriendly: true, isOnSale: true, originalPrice: 48,
      },
    }),
    prisma.product.create({
      data: {
        name: '银龙旋转陀螺', categoryId: categories[2].id, price: 88,
        safetyLevel: 'D', powderQuantity: '180', safetyDistance: '8',
        standards: 'GB 10631-2025', description: '地面旋转类烟花爆竹，银白色光效',
        isKidFriendly: true, isOnSale: false,
      },
    }),
    prisma.product.create({
      data: {
        name: '流星吐珠炮', categoryId: categories[3].id, price: 128,
        safetyLevel: 'C', powderQuantity: '350', safetyDistance: '20',
        standards: 'GB 10631-2025', description: '连续发射彩色烟花弹，持续时间约90秒',
        isKidFriendly: false, isOnSale: false,
      },
    }),
    prisma.product.create({
      data: {
        name: '太空飞碟吐珠', categoryId: categories[3].id, price: 158,
        safetyLevel: 'C', powderQuantity: '400', safetyDistance: '25',
        standards: 'GB 10631-2025', description: '发射后旋转上升，视觉效果震撼',
        isKidFriendly: false, isOnSale: true, originalPrice: 198,
      },
    }),
    prisma.product.create({
      data: {
        name: '小黄鸭烟花', categoryId: categories[4].id, price: 25,
        safetyLevel: 'D', powderQuantity: '30', safetyDistance: '3',
        standards: 'GB 10631-2025', description: '造型可爱的小黄鸭造型烟花，适合儿童',
        isKidFriendly: true, isOnSale: false,
      },
    }),
    prisma.product.create({
      data: {
        name: '卡通烟花棒', categoryId: categories[4].id, price: 18,
        safetyLevel: 'D', powderQuantity: '20', safetyDistance: '2',
        standards: 'GB 10631-2025', description: '手持烟花棒，燃放时产生绚丽火花',
        isKidFriendly: true, isOnSale: false,
      },
    }),
    prisma.product.create({
      data: {
        name: '特惠礼包A', categoryId: categories[0].id, price: 399,
        safetyLevel: 'C', powderQuantity: '1200', safetyDistance: '50',
        standards: 'GB 10631-2025', description: '组合礼包：含礼花+喷花+旋转，适合大型聚会',
        isKidFriendly: false, isOnSale: true, originalPrice: 499,
      },
    }),
    prisma.product.create({
      data: {
        name: '限时抢购烟花', categoryId: categories[3].id, price: 99,
        safetyLevel: 'D', powderQuantity: '150', safetyDistance: '10',
        standards: 'GB 10631-2025', description: '限量特惠烟花开抢，性价比极高',
        isKidFriendly: false, isOnSale: true, originalPrice: 168,
      },
    }),
  ])
  console.log(`✅ Created ${products.length} products`)

  // 3. 创建示例门店
  const password = await bcrypt.hash('123456', 12)

  const store = await prisma.store.create({
    data: {
      name: '安万嘉烟花爆竹（东街口店）',
      code: 'FW-2026-001',
      address: '重庆市渝北区东街口路128号',
      lat: 29.5687, lng: 106.5578,
      contact: '张经理', phone: '13800138001',
      status: 'NORMAL', capacity: 5000,
    },
  })
  console.log(`✅ Created store: ${store.name}`)

  // 4. 创建用户
  const admin = await prisma.user.create({
    data: {
      username: 'admin', password,
      realName: '系统管理员', phone: '13800000000',
      role: 'SUPER_ADMIN',
    },
  })

  const govInspector = await prisma.user.create({
    data: {
      username: 'inspector', password,
      realName: '李监管', phone: '13800000001',
      role: 'GOV_INSPECTOR',
    },
  })

  const storeManager = await prisma.user.create({
    data: {
      username: 'manager', password,
      realName: '张店长', phone: '13800138001',
      role: 'STORE_MANAGER', storeId: store.id,
    },
  })

  const clerk = await prisma.user.create({
    data: {
      username: 'clerk', password,
      realName: '王店员', phone: '13800138002',
      role: 'CLERK', storeId: store.id,
    },
  })

  console.log('✅ Created users:')
  console.log('   admin / 123456 (SUPER_ADMIN)')
  console.log('   inspector / 123456 (GOV_INSPECTOR)')
  console.log('   manager / 123456 (STORE_MANAGER)')
  console.log('   clerk / 123456 (CLERK)')

  // 5. 初始化门店库存
  const inventoryData = products.map((p) => ({
    storeId: store.id,
    productId: p.id,
    quantity: Math.floor(Math.random() * 50) + 10, // 10-60 random stock
  }))

  for (const inv of inventoryData) {
    await prisma.inventory.create({ data: inv })
  }
  console.log(`✅ Created ${inventoryData.length} inventory records`)

  // 6. 初始化默认摄像头
  const cameraData = [
    { storeId: store.id, name: '商品展示区摄像头（防爆型）', rtspUrl: null, status: true },
    { storeId: store.id, name: '仓库储存区摄像头（防爆型）', rtspUrl: null, status: true },
    { storeId: store.id, name: '顾客停留区摄像头（全景）', rtspUrl: null, status: true },
    { storeId: store.id, name: '店外出入口摄像头（防水型）', rtspUrl: null, status: true },
  ]
  for (const cam of cameraData) {
    await prisma.camera.create({ data: cam })
  }
  console.log(`✅ Created ${cameraData.length} cameras`)

  // 7. 创建几条示例预警
  const alertData = [
    {
      storeId: store.id, type: 'TEMP_HUMIDITY_ANOMALY', level: 'ORANGE',
      title: '仓库温度超标：当前42°C，上限40°C',
      description: '6月30日14:30检测到温度异常，请检查空调设备',
      status: 'RESOLVED', rectifiedAt: new Date('2026-06-30T15:00:00'),
    },
    {
      storeId: store.id, type: 'OVERSTOCK', level: 'YELLOW',
      title: '门店库存接近上限：当前4500g，核定5000g',
      description: '库存量已达到核定存储量的90%',
      status: 'ACKNOWLEDGED',
    },
    {
      storeId: store.id, type: 'CROWD_GATHERING', level: 'YELLOW',
      title: '店内人员聚集：当前12人，上限10人',
      description: '请疏导人员、限制入店人数',
      status: 'NEW',
    },
  ]
  for (const alert of alertData) {
    await prisma.alert.create({ data: alert })
  }
  console.log(`✅ Created ${alertData.length} sample alerts`)

  console.log('\n🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
