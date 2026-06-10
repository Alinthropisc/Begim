import '../../core/models/models.dart';

/// Mock data for MVP (no backend yet)
class MockData {
  static const List<Category> categories = [
    Category(id: 'all', name: 'Hammasi', icon: '🍽️'),
    Category(id: 'cakes', name: 'Tortlar', icon: '🎂'),
    Category(id: 'cookies', name: 'Pechenyelar', icon: '🍪'),
    Category(id: 'pastries', name: 'Bulochkalar', icon: '🥐'),
    Category(id: 'sweets', name: 'Shirinliklar', icon: '🍬'),
    Category(id: 'bread', name: 'Non', icon: '🍞'),
    Category(id: 'desserts', name: 'Desertlar', icon: '🍰'),
    Category(id: 'drinks', name: 'Ichimliklar', icon: '🥤'),
  ];

  static final List<Product> products = [
    Product(
      id: '1',
      name: 'Medovik torti',
      nameRu: 'Медовик торт',
      description:
          'Klassik medovik — asal bilan pishirilgan nozik qatlamlar va qaymoqli krem. Oilaviy retsept bo\'yicha tayyorlanadi.',
      price: 180000,
      imageUrl:
          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
      category: 'cakes',
      sellerName: 'Dilnoza opa',
      sellerAvatar:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
      rating: 4.9,
      reviewsCount: 128,
      isHalol: true,
    ),
    Product(
      id: '2',
      name: 'Chak-chak',
      nameRu: 'Чак-чак',
      description:
          'Milliy shirinlik — asal bilan shakllangan qizartirilgan xamir bo\'laklari. To\'ylar va bayramlarda tortiladi.',
      price: 95000,
      imageUrl:
          'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800',
      category: 'sweets',
      sellerName: 'Gulnora xola',
      sellerAvatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      rating: 4.8,
      reviewsCount: 96,
      isHalol: true,
      isNew: true,
    ),
    Product(
      id: '3',
      name: 'Samsa go\'shtli',
      nameRu: 'Самса с мясом',
      description:
          'To\'ndirda pishirilgan go\'shtli samsa. Qo\'y go\'shti va piyoz bilan. Yangi tayyorlangan.',
      price: 15000,
      imageUrl:
          'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
      category: 'pastries',
      sellerName: 'Zulfiya opa',
      sellerAvatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
      rating: 4.9,
      reviewsCount: 245,
      isHalol: true,
    ),
    Product(
      id: '4',
      name: 'Paxlava',
      nameRu: 'Пахлава',
      description:
          'Yong\'oq va asal bilan to\'ldirilgan qatlamali shirinlik. Sharqona ta\'m va noziklik.',
      price: 120000,
      imageUrl:
          'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800',
      category: 'sweets',
      sellerName: 'Malika',
      sellerAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      rating: 5.0,
      reviewsCount: 67,
      isHalol: true,
    ),
    Product(
      id: '5',
      name: 'Shokoladli pechenye',
      nameRu: 'Шоколадное печенье',
      description:
          'Frantsuz retsepti bo\'yicha tayyorlangan shokolad bo\'laklari bilan pechenye. Yangi va yumshoq.',
      price: 45000,
      imageUrl:
          'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800',
      category: 'cookies',
      sellerName: 'Anora',
      sellerAvatar:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200',
      rating: 4.7,
      reviewsCount: 54,
      isHalol: true,
      isNew: true,
    ),
    Product(
      id: '6',
      name: 'Napoleon torti',
      nameRu: 'Торт Наполеон',
      description:
          'Klassik Napoleon — ming qatlamli xamir va qaymoqli krem. Sovuq holda tavsiya etiladi.',
      price: 220000,
      imageUrl:
          'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800',
      category: 'cakes',
      sellerName: 'Dilnoza opa',
      sellerAvatar:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
      rating: 4.9,
      reviewsCount: 89,
      isHalol: true,
    ),
    Product(
      id: '7',
      name: 'Non tandir',
      nameRu: 'Тандырный хлеб',
      description:
          'Tandirda yangi pishirilgan o\'zbek noni. Har kuni ertalab tayyorlanadi.',
      price: 8000,
      imageUrl:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
      category: 'bread',
      sellerName: 'Zulfiya opa',
      sellerAvatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
      rating: 5.0,
      reviewsCount: 412,
      isHalol: true,
    ),
    Product(
      id: '8',
      name: 'Ekler',
      nameRu: 'Эклер',
      description:
          'Frantsuzcha ekler — vanil krem bilan to\'ldirilgan, shokoladli glazur bilan qoplangan.',
      price: 25000,
      imageUrl:
          'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=800',
      category: 'desserts',
      sellerName: 'Malika',
      sellerAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      rating: 4.8,
      reviewsCount: 73,
      isHalol: true,
    ),
  ];

  static final List<Story> stories = [
    Story(
      id: '1',
      sellerName: 'Yangi',
      sellerAvatar: '',
      images: [
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
      ],
    ),
    Story(
      id: '2',
      sellerName: 'Dilnoza',
      sellerAvatar:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
      images: [
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
        'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800',
      ],
    ),
    Story(
      id: '3',
      sellerName: 'Gulnora',
      sellerAvatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      images: [
        'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800',
      ],
    ),
    Story(
      id: '4',
      sellerName: 'Malika',
      sellerAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      images: [
        'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800',
      ],
    ),
    Story(
      id: '5',
      sellerName: 'Anora',
      sellerAvatar:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200',
      images: [
        'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800',
      ],
    ),
    Story(
      id: '6',
      sellerName: 'Zulfiya',
      sellerAvatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
      images: [
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
      ],
    ),
  ];

  static final List<CommunityPost> communityPosts = [
    CommunityPost(
      id: '1',
      authorName: 'Dilnoza opa',
      authorAvatar:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
      title: 'Medovik sirlari 🍯',
      content:
          'Ko\'pchilik so\'raydi — nega mening medovik shunchalik yumshoq? Sirri asalda va qaymoqning nisbatida. Bugun siz bilan ulashaman...',
      imageUrl:
          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
      likesCount: 124,
      commentsCount: 32,
      createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      isLiked: false,
    ),
    CommunityPost(
      id: '2',
      authorName: 'Malika',
      authorAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      title: 'Paxlava tayyorlash usuli ✨',
      content:
          'Sharqona paxlava — bu san\'at! Har bir qatlam sevgi bilan qo\'yiladi. Mana mening oilaviy retseptim...',
      imageUrl:
          'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800',
      likesCount: 89,
      commentsCount: 21,
      createdAt: DateTime.now().subtract(const Duration(hours: 5)),
      isLiked: true,
    ),
    CommunityPost(
      id: '3',
      authorName: 'Gulnora xola',
      authorAvatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      title: 'Chak-chak — to\'y shirinligi 🎊',
      content:
          'Chak-chak — bu nafaqat shirinlik, balki mehr va mehr ramzi. Har bir bo\'lagida ota-bobolarimiz an\'analari mujassam...',
      imageUrl: null,
      likesCount: 256,
      commentsCount: 48,
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      isLiked: false,
    ),
  ];

  static List<Product> getProductsByCategory(String categoryId) {
    if (categoryId == 'all') return products;
    return products.where((p) => p.category == categoryId).toList();
  }

  static Product? getProductById(String id) {
    try {
      return products.firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }
}
