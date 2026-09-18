/**
 * ИСТОЧНИК КОНТЕНТА
 * -----------------
 * Каждый товар описан здесь как обычный объект данных. Этот файл читается
 * один раз — в пустую базу при первом запуске. Дальше товары живут в базе и
 * редактируются в студии /admin.
 *
 * Чтобы добавить в базу новые товары из этого файла:
 *   1. откройте /admin → «Добавить из файла контента» — добавит только те,
 *      которых ещё нет (по slug), существующие не тронет; либо
 *   2. вызовите POST /api/seed (с ?overwrite=true перепишет все товары из файла,
 *      включая цены и фото, отредактированные в студии).
 *
 * ПОЛЯ
 *   name / code / category       → идентичность товара ('category' — фильтр в каталоге)
 *   price                        → в рублях, в базе хранится в копейках
 *   description / story          → короткий анонс + большой редакционный текст
 *   images                       → пути из /public, первое изображение — обложка
 *   sizes                        → доступные размеры (["ONE SIZE"] для аксессуаров)
 *   details                      → характеристики на странице товара
 *   modelUrl                     → необязательный GLB/GLTF в /public/models.
 *                                  Пустая строка — 3D-блок у товара не показывается.
 *   featured                     → выводится на главной странице
 */

export type SeedProduct = {
  slug: string;
  name: string;
  code: string;
  category: string;
  categoryLabel: string;
  price: number;
  description: string;
  story: string;
  images: string[];
  sizes: string[];
  details: { label: string; value: string }[];
  modelUrl: string;
  featured: boolean;
  position: number;
};

export const CATEGORY_ORDER = [
  "outerwear",
  "hoodies",
  "tees",
  "knitwear",
  "trousers",
  "headwear",
  "objects",
];

export const seedProducts: SeedProduct[] = [
  {
    slug: "zip-hudi-g2",
    name: "ZIP ХУДИ G2",
    code: "GV-01",
    category: "hoodies",
    categoryLabel: "Худи",
    price: 8900,
    description:
      "Тяжёлое худи на молнии из плотного футера, оверсайз-крой, двойной капюшон и посаженный вручную принт.",
    story:
      "Опорная вещь коллекции. Футер 480 г/м² с начёсом, крашение по готовому изделию и энзимная стирка — каждый экземпляр садится и выцветает чуть иначе. Принт нанесён вручную низкоплотной краской, которая со временем трескается: поверхность фиксирует носку.",
    images: ["/images/products/zip-hoodie.jpg", "/images/texture.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    details: [
      { label: "Ткань", value: "Футер петля 480 г/м², хлопок" },
      { label: "Крой", value: "Оверсайз — на размер меньше для прямого силуэта" },
      { label: "Обработка", value: "Крашение по изделию, энзимная стирка" },
      { label: "Фурнитура", value: "Матовая металлическая молния" },
      { label: "Производство", value: "Португалия" },
    ],
    modelUrl: "",
    featured: true,
    position: 1,
  },
  {
    slug: "futbolka-g2",
    name: "ФУТБОЛКА G2",
    code: "GV-02",
    category: "tees",
    categoryLabel: "Футболки",
    price: 5500,
    description:
      "Футболка прямого кроя из плотного джерси с выцветшим тональным принтом на груди.",
    story:
      "Самая тихая вещь программы: широкий корпус, короткий рукав, прямой низ. Принт вручную разбивают до отправки, поэтому графика читается как найденная, а не как новая.",
    images: ["/images/products/boxy-tee.jpg", "/images/texture.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    details: [
      { label: "Ткань", value: "Компактный хлопковый джерси 260 г/м²" },
      { label: "Крой", value: "Прямой, укороченный" },
      { label: "Принт", value: "Шелкография с ручной доработкой" },
      { label: "Производство", value: "Португалия" },
    ],
    modelUrl: "",
    featured: true,
    position: 2,
  },
  {
    slug: "svitshot-g2",
    name: "СВИТШОТ G2",
    code: "GV-03",
    category: "knitwear",
    categoryLabel: "Трикотаж",
    price: 7900,
    description:
      "Светлый свитшот из плотного футера с рельефными резинками и сдержанной тёмной графикой.",
    story:
      "Единственный светлый объект в тёмном гардеробе. Начёс только внутри: внешняя сторона остаётся графичной, силуэт держит форму после стирки.",
    images: ["/images/products/crewneck.jpg", "/images/texture.jpg"],
    sizes: ["S", "M", "L", "XL"],
    details: [
      { label: "Ткань", value: "Начёсный футер 420 г/м²" },
      { label: "Цвет", value: "Костный / светлый" },
      { label: "Крой", value: "Свободный, спущенное плечо" },
      { label: "Производство", value: "Португалия" },
    ],
    modelUrl: "",
    featured: true,
    position: 3,
  },
  {
    slug: "kepka-g2",
    name: "КЕПКА G2",
    code: "GV-04",
    category: "headwear",
    categoryLabel: "Головные уборы",
    price: 3500,
    description:
      "Кепка из мытого хлопка, шесть клиньев, тональная вышивка и матовая металлическая застёжка.",
    story:
      "Хлопок стирают до состояния, когда тулья садится по голове, а козырёк ломается в нужном месте. Вышивка тональная — проявляется только в скользящем свете, как и вся остальная коллекция.",
    images: ["/images/products/field-cap.jpg", "/images/texture.jpg"],
    sizes: ["ONE SIZE"],
    details: [
      { label: "Ткань", value: "Мытый хлопковый твил" },
      { label: "Застёжка", value: "Матовая металлическая пряжка" },
      { label: "Детали", value: "Тональная вышивка, мягкая тулья" },
      { label: "Производство", value: "Португалия" },
    ],
    modelUrl: "",
    featured: true,
    position: 4,
  },
  {
    slug: "bomber-shell",
    name: "БОМБЕР-ШЕЛЛ G2",
    code: "GV-05",
    category: "outerwear",
    categoryLabel: "Верхняя одежда",
    price: 32900,
    description:
      "Бомбер из матового технического нейлона с резинками, скрытой планкой и тональными патчами.",
    story:
      "Спроектирован как оболочка, а не как куртка. Матовый японский нейлон, проклеенные швы и намеренное отсутствие брендинга — кроме тонального патча на рукаве, который ловит свет под определённым углом.",
    images: ["/images/products/bomber.jpg", "/images/texture.jpg"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    details: [
      { label: "Ткань", value: "Матовый нейлон, проклеенные швы" },
      { label: "Подкладка", value: "Сетка по корпусу, сатин в рукавах" },
      { label: "Крой", value: "В размер, есть место под слои" },
      { label: "Производство", value: "Япония" },
    ],
    modelUrl: "",
    featured: false,
    position: 5,
  },
  {
    slug: "kargo-bryuki",
    name: "КАРГО-БРЮКИ G2",
    code: "GV-06",
    category: "trousers",
    categoryLabel: "Брюки",
    price: 21900,
    description:
      "Широкие карго из сухого хлопкового канваса: накладные карманы и регулируемый низ.",
    story:
      "Широкие и плоские по штанине, с низкой посадкой и собранным на скрытый шнур низом. Канвас сухой на ощупь и разнашивается по ноге через несколько недель.",
    images: ["/images/products/cargo-trouser.jpg", "/images/texture.jpg"],
    sizes: ["46", "48", "50", "52", "54"],
    details: [
      { label: "Ткань", value: "Сухой хлопковый канвас 340 г/м²" },
      { label: "Крой", value: "Широкая штанина, средняя посадка" },
      { label: "Детали", value: "Накладные карманы, скрытый шнур в низу" },
      { label: "Производство", value: "Португалия" },
    ],
    modelUrl: "",
    featured: false,
    position: 6,
  },
  {
    slug: "overshort",
    name: "ОВЕРШЁРТ G2",
    code: "GV-07",
    category: "outerwear",
    categoryLabel: "Верхняя одежда",
    price: 24900,
    description:
      "Мытый чёрный овершёрт с двумя нагрудными карманами — длинный корпус, носится открытым или закрытым.",
    story:
      "Слой между рубашкой и курткой. Двойная стирка для разбитой поверхности и пуговицы из корозо, которые выгорают от почти чёрного к серому.",
    images: ["/images/products/overshirt.jpg", "/images/texture.jpg"],
    sizes: ["S", "M", "L", "XL"],
    details: [
      { label: "Ткань", value: "Хлопковый твил, двойная стирка" },
      { label: "Застёжка", value: "Пуговицы из корозо" },
      { label: "Крой", value: "Свободный, удлинённый корпус" },
      { label: "Производство", value: "Португалия" },
    ],
    modelUrl: "",
    featured: false,
    position: 7,
  },
  {
    slug: "shapka-g2",
    name: "ШАПКА G2",
    code: "GV-08",
    category: "headwear",
    categoryLabel: "Головные уборы",
    price: 6900,
    description:
      "Шапка мелкой резинкой из мериноса с отворотом и почти незаметным тональным лейблом.",
    story:
      "Вяжется в один проход без шва: мелкая резинка держит форму на голове, а не складывается. Лейбл выткан в тон пряжи.",
    images: ["/images/products/beanie.jpg", "/images/texture.jpg"],
    sizes: ["ONE SIZE"],
    details: [
      { label: "Ткань", value: "Мериносовая шерсть, мелкая резинка" },
      { label: "Конструкция", value: "Бесшовная вязка, отворот" },
      { label: "Уход", value: "Ручная стирка, сушить на плоскости" },
      { label: "Производство", value: "Италия" },
    ],
    modelUrl: "",
    featured: false,
    position: 8,
  },
];

export const siteCopy = {
  brand: "G2",
  brandLatin: "G2",
  tagline: "Точность. Скорость. Результат.",
  subline: "Стритвеар бренд, вдохновлённый современной военной эстетикой.",
  manifesto:
    "Мы создаём одежду для тех, кто ценит силу, точность и характер. G2 — это не просто бренд, это философия.",
  position:
    "Больше, чем просто одежда. Это — позиция.",
  coordinates: "55.7558° N 37.6173° E",
  season: "SS/26 — Техническая программа",
  // Ссылки собраны из ников, которые показаны на странице «Контакты». Проверьте, что они ваши.
  instagram: "https://instagram.com/geran.2",
  telegram: "https://t.me/geran2",
  vk: "https://vk.com/geran2",
  email: "studio@g2wear.ru",
  // Год подставляется автоматически: «© 2026 G2. Все права защищены.»
  copyright: "G2. Все права защищены.",
};

/** Навигация из референса: ГЛАВНАЯ / КАТАЛОГ / О БРЕНДЕ / ДОСТАВКА / КОНТАКТЫ */
export const siteNav = [
  { href: "/", label: "Главная" },
  { href: "/shop", label: "Каталог" },
  { href: "/about", label: "О бренде" },
  { href: "/delivery", label: "Доставка" },
  { href: "/contact", label: "Контакты" },
];

export const legalNav = [
  { href: "/terms", label: "Условия" },
  { href: "/privacy", label: "Конфиденциальность" },
];
