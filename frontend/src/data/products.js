export const products = [
  {
    id: '1',
    name: 'Suporte Gengar para Controle (PS5 e PS4)',
    description:
      'Suporte decorativo para controle PS5 com duas variações: Estilo Felpudo e Estilo Liso.',
    price: 49.0,
    originalPrice: 65.0,

    images: [
      '/produtos/gengar3.jpg',
      '/produtos/gengar4.jpg',
    ],

    category: 'Acessórios',
    material: 'PLA',
    rating: 4.9,
    reviews: 88,
    inStock: true,
    featured: true,
    dealOfTheDay: false,

    // ✅ Produto com variações (cor/modelo) 
    variants: [
      {
        id: '1-gengar-felpudo',
        label: 'Estilo Felpudo',
        model: 'Estilo Felpudo',
        price: 49.0,
        originalPrice: 65.0,
        inStock: true,
        images: [
          '/produtos/gengar1.jpg',
        ],
      },
      {
        id: '1-gengar-liso',
        label: 'Estilo Liso',
        model: 'Estilo Liso',
        price: 49.0,
        originalPrice: 69.0,
        inStock: true,
        images: [
          '/produtos/gengar2.jpg',
          '/produtos/gengar3.jpg',
          '/produtos/gengar4.jpg',
        ],
      },
    ],

    // ✅ mantém também o padrão atual (compatibilidade com componentes antigos)
    images: ['/produtos/capaswitch.jpg', '/produtos/capaswitch2.png', '/produtos/capaswitch3.png'],

    category: 'Miniaturas',
    material: 'PLA',
    rating: 4.8,
    reviews: 127,
    inStock: true,
    featured: true,
    dealOfTheDay: false,
    specifications: {
      layerHeight: '0.12mm',
      infill: '20%',
      printTime: '24 horas',
      material: 'PLA Cristalino',
      weight: '85g',
    },
  },

  {
    id: '2',
    name: 'Máscara Cyber Oni',
    description:
      'Máscara de cosplay inspirada em cultura cyberpunk japonesa. Impressa em resina de alta qualidade.',
    price: 120.0,
    originalPrice: null,
    image:
      'https://images.unsplash.com/photo-1599837826158-79e79f6e032f?crop=entropy&cs=srgb&fm=jpg&q=85',
    category: 'Cosplay',
    material: 'Resina',
    rating: 5.0,
    reviews: 89,
    inStock: true,
    featured: true,
    dealOfTheDay: true,
    specifications: {
      layerHeight: '0.05mm',
      printTime: '18 horas',
      material: 'Resina UV',
      weight: '320g',
      finishing: 'Pintado profissionalmente',
    },
  },

  {
    id: '3',
    name: 'Vaso Geométrico Voronoi',
    description:
      'Design paramétrico exclusivo com padrão Voronoi. Ideal para suculentas e plantas pequenas.',
    price: 35.0,
    originalPrice: 48.0,
    image:
      'https://images.unsplash.com/photo-1767498051839-c7fba864e657?crop=entropy&cs=srgb&fm=jpg&q=85',
    category: 'Decoração',
    material: 'PLA',
    rating: 4.6,
    reviews: 203,
    inStock: true,
    featured: true,
    dealOfTheDay: false,
    specifications: {
      layerHeight: '0.20mm',
      infill: '15%',
      printTime: '8 horas',
      material: 'PLA Marble',
      dimensions: '12x12x15cm',
    },
  },

  {
    id: '4',
    name: 'Suporte para Headset Minimalista',
    description:
      'Design elegante e funcional para organizar seu headset gamer. Base com peso para estabilidade.',
    price: 25.0,
    originalPrice: null,

    // ✅ Variações (exemplo: modelo e cor)
    variants: [
      {
        id: '4-v1-preto',
        label: 'V1 • Preto',
        model: 'V1',
        color: 'Preto',
        price: 25.0,
        originalPrice: null,
        inStock: true,
        images: [
          'https://images.unsplash.com/photo-1636703781897-b8751da69617?crop=entropy&cs=srgb&fm=jpg&q=85',
          'https://images.unsplash.com/photo-1636703781897-b8751da69617?crop=entropy&cs=srgb&fm=jpg&q=85',
          'https://images.unsplash.com/photo-1636703781897-b8751da69617?crop=entropy&cs=srgb&fm=jpg&q=85',
        ],
      },
      {
        id: '4-v1-branco',
        label: 'V1 • Branco',
        model: 'V1',
        color: 'Branco',
        price: 25.0,
        originalPrice: null,
        inStock: true,
        images: [
          'https://images.unsplash.com/photo-1636703781897-b8751da69617?crop=entropy&cs=srgb&fm=jpg&q=85',
          'https://images.unsplash.com/photo-1636703781897-b8751da69617?crop=entropy&cs=srgb&fm=jpg&q=85',
          'https://images.unsplash.com/photo-1636703781897-b8751da69617?crop=entropy&cs=srgb&fm=jpg&q=85',
        ],
      },
      {
        id: '4-v2-preto',
        label: 'V2 • Preto',
        model: 'V2',
        color: 'Preto',
        price: 29.0,
        originalPrice: null,
        inStock: true,
        images: [
          'https://images.unsplash.com/photo-1636703781897-b8751da69617?crop=entropy&cs=srgb&fm=jpg&q=85',
          'https://images.unsplash.com/photo-1636703781897-b8751da69617?crop=entropy&cs=srgb&fm=jpg&q=85',
          'https://images.unsplash.com/photo-1636703781897-b8751da69617?crop=entropy&cs=srgb&fm=jpg&q=85',
        ],
      },
    ],

    // compat
    image:
      'https://images.unsplash.com/photo-1636703781897-b8751da69617?crop=entropy&cs=srgb&fm=jpg&q=85',

    category: 'Acessórios',
    material: 'ABS',
    rating: 4.7,
    reviews: 156,
    inStock: true,
    featured: false,
    dealOfTheDay: false,
    specifications: {
      layerHeight: '0.20mm',
      infill: '30%',
      printTime: '6 horas',
      material: 'ABS Premium',
      weight: '150g',
    },
  },

  {
    id: '5',
    name: 'Kit Arquitetônico Modular',
    description:
      'Conjunto de peças modulares para criar estruturas arquitetônicas. Perfeito para arquitetos e designers.',
    price: 85.0,
    originalPrice: null,
    image:
      'https://images.unsplash.com/photo-1653164579768-ea97833b3b03?crop=entropy&cs=srgb&fm=jpg&q=85',
    category: 'Miniaturas',
    material: 'PLA',
    rating: 4.9,
    reviews: 67,
    inStock: true,
    featured: false,
    dealOfTheDay: false,
    specifications: {
      layerHeight: '0.15mm',
      infill: '20%',
      printTime: '32 horas',
      material: 'PLA Branco',
      pieces: '45 peças',
    },
  },

  {
    id: '6',
    name: 'Elmo Mandalorian',
    description:
      'Réplica detalhada do icônico elmo. Impressão em alta resolução com acabamento metálico.',
    price: 180.0,
    originalPrice: 220.0,
    image:
      'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?crop=entropy&cs=srgb&fm=jpg&q=85',
    category: 'Cosplay',
    material: 'Resina',
    rating: 5.0,
    reviews: 234,
    inStock: true,
    featured: true,
    dealOfTheDay: false,
    specifications: {
      layerHeight: '0.05mm',
      printTime: '48 horas',
      material: 'Resina Grey',
      weight: '850g',
      finishing: 'Cromado',
    },
  },

  {
    id: '7',
    name: 'Action Figure Articulated Warrior',
    description:
      'Guerreiro totalmente articulado com 24 pontos de articulação. Design original exclusivo.',
    price: 55.0,
    originalPrice: null,
    image:
      'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?crop=entropy&cs=srgb&fm=jpg&q=85',
    category: 'Miniaturas',
    material: 'Resina',
    rating: 4.8,
    reviews: 98,
    inStock: true,
    featured: false,
    dealOfTheDay: false,
    specifications: {
      layerHeight: '0.05mm',
      printTime: '16 horas',
      material: 'Resina ABS-Like',
      height: '18cm',
      articulations: '24 pontos',
    },
  },

  {
    id: '8',
    name: 'Organizador de Mesa Hexagonal',
    description:
      'Sistema modular hexagonal para organização de mesa. Encaixe perfeito entre módulos.',
    price: 38.0,
    originalPrice: 45.0,
    image:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?crop=entropy&cs=srgb&fm=jpg&q=85',
    category: 'Acessórios',
    material: 'PLA',
    rating: 4.5,
    reviews: 145,
    inStock: true,
    featured: false,
    dealOfTheDay: true,
    specifications: {
      layerHeight: '0.20mm',
      infill: '25%',
      printTime: '12 horas',
      material: 'PLA Multicolor',
      modules: '6 módulos',
    },
  },

  {
    id: '9',
    name: 'Luminária Galáxia 3D',
    description:
      'Luminária com efeito galáxia integrada. LED RGB com controle remoto incluído.',
    price: 92.0,
    originalPrice: null,
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=srgb&fm=jpg&q=85',
    category: 'Decoração',
    material: 'PLA',
    rating: 4.9,
    reviews: 187,
    inStock: true,
    featured: true,
    dealOfTheDay: false,
    specifications: {
      layerHeight: '0.16mm',
      infill: '10%',
      printTime: '20 horas',
      material: 'PLA Translúcido',
      power: 'USB 5V',
      ledType: 'RGB',
    },
  },

  {
    id: '10',
    name: 'Miniatura de Dragão Bebê',
    description:
      'Adorável dragão bebê com expressão fofa. Perfeito para decoração ou presente.',
    price: 28.0,
    originalPrice: 35.0,
    image:
      'https://images.unsplash.com/photo-1566473965997-3de9c817e938?crop=entropy&cs=srgb&fm=jpg&q=85',
    category: 'Miniaturas',
    material: 'PLA',
    rating: 4.7,
    reviews: 312,
    inStock: true,
    featured: false,
    dealOfTheDay: false,
    specifications: {
      layerHeight: '0.12mm',
      infill: '20%',
      printTime: '10 horas',
      material: 'PLA Premium',
      height: '8cm',
    },
  },

  {
    id: '11',
    name: 'Suporte para Controle de Xbox',
    description:
      'Dock elegante para controle de Xbox. Design ergonômico com espaço para cabo.',
    price: 32.0,
    originalPrice: null,

    // ✅ Exemplo: cor muda SKU/estoque/price (se quiser)
    variants: [
      {
        id: '11-preto',
        label: 'Preto',
        model: 'Padrão',
        color: 'Preto',
        price: 32.0,
        originalPrice: null,
        inStock: true,
        images: [
          'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?crop=entropy&cs=srgb&fm=jpg&q=85',
          'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?crop=entropy&cs=srgb&fm=jpg&q=85',
          'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?crop=entropy&cs=srgb&fm=jpg&q=85',
        ],
      },
      {
        id: '11-branco',
        label: 'Branco',
        model: 'Padrão',
        color: 'Branco',
        price: 34.0,
        originalPrice: null,
        inStock: true,
        images: [
          'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?crop=entropy&cs=srgb&fm=jpg&q=85',
          'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?crop=entropy&cs=srgb&fm=jpg&q=85',
          'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?crop=entropy&cs=srgb&fm=jpg&q=85',
        ],
      },
    ],

    // compat
    image:
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?crop=entropy&cs=srgb&fm=jpg&q=85',

    category: 'Acessórios',
    material: 'ABS',
    rating: 4.6,
    reviews: 89,
    inStock: true,
    featured: false,
    dealOfTheDay: false,
    specifications: {
      layerHeight: '0.20mm',
      infill: '30%',
      printTime: '8 horas',
      material: 'ABS Black',
      compatibility: 'Xbox Series X/S',
    },
  },

  {
    id: '12',
    name: 'Busto de Personagem RPG',
    description:
      'Busto detalhado de elfo mago para coleção ou RPG de mesa. Pintado profissionalmente.',
    price: 68.0,
    originalPrice: 85.0,
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?crop=entropy&cs=srgb&fm=jpg&q=85',
    category: 'Miniaturas',
    material: 'Resina',
    rating: 5.0,
    reviews: 76,
    inStock: true,
    featured: false,
    dealOfTheDay: true,
    specifications: {
      layerHeight: '0.05mm',
      printTime: '22 horas',
      material: 'Resina Standard Grey',
      height: '15cm',
      finishing: 'Pintado à mão',
    },
  },

  {
    id: '13',
    name: 'Escultura Geométrica Abstrata',
    description: 'Arte moderna com formas geométricas entrelaçadas. Peça única de decoração.',
    price: 78.0,
    originalPrice: null,
    image:
      'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?crop=entropy&cs=srgb&fm=jpg&q=85',
    category: 'Decoração',
    material: 'PLA',
    rating: 4.8,
    reviews: 54,
    inStock: true,
    featured: false,
    dealOfTheDay: false,
    specifications: {
      layerHeight: '0.16mm',
      infill: '15%',
      printTime: '28 horas',
      material: 'PLA Metallic',
      dimensions: '20x20x30cm',
    },
  },

  {
    id: '14',
    name: 'Armadura de Braço Samurai',
    description: 'Réplica de armadura de braço samurai. Ajustável com sistema de fivelas.',
    price: 145.0,
    originalPrice: 180.0,
    image:
      'https://images.unsplash.com/photo-1555274175-6cbf6f3b137b?crop=entropy&cs=srgb&fm=jpg&q=85',
    category: 'Cosplay',
    material: 'ABS',
    rating: 4.9,
    reviews: 112,
    inStock: true,
    featured: true,
    dealOfTheDay: false,
    specifications: {
      layerHeight: '0.20mm',
      printTime: '40 horas',
      material: 'ABS Premium',
      weight: '650g',
      adjustable: 'Sim',
    },
  },

  {
    id: '15',
    name: 'Porta-Canetas Engrenagem',
    description: 'Design steampunk com engrenagens funcionais. Base giratória para fácil acesso.',
    price: 42.0,
    originalPrice: null,

    // ✅ Exemplo: variação por cor (steampunk costuma ter cores diferentes)
    variants: [
      {
        id: '15-bronze',
        label: 'Bronze',
        model: 'Padrão',
        color: 'Bronze',
        price: 42.0,
        originalPrice: null,
        inStock: true,
        images: [
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?crop=entropy&cs=srgb&fm=jpg&q=85',
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?crop=entropy&cs=srgb&fm=jpg&q=85',
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?crop=entropy&cs=srgb&fm=jpg&q=85',
        ],
      },
      {
        id: '15-preto',
        label: 'Preto Fosco',
        model: 'Padrão',
        color: 'Preto',
        price: 44.0,
        originalPrice: null,
        inStock: true,
        images: [
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?crop=entropy&cs=srgb&fm=jpg&q=85',
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?crop=entropy&cs=srgb&fm=jpg&q=85',
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?crop=entropy&cs=srgb&fm=jpg&q=85',
        ],
      },
    ],

    // compat
    image:
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?crop=entropy&cs=srgb&fm=jpg&q=85',

    category: 'Acessórios',
    material: 'PLA',
    rating: 4.7,
    reviews: 167,
    inStock: true,
    featured: false,
    dealOfTheDay: false,
    specifications: {
      layerHeight: '0.16mm',
      infill: '25%',
      printTime: '14 horas',
      material: 'PLA Bronze',
      capacity: '12 canetas',
      rotating: 'Sim',
    },
  },

  {
    id: '16',
    name: 'Set de Miniaturas Dragões',
    description:
      'Coleção com 5 dragões de diferentes espécies. Perfeito para RPG de mesa ou coleção.',
    price: 95.0,
    originalPrice: 120.0,
    image:
      'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?crop=entropy&cs=srgb&fm=jpg&q=85',
    category: 'Miniaturas',
    material: 'Resina',
    rating: 5.0,
    reviews: 143,
    inStock: true,
    featured: true,
    dealOfTheDay: false,
    specifications: {
      layerHeight: '0.05mm',
      printTime: '35 horas',
      material: 'Resina ABS-Like',
      set: '5 dragões',
      scale: '28mm',
    },
  },
];

export const categories = [
  {
    id: 'miniaturas',
    name: 'Miniaturas',
    slug: 'miniaturas',
    image:
      'https://images.unsplash.com/photo-1653164579768-ea97833b3b03?crop=entropy&cs=srgb&fm=jpg&q=85',
    count: 6,
  },
  {
    id: 'cosplay',
    name: 'Cosplay Props',
    slug: 'cosplay',
    image:
      'https://images.unsplash.com/photo-1599837826158-79e79f6e032f?crop=entropy&cs=srgb&fm=jpg&q=85',
    count: 3,
  },
  {
    id: 'decoracao',
    name: 'Decoração',
    slug: 'decoracao',
    image:
      'https://images.unsplash.com/photo-1767498051839-c7fba864e657?crop=entropy&cs=srgb&fm=jpg&q=85',
    count: 3,
  },
  {
    id: 'acessorios',
    name: 'Acessórios Tech',
    slug: 'acessorios',
    image:
      'https://images.unsplash.com/photo-1636703781897-b8751da69617?crop=entropy&cs=srgb&fm=jpg&q=85',
    count: 4,
  },
];

export const materials = ['PLA', 'Resina', 'ABS'];
