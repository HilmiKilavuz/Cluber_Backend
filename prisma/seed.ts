import { PrismaClient, MemberRole } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const clubs = [
  {
    name: 'Yapay Zeka ve Makine Öğrenmesi Kulübü',
    description:
      'Yapay zeka ve makine öğrenmesi alanında meraklı öğrencileri bir araya getiren kulübümüzde, araştırma projeleri, hackathon etkinlikleri ve sektör profesyonelleriyle buluşmalar düzenliyoruz.',
    category: 'Teknoloji',
  },
  {
    name: 'Web Geliştirme Topluluğu',
    description:
      'Modern web teknolojilerini birlikte öğrendiğimiz ve uyguladığımız kulübümüzde React, Next.js, Node.js gibi güncel teknolojiler üzerine atölyeler ve canlı kodlama seansları gerçekleştiriyoruz.',
    category: 'Teknoloji',
  },
  {
    name: 'Siber Güvenlik Kulübü',
    description:
      'Etik hacking, savunma stratejileri ve güvenli yazılım geliştirme konularında bilgi paylaşımı yapıyoruz. CTF yarışmalarına katılıyor, gerçek dünya senaryolarını simüle ediyoruz.',
    category: 'Teknoloji',
  },
  {
    name: 'Futbol Kulübü',
    description:
      'Her hafta düzenlenen antrenmanlar ve turnuvalar ile futbol tutkunu öğrencileri bir araya getiriyoruz. Takım ruhu ve sportif gelişim ön planda!',
    category: 'Spor',
  },
  {
    name: 'Basketbol ve Sokak Sporları',
    description:
      'Basketbol başta olmak üzere sokak sporları alanında etkinlikler düzenleyen kulübümüz, fiziksel ve sosyal gelişimi birleştiriyor.',
    category: 'Spor',
  },
  {
    name: 'Yoga ve Mindfulness',
    description:
      'Yüz yüze ve online seanslarla hem beden hem zihin sağlığınızı destekliyoruz. Stres yönetimi teknikleri ve meditasyon pratikleri ile öğrenci yaşamına denge katıyoruz.',
    category: 'Spor',
  },
  {
    name: 'Akustik ve Enstrümantal Müzik',
    description:
      'Akustik gitar, piyano, keman ve diğer enstrümanları birlikte icra ettiğimiz kulübümüzde müzik severleri buluşturuyoruz. Aylık mini konserler ve jam seansları düzenliyoruz.',
    category: 'Müzik',
  },
  {
    name: 'Elektronik Müzik Yapımı',
    description:
      'Ableton, FL Studio gibi araçlarla müzik üretimi öğreniyoruz. Başlangıç seviyesinden ileri seviyeye kadar herkese açık atölye çalışmaları sunuyoruz.',
    category: 'Müzik',
  },
  {
    name: 'Koro ve Vokal Sanatları',
    description:
      'Sesini geliştirmek isteyenlere yönelik vokal egzersizleri, koro çalışmaları ve sahne performansı eğitimleri sunuyoruz. Her dönem sonu büyük konser!',
    category: 'Müzik',
  },
  {
    name: 'Resim ve Suluboya Atölyesi',
    description:
      'Geleneksel resim tekniklerinden dijital illüstrasyona kadar geniş bir yelpazede sanatsal beceriler kazanıyoruz. Haftalık atölyeler ve sergi etkinlikleri ile yeteneklerinizi sergileyin.',
    category: 'Sanat',
  },
  {
    name: 'Fotoğrafçılık Kulübü',
    description:
      'Kompozisyon, ışık ve post-prodüksiyon konularında pratik bilgi kazanın. Şehir turları, doğa çekimleri ve stüdyo çalışmalarıyla fotoğraf sanatını keşfedin.',
    category: 'Sanat',
  },
  {
    name: 'Tiyatro ve Sahne Sanatları',
    description:
      'Doğaçlama, metin yorumu ve sahne teknikleri üzerine çalışıyoruz. Her dönem özgün bir oyun sahneliyoruz ve ulusal tiyatro festivals yarışmalarına katılıyoruz.',
    category: 'Sanat',
  },
  {
    name: 'Astronomi ve Uzay Bilimleri',
    description:
      'Teleskop gözlemleri, gezegen simülasyonları ve uzay araştırmaları konusunda meraklı bireyleri bir araya getiriyoruz. Bilinmeyeni birlikte keşfedelim!',
    category: 'Bilim',
  },
  {
    name: 'Biyoteknoloji Araştırma Kulübü',
    description:
      'Genetik, biyoinformatik ve laboratuvar teknikleri üzerine derinlemesine çalışmalar yapıyoruz. Sektörden konuk akademisyenlerle düzenli seminerler gerçekleştiriyoruz.',
    category: 'Bilim',
  },
  {
    name: 'Girişimcilik ve Startup Kulübü',
    description:
      'Fikir üretmekten iş planı yazmaya, yatırımcı sunumundan şirket kuruluşuna kadar girişimcilik yolculuğunun her adımında yanınızdayız. Mentor ağımıza katılın.',
    category: 'İş & Kariyer',
  },
  {
    name: 'Finans ve Yatırım Kulübü',
    description:
      'Borsa, kripto varlıklar, portföy yönetimi ve kişisel finans konularında eğitimler ve simülasyonlar düzenliyoruz. Finansal okuryazarlığınızı artırın.',
    category: 'İş & Kariyer',
  },
  {
    name: 'Masaüstü ve Video Oyun Kulübü',
    description:
      'Rekabetçi oyun turnuvaları, oyun geliştirme jam etkinlikleri ve retro gaming seanslarıyla oyun severleri birleştiriyoruz. Hem oyna hem öğren!',
    category: 'Oyun',
  },
  {
    name: 'Kitap Okuma ve Edebiyat Kulübü',
    description:
      'Her ay belirli bir kitap üzerine derinlemesine tartışmalar ve yazarla buluşma etkinlikleri düzenliyoruz. Türk ve dünya edebiyatından seçkin eserlerle zihinsel serüveninizi genişletin.',
    category: 'Edebiyat',
  },
  {
    name: 'Yaratıcı Yazarlık Atölyesi',
    description:
      'Kısa hikâye, şiir ve roman yazımı üzerine haftalık atölyeler ve geri bildirim oturumları yapıyoruz. Kendi sesini bulmak isteyenlere kapılarımız açık.',
    category: 'Edebiyat',
  },
  {
    name: 'Film ve Sinema Kulübü',
    description:
      'Klasiklerden bağımsız filmlere, belgesellerden animasyonlara kadar geniş bir perspektifle sinema kültürünü inceliyoruz. Haftalık gösterimler ve yönetmen sohbetleri sizi bekliyor.',
    category: 'Sinema',
  },
];

async function main() {
  console.log('🌱 Seeding database with 20 sample clubs...');

  // Create or find a seed user
  const email = 'seed@cluber.dev';
  let seedUser = await prisma.user.findUnique({ where: { email } });

  if (!seedUser) {
    const passwordHash = await bcrypt.hash('Seed1234!', 10);
    seedUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: 'Cluber Admin',
      },
    });
    console.log(`✅ Seed user created: ${email}`);
  } else {
    console.log(`ℹ️  Seed user already exists: ${email}`);
  }

  let created = 0;
  let skipped = 0;

  for (const club of clubs) {
    const exists = await prisma.club.findUnique({ where: { name: club.name } });
    if (exists) {
      skipped++;
      continue;
    }

    await prisma.club.create({
      data: {
        name: club.name,
        description: club.description,
        category: club.category,
        creatorId: seedUser.id,
        memberships: {
          create: {
            userId: seedUser.id,
            role: MemberRole.ADMIN,
          },
        },
      },
    });
    created++;
    console.log(`  ✅ "${club.name}" oluşturuldu`);
  }

  console.log(`\n🎉 Tamamlandı! ${created} kulüp oluşturuldu, ${skipped} kulüp zaten mevcuttu.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
