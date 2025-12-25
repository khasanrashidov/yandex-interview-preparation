# Интервью по системному дизайну: Платформа аренды квартир (как Airbnb)

## Первоначальная постановка задачи (Как клиент)

"Я хочу создать платформу для аренды квартир, как Airbnb. Пользователи должны иметь возможность размещать свою недвижимость, искать и бронировать жилье, совершать платежи и оставлять отзывы. Платформа должна поддерживать несколько языков и валют, обрабатывать тысячи одновременных пользователей и обеспечивать бесшовный опыт в разных странах и культурах."

---

## Пошаговый процесс интервью

### Фаза 1: Уточнение требований (5-10 минут)

_Как интервьюер, задавайте эти уточняющие вопросы, когда кандидат просит разъяснения:_

#### **Функциональные требования:**

- **Управление пользователями**: Хозяева и гости могут регистрироваться, входить в систему, управлять профилями с верификацией личности
- **Управление недвижимостью**: Хозяева могут размещать объекты с фотографиями, описаниями, ценами, календарем доступности
- **Поиск и обнаружение**: Гости могут искать по местоположению, датам, цене, удобствам с фильтрами и картами
- **Система бронирования**: Доступность в реальном времени, мгновенное бронирование, рабочие процессы запроса на бронирование
- **Обработка платежей**: Множественные способы оплаты, конвертация валют, система эскроу
- **Отзывы и рейтинги**: Двусторонние отзывы между хозяевами и гостями
- **Система сообщений**: Внутриприложенческое общение между хозяевами и гостями
- **Интернационализация**: Поддержка нескольких языков, местные валюты, культурные адаптации
- **Мобильная поддержка**: Адаптивный веб и нативные мобильные приложения

#### **Нефункциональные требования:**

- **Масштаб**: 10 миллионов пользователей, 1 миллион объектов, 100 тысяч одновременных пользователей, 10 тысяч бронирований в день
- **Производительность**: <200мс ответ поиска, <100мс подтверждение бронирования, <1с загрузка страницы
- **Доступность**: 99.95% времени безотказной работы, плавная деградация во время пиковых нагрузок
- **Согласованность**: Строгая согласованность для бронирований, итоговая согласованность для отзывов/поиска
- **Безопасность**: Соответствие PCI, шифрование данных, предотвращение мошенничества, верификация личности
- **Локализация**: Поддержка 50+ языков, 100+ валют, региональные регулирования

#### **Вне области рассмотрения** (упомяните это, чтобы ограничить проблему):

- Продвинутые функции как Airbnb Plus, Впечатления или Деловые поездки
- Сложные алгоритмы ценообразования (динамическое ценообразование, умное ценообразование)
- Продвинутое обнаружение мошенничества и рекомендации машинного обучения

---

### Фаза 2: Высокоуровневая архитектура системы (10-15 минут)

_Ожидаемый ответ кандидата должен включать:_

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Мобильные   │    │     Веб     │    │     CDN     │
│ приложения  │    │   клиент    │    │ (Изображения,│
│(iOS/Android)│◄──►│ (React SPA) │◄──►│ статические │
└─────────────┘    └─────────────┘    │ ресурсы)    │
                                      └─────────────┘
                           │                  │
                    ┌─────────────┐    ┌─────────────┐
                    │     API     │    │Балансировщик│
                    │   Gateway   │◄──►│ нагрузки    │
                    │(Ограничение │    │ (Nginx)     │
                    │скорости,    │    └─────────────┘
                    │Авториз.,    │
                    │Маршрутиз.)  │
                    └─────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Сервис    │    │   Сервис    │    │   Сервис    │
│пользователей│    │недвижимости │    │бронирования │
└─────────────┘    └─────────────┘    └─────────────┘
        │                  │                  │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Сервис    │    │   Сервис    │    │   Сервис    │
│  платежей   │    │   поиска    │    │ уведомлений │
└─────────────┘    └─────────────┘    └─────────────┘
        │                  │                  │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ PostgreSQL  │    │Elasticsearch│    │   Redis     │
│(Пользователи,│    │(Недвижимость,│   │(Кэш,        │
│Бронирования, │    │ Поисковый   │    │ Сессии)     │
│Платежи)     │    │ индекс)     │    └─────────────┘
└─────────────┘    └─────────────┘
        │                  │
┌─────────────┐    ┌─────────────┐
│  Очередь    │    │ Хранилище   │
│ сообщений   │    │  файлов     │
│ (RabbitMQ)  │    │  (AWS S3)   │
└─────────────┘    └─────────────┘
```

#### **Ключевые компоненты:**

1. **Фронтенд**: React SPA с TypeScript, React Native для мобильных приложений
2. **API Gateway**: Kong/AWS API Gateway для маршрутизации, аутентификации, ограничения скорости
3. **Микросервисы**: Сервисы пользователей, недвижимости, бронирования, платежей, поиска, уведомлений
4. **Базы данных**: PostgreSQL для транзакционных данных, Elasticsearch для поиска, Redis для кэширования
5. **Хранилище файлов**: AWS S3 для изображений и документов с CloudFront CDN
6. **Очередь сообщений**: RabbitMQ/AWS SQS для асинхронной обработки
7. **Внешние API**: Процессоры платежей (Stripe, PayPal), Карты (Google Maps), Сервисы перевода

---

### Фаза 3: Углубленные вопросы

#### **Вопрос 1: "Как вы обрабатываете доступность в реальном времени и предотвращаете двойное бронирование?"**

_Ожидаемый ответ должен охватывать:_

**Дизайн базы данных:**

```sql
-- Таблица недвижимости
CREATE TABLE properties (
  id UUID PRIMARY KEY,
  host_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  address JSONB NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  max_guests INTEGER NOT NULL,
  amenities JSONB,
  house_rules TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Календарь доступности
CREATE TABLE availability_calendar (
  id UUID PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id),
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  price_override DECIMAL(10,2),
  minimum_stay INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(property_id, date)
);

-- Таблица бронирований с оптимистичной блокировкой
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id),
  guest_id UUID NOT NULL,
  host_id UUID NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Логика бронирования с контролем параллелизма:**

```javascript
class BookingService {
  async createBooking(bookingData) {
    const { propertyId, checkIn, checkOut, guestId, guestsCount } = bookingData;

    return await this.db.transaction(async (trx) => {
      // 1. Заблокировать недвижимость для обновления
      const property = await trx("properties")
        .where("id", propertyId)
        .forUpdate()
        .first();

      if (!property) {
        throw new Error("Недвижимость не найдена");
      }

      // 2. Проверить доступность для диапазона дат
      const unavailableDates = await trx("availability_calendar")
        .where("property_id", propertyId)
        .whereBetween("date", [checkIn, checkOut])
        .where("is_available", false)
        .orWhereExists(function () {
          this.select("*")
            .from("bookings")
            .where("property_id", propertyId)
            .where("status", "confirmed")
            .where(function () {
              this.whereBetween("check_in", [checkIn, checkOut])
                .orWhereBetween("check_out", [checkIn, checkOut])
                .orWhere(function () {
                  this.where("check_in", "<=", checkIn).where(
                    "check_out",
                    ">=",
                    checkOut
                  );
                });
            });
        });

      if (unavailableDates.length > 0) {
        throw new Error("Недвижимость недоступна для выбранных дат");
      }

      // 3. Создать бронирование
      const booking = await trx("bookings")
        .insert({
          id: uuid(),
          property_id: propertyId,
          guest_id: guestId,
          host_id: property.host_id,
          check_in: checkIn,
          check_out: checkOut,
          guests_count: guestsCount,
          total_price: this.calculateTotalPrice(property, checkIn, checkOut),
          currency: property.currency,
          status: "pending",
        })
        .returning("*");

      // 4. Обновить календарь доступности
      const dates = this.getDateRange(checkIn, checkOut);
      await trx("availability_calendar")
        .whereIn("date", dates)
        .where("property_id", propertyId)
        .update({ is_available: false });

      return booking[0];
    });
  }

  // Распределенная блокировка с Redis для высокомасштабных сценариев
  async createBookingWithDistributedLock(bookingData) {
    const lockKey = `booking_lock:${bookingData.propertyId}`;
    const lockValue = uuid();
    const lockTTL = 30000; // 30 секунд

    try {
      // Получить распределенную блокировку
      const acquired = await this.redis.set(
        lockKey,
        lockValue,
        "PX",
        lockTTL,
        "NX"
      );

      if (!acquired) {
        throw new Error("Недвижимость бронируется другим пользователем");
      }

      return await this.createBooking(bookingData);
    } finally {
      // Освободить блокировку
      await this.redis.eval(
        `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `,
        1,
        lockKey,
        lockValue
      );
    }
  }
}
```

---

#### **Вопрос 2: "Как вы реализуете интернационализацию и локализацию?"**

_Ожидаемый ответ должен охватывать:_

**Интернационализация фронтенда:**

```javascript
// Конфигурация i18n
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: "ru", // язык по умолчанию
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",

    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: "/api/locales/{{lng}}/{{ns}}.json",
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;

// React компонент с локализацией
import { useTranslation } from "react-i18next";
import { formatCurrency, formatDate } from "../utils/localization";

const PropertyCard = ({ property, userCurrency, userLocale }) => {
  const { t } = useTranslation();

  return (
    <div className="property-card">
      <h3>{property.title}</h3>
      <p>{t("property.guestsCount", { count: property.maxGuests })}</p>
      <p className="price">
        {formatCurrency(property.pricePerNight, userCurrency, userLocale)}
        <span className="per-night">/{t("common.perNight")}</span>
      </p>
      <p className="availability">
        {t("property.availableFrom", {
          date: formatDate(property.availableFrom, userLocale),
        })}
      </p>
    </div>
  );
};

// Утилиты локализации
export const formatCurrency = (amount, currency, locale) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const formatDate = (date, locale) => {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

// Хук конвертации валют
const useCurrencyConversion = () => {
  const [exchangeRates, setExchangeRates] = useState({});
  const [userCurrency, setUserCurrency] = useState("RUB");

  useEffect(() => {
    // Получить курсы валют из API
    fetch("/api/exchange-rates")
      .then((res) => res.json())
      .then(setExchangeRates);
  }, []);

  const convertPrice = useCallback(
    (amount, fromCurrency, toCurrency) => {
      if (fromCurrency === toCurrency) return amount;

      const rate = exchangeRates[`${fromCurrency}_${toCurrency}`];
      return rate ? amount * rate : amount;
    },
    [exchangeRates]
  );

  return { userCurrency, setUserCurrency, convertPrice };
};
```

**Сервис локализации бэкенда:**

```javascript
class LocalizationService {
  constructor() {
    this.translationCache = new Map();
    this.exchangeRateCache = new Map();
  }

  // Управление переводами
  async getTranslations(language, namespace) {
    const cacheKey = `${language}:${namespace}`;

    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey);
    }

    const translations = await this.db.query(
      `
      SELECT key, value FROM translations 
      WHERE language = $1 AND namespace = $2
    `,
      [language, namespace]
    );

    const translationMap = translations.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

    this.translationCache.set(cacheKey, translationMap);
    return translationMap;
  }

  // Конвертация валют
  async getExchangeRates() {
    const cached = this.exchangeRateCache.get("rates");
    if (cached && Date.now() - cached.timestamp < 3600000) {
      // кэш на 1 час
      return cached.rates;
    }

    // Получить из внешнего API (например, Fixer.io, CurrencyAPI)
    const response = await fetch(
      `https://api.fixer.io/latest?access_key=${process.env.FIXER_API_KEY}`
    );
    const data = await response.json();

    this.exchangeRateCache.set("rates", {
      rates: data.rates,
      timestamp: Date.now(),
    });

    return data.rates;
  }

  // Локализация контента
  async localizeProperty(property, targetLanguage, targetCurrency) {
    const localized = { ...property };

    // Перевести текстовый контент, если доступен
    if (property.translations && property.translations[targetLanguage]) {
      localized.title =
        property.translations[targetLanguage].title || property.title;
      localized.description =
        property.translations[targetLanguage].description ||
        property.description;
    }

    // Конвертировать валюту
    if (targetCurrency !== property.currency) {
      const rates = await this.getExchangeRates();
      const rate = rates[`${property.currency}_${targetCurrency}`];
      if (rate) {
        localized.pricePerNight = property.pricePerNight * rate;
        localized.currency = targetCurrency;
      }
    }

    return localized;
  }

  // Региональное соответствие
  getRegionalSettings(country) {
    const regionalSettings = {
      US: {
        currency: "USD",
        dateFormat: "MM/DD/YYYY",
        taxRate: 0.08,
        paymentMethods: ["credit_card", "paypal", "apple_pay"],
        requiredFields: ["ssn_last4"],
      },
      DE: {
        currency: "EUR",
        dateFormat: "DD.MM.YYYY",
        taxRate: 0.19,
        paymentMethods: ["credit_card", "sepa", "sofort"],
        requiredFields: ["tax_id"],
        gdprCompliance: true,
      },
      RU: {
        currency: "RUB",
        dateFormat: "DD.MM.YYYY",
        taxRate: 0.2,
        paymentMethods: ["credit_card", "yandex_money", "qiwi"],
        requiredFields: ["inn"],
      },
      JP: {
        currency: "JPY",
        dateFormat: "YYYY/MM/DD",
        taxRate: 0.1,
        paymentMethods: ["credit_card", "konbini"],
        requiredFields: ["my_number"],
      },
    };

    return regionalSettings[country] || regionalSettings.US;
  }
}
```

---

#### **Вопрос 3: "Как вы реализуете функциональность поиска с фильтрами и геолокацией?"**

_Ожидаемый ответ должен охватывать:_

**Дизайн индекса Elasticsearch:**

```javascript
// Маппинг индекса недвижимости
const propertyIndexMapping = {
  mappings: {
    properties: {
      id: { type: "keyword" },
      title: {
        type: "text",
        analyzer: "russian",
        fields: {
          keyword: { type: "keyword" },
        },
      },
      description: { type: "text", analyzer: "russian" },
      location: { type: "geo_point" },
      address: {
        properties: {
          street: { type: "text", analyzer: "russian" },
          city: { type: "keyword" },
          country: { type: "keyword" },
          zipCode: { type: "keyword" },
        },
      },
      pricePerNight: { type: "float" },
      currency: { type: "keyword" },
      maxGuests: { type: "integer" },
      bedrooms: { type: "integer" },
      bathrooms: { type: "integer" },
      propertyType: { type: "keyword" },
      amenities: { type: "keyword" },
      rating: { type: "float" },
      reviewCount: { type: "integer" },
      instantBook: { type: "boolean" },
      hostId: { type: "keyword" },
      availability: {
        type: "date_range",
        format: "yyyy-MM-dd",
      },
      createdAt: { type: "date" },
      updatedAt: { type: "date" },
    },
  },
};

// Реализация сервиса поиска
class SearchService {
  constructor() {
    this.esClient = new Client({ node: process.env.ELASTICSEARCH_URL });
  }

  async searchProperties(searchParams) {
    const {
      query,
      location,
      radius = 10, // км
      checkIn,
      checkOut,
      guests = 1,
      minPrice,
      maxPrice,
      currency = "RUB",
      propertyType,
      amenities = [],
      instantBook,
      sortBy = "relevance",
      page = 1,
      limit = 20,
    } = searchParams;

    const must = [];
    const filter = [];

    // Текстовый поиск
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ["title^2", "description", "address.city^1.5"],
          type: "best_fields",
          fuzziness: "AUTO",
        },
      });
    }

    // Поиск по геолокации
    if (location) {
      filter.push({
        geo_distance: {
          distance: `${radius}км`,
          location: {
            lat: location.lat,
            lon: location.lon,
          },
        },
      });
    }

    // Вместимость гостей
    filter.push({
      range: {
        maxGuests: { gte: guests },
      },
    });

    // Диапазон цен (с конвертацией валют)
    if (minPrice || maxPrice) {
      const priceFilter = { range: { pricePerNight: {} } };
      if (minPrice) priceFilter.range.pricePerNight.gte = minPrice;
      if (maxPrice) priceFilter.range.pricePerNight.lte = maxPrice;
      filter.push(priceFilter);
    }

    // Тип недвижимости
    if (propertyType) {
      filter.push({ term: { propertyType } });
    }

    // Удобства
    if (amenities.length > 0) {
      filter.push({
        terms: { amenities },
      });
    }

    // Мгновенное бронирование
    if (instantBook) {
      filter.push({ term: { instantBook: true } });
    }

    // Проверка доступности
    if (checkIn && checkOut) {
      filter.push({
        range: {
          "availability.start": { lte: checkIn },
          "availability.end": { gte: checkOut },
        },
      });
    }

    // Сортировка
    let sort = [];
    switch (sortBy) {
      case "price_low":
        sort = [{ pricePerNight: { order: "asc" } }];
        break;
      case "price_high":
        sort = [{ pricePerNight: { order: "desc" } }];
        break;
      case "rating":
        sort = [{ rating: { order: "desc" } }];
        break;
      case "distance":
        if (location) {
          sort = [
            {
              _geo_distance: {
                location: { lat: location.lat, lon: location.lon },
                order: "asc",
                unit: "км",
              },
            },
          ];
        }
        break;
      default:
        sort = ["_score"];
    }

    const searchQuery = {
      index: "properties",
      body: {
        query: {
          bool: { must, filter },
        },
        sort,
        from: (page - 1) * limit,
        size: limit,
        aggs: {
          priceRange: {
            range: {
              field: "pricePerNight",
              ranges: [
                { to: 3000 },
                { from: 3000, to: 6000 },
                { from: 6000, to: 12000 },
                { from: 12000 },
              ],
            },
          },
          propertyTypes: {
            terms: { field: "propertyType" },
          },
          amenities: {
            terms: { field: "amenities", size: 20 },
          },
        },
      },
    };

    const response = await this.esClient.search(searchQuery);

    return {
      properties: response.body.hits.hits.map((hit) => ({
        ...hit._source,
        score: hit._score,
        distance: hit.sort?.[0], // если сортировка по расстоянию
      })),
      total: response.body.hits.total.value,
      aggregations: response.body.aggregations,
      page,
      limit,
    };
  }

  // Автодополнение предложений
  async getSuggestions(query, type = "location") {
    const searchQuery = {
      index: "properties",
      body: {
        suggest: {
          [type]: {
            prefix: query,
            completion: {
              field: `${type}_suggest`,
              size: 10,
            },
          },
        },
      },
    };

    const response = await this.esClient.search(searchQuery);
    return response.body.suggest[type][0].options;
  }
}
```

---

#### **Вопрос 4: "Как вы обрабатываете платежи с несколькими валютами и соответствием требованиям?"**

_Ожидаемый ответ должен охватывать:_

**Архитектура сервиса платежей:**

```javascript
class PaymentService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.yandexMoney = new YandexMoney({
      clientId: process.env.YANDEX_MONEY_CLIENT_ID,
      clientSecret: process.env.YANDEX_MONEY_CLIENT_SECRET,
    });
    this.qiwi = new QIWI({
      secretKey: process.env.QIWI_SECRET_KEY,
    });
  }

  async createBookingPayment(bookingId, paymentData) {
    const booking = await this.getBooking(bookingId);
    const { amount, currency, paymentMethod, guestId } = paymentData;

    // Рассчитать комиссии и налоги
    const fees = await this.calculateFees(booking);
    const totalAmount = amount + fees.serviceFee + fees.taxes;

    try {
      let paymentResult;

      switch (paymentMethod.type) {
        case "stripe":
          paymentResult = await this.processStripePayment({
            amount: totalAmount,
            currency,
            customerId: paymentMethod.customerId,
            paymentMethodId: paymentMethod.id,
            metadata: {
              bookingId,
              guestId,
              hostId: booking.hostId,
            },
          });
          break;

        case "yandex_money":
          paymentResult = await this.processYandexMoneyPayment({
            amount: totalAmount,
            currency,
            bookingId,
          });
          break;

        case "qiwi":
          paymentResult = await this.processQiwiPayment({
            amount: totalAmount,
            currency,
            bookingId,
          });
          break;

        default:
          throw new Error("Неподдерживаемый способ оплаты");
      }

      // Создать запись платежа
      const payment = await this.db.query(
        `
        INSERT INTO payments (
          id, booking_id, guest_id, host_id, amount, currency,
          service_fee, taxes, total_amount, payment_method,
          external_payment_id, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        RETURNING *
      `,
        [
          uuid(),
          bookingId,
          guestId,
          booking.hostId,
          amount,
          currency,
          fees.serviceFee,
          fees.taxes,
          totalAmount,
          paymentMethod.type,
          paymentResult.id,
          "completed",
        ]
      );

      // Обновить статус бронирования
      await this.updateBookingStatus(bookingId, "confirmed");

      // Запланировать выплату хозяину (после заезда или через 24 часа)
      await this.scheduleHostPayout(booking, payment[0]);

      return payment[0];
    } catch (error) {
      await this.handlePaymentFailure(bookingId, error);
      throw error;
    }
  }

  async processStripePayment({
    amount,
    currency,
    customerId,
    paymentMethodId,
    metadata,
  }) {
    // Конвертировать сумму в наименьшую единицу валюты
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      customer: customerId,
      payment_method: paymentMethodId,
      confirmation_method: "manual",
      confirm: true,
      metadata,
      // Удержать средства для маркетплейса
      transfer_data: {
        destination: metadata.hostId, // Stripe Connect аккаунт хозяина
      },
      application_fee_amount: Math.round(amount * 0.03 * 100), // 3% комиссия платформы
    });

    if (paymentIntent.status === "requires_action") {
      return {
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
      };
    }

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
    };
  }

  async calculateFees(booking) {
    const { totalPrice, currency, hostCountry, guestCountry } = booking;

    // Сервисная комиссия (процентная с минимумом)
    const serviceFeeRate = 0.03; // 3%
    const minServiceFee = this.getMinServiceFee(currency);
    const serviceFee = Math.max(totalPrice * serviceFeeRate, minServiceFee);

    // Налоги (варьируются по местоположению)
    const taxRate = await this.getTaxRate(hostCountry, guestCountry);
    const taxes = totalPrice * taxRate;

    // Комиссия за обработку платежей
    const processingFee = this.getProcessingFee(currency);

    return {
      serviceFee,
      taxes,
      processingFee,
      total: serviceFee + taxes + processingFee,
    };
  }

  // Соответствие требованиям и регулирование
  async validatePaymentCompliance(paymentData) {
    const { amount, currency, guestCountry, hostCountry } = paymentData;

    // Проверки AML (Противодействие отмыванию денег)
    if (amount > this.getAMLThreshold(currency)) {
      await this.performAMLCheck(paymentData);
    }

    // Проверка санкций
    await this.screenForSanctions(paymentData.guestId);

    // Региональное соответствие
    const compliance = await this.getRegionalCompliance(
      guestCountry,
      hostCountry
    );

    if (compliance.requiresAdditionalVerification) {
      throw new Error("Требуется дополнительная верификация");
    }

    return true;
  }

  // Поддержка нескольких валют
  async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;

    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  // Выплата хозяевам
  async scheduleHostPayout(booking, payment) {
    const payoutDate = new Date(booking.checkIn);
    payoutDate.setDate(payoutDate.getDate() + 1); // 24 часа после заезда

    await this.messageQueue.publish("host-payout", {
      bookingId: booking.id,
      paymentId: payment.id,
      hostId: booking.hostId,
      amount: payment.amount - payment.serviceFee,
      currency: payment.currency,
      scheduledFor: payoutDate,
    });
  }
}
```

---

#### **Вопрос 5: "Как вы реализуете систему отзывов и рейтингов?"**

_Ожидаемый ответ должен охватывать:_

**Дизайн системы отзывов:**

```javascript
// Схема базы данных для отзывов
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id),
  reviewer_id UUID NOT NULL,
  reviewee_id UUID NOT NULL,
  reviewer_type VARCHAR(10) NOT NULL CHECK (reviewer_type IN ('guest', 'host')),
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(booking_id, reviewer_type)
);

// Реализация сервиса отзывов
class ReviewService {
  async createReview(reviewData) {
    const { bookingId, reviewerId, reviewerType, ratings, comment } = reviewData;

    // Валидировать право на отзыв
    const booking = await this.validateReviewEligibility(bookingId, reviewerId, reviewerType);

    // Проверить, существует ли уже отзыв
    const existingReview = await this.db.query(`
      SELECT id FROM reviews
      WHERE booking_id = $1 AND reviewer_type = $2
    `, [bookingId, reviewerType]);

    if (existingReview.length > 0) {
      throw new Error('Отзыв для этого бронирования уже существует');
    }

    // Создать отзыв
    const review = await this.db.query(`
      INSERT INTO reviews (
        id, booking_id, reviewer_id, reviewee_id, reviewer_type,
        overall_rating, cleanliness_rating, communication_rating,
        location_rating, value_rating, comment, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `, [
      uuid(), bookingId, reviewerId,
      reviewerType === 'guest' ? booking.hostId : booking.guestId,
      reviewerType, ratings.overall, ratings.cleanliness,
      ratings.communication, ratings.location, ratings.value, comment
    ]);

    // Обновить агрегированные рейтинги
    await this.updateAggregateRatings(
      reviewerType === 'guest' ? booking.propertyId : booking.hostId,
      reviewerType === 'guest' ? 'property' : 'host'
    );

    // Отправить уведомление
    await this.notificationService.sendReviewNotification(review[0]);

    return review[0];
  }

  async validateReviewEligibility(bookingId, reviewerId, reviewerType) {
    const booking = await this.db.query(`
      SELECT * FROM bookings
      WHERE id = $1 AND status = 'completed'
      AND check_out < NOW() - INTERVAL '24 hours'
    `, [bookingId]);

    if (!booking.length) {
      throw new Error('Бронирование не подходит для отзыва');
    }

    const bookingData = booking[0];

    // Проверить, что рецензент участвовал в бронировании
    if (reviewerType === 'guest' && bookingData.guestId !== reviewerId) {
      throw new Error('Нет прав для отзыва об этом бронировании');
    }

    if (reviewerType === 'host' && bookingData.hostId !== reviewerId) {
      throw new Error('Нет прав для отзыва об этом бронировании');
    }

    return bookingData;
  }

  async updateAggregateRatings(entityId, entityType) {
    const aggregateQuery = entityType === 'property' ? `
      SELECT
        AVG(overall_rating) as avg_rating,
        COUNT(*) as review_count,
        AVG(cleanliness_rating) as avg_cleanliness,
        AVG(communication_rating) as avg_communication,
        AVG(location_rating) as avg_location,
        AVG(value_rating) as avg_value
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.id
      WHERE b.property_id = $1 AND r.reviewer_type = 'guest'
    ` : `
      SELECT
        AVG(overall_rating) as avg_rating,
        COUNT(*) as review_count
      FROM reviews
      WHERE reviewee_id = $1 AND reviewer_type = 'guest'
    `;

    const result = await this.db.query(aggregateQuery, [entityId]);
    const stats = result[0];

    if (entityType === 'property') {
      await this.db.query(`
        UPDATE properties SET
          average_rating = $1,
          review_count = $2,
          cleanliness_rating = $3,
          communication_rating = $4,
          location_rating = $5,
          value_rating = $6,
          updated_at = NOW()
        WHERE id = $7
      `, [
        stats.avg_rating, stats.review_count, stats.avg_cleanliness,
        stats.avg_communication, stats.avg_location, stats.avg_value, entityId
      ]);

      // Обновить поисковый индекс
      await this.searchService.updatePropertyRating(entityId, stats);
    } else {
      await this.db.query(`
        UPDATE users SET
          average_rating = $1,
          review_count = $2,
          updated_at = NOW()
        WHERE id = $3
      `, [stats.avg_rating, stats.review_count, entityId]);
    }
  }

  // Модерация отзывов
  async moderateReview(reviewId, action, moderatorId) {
    const review = await this.db.query(`
      SELECT * FROM reviews WHERE id = $1
    `, [reviewId]);

    if (!review.length) {
      throw new Error('Отзыв не найден');
    }

    switch (action) {
      case 'approve':
        await this.db.query(`
          UPDATE reviews SET is_public = true WHERE id = $1
        `, [reviewId]);
        break;

      case 'hide':
        await this.db.query(`
          UPDATE reviews SET is_public = false WHERE id = $1
        `, [reviewId]);
        break;

      case 'delete':
        await this.db.query(`
          DELETE FROM reviews WHERE id = $1
        `, [reviewId]);
        break;
    }

    // Записать действие модерации
    await this.db.query(`
      INSERT INTO review_moderation_log (
        review_id, moderator_id, action, created_at
      ) VALUES ($1, $2, $3, NOW())
    `, [reviewId, moderatorId, action]);
  }

  // Анализ настроений и обнаружение спама
  async analyzeReviewContent(comment) {
    // Использовать внешний сервис как AWS Comprehend или Google Cloud Natural Language
    const sentimentResult = await this.nlpService.analyzeSentiment(comment);
    const spamScore = await this.nlpService.detectSpam(comment);

    return {
      sentiment: sentimentResult.sentiment,
      confidence: sentimentResult.confidence,
      spamScore,
      requiresModeration: spamScore > 0.7 || sentimentResult.confidence < 0.5
    };
  }
}
```

---

### Фаза 4: Обсуждение технологического стека

#### **Стек фронтенда:**

```yaml
Фреймворк: React 18 с TypeScript
Управление состоянием: Redux Toolkit + RTK Query
Стилизация: Tailwind CSS + Styled Components
Карты: Google Maps API / Mapbox / Яндекс.Карты
Интернационализация: react-i18next
Работа с датами: date-fns с поддержкой локалей
Обработка форм: React Hook Form + Yup валидация
Тестирование: Jest + React Testing Library + Cypress
Инструмент сборки: Vite
Мобильные: React Native с общей бизнес-логикой
```

#### **Стек бэкенда:**

```yaml
Среда выполнения: Node.js + Express.js / Fastify
Язык: TypeScript
База данных: PostgreSQL (основная) + Redis (кэш/сессии)
Поиск: Elasticsearch
Аутентификация: JWT + OAuth2 (Google, Facebook, Apple, Яндекс)
Хранилище файлов: AWS S3 + CloudFront CDN / Яндекс.Облако
Платежи: Stripe Connect + PayPal + Яндекс.Деньги + QIWI
Очередь сообщений: RabbitMQ / AWS SQS
Email: SendGrid / AWS SES / Яндекс.Почта
SMS: Twilio / SMS.ru
Мониторинг: DataDog + Winston logging
Документация API: OpenAPI/Swagger
```

#### **Инфраструктура:**

```yaml
Облачный провайдер: AWS / Google Cloud / Яндекс.Облако
Балансировщик нагрузки: AWS ALB / Google Cloud Load Balancer / Яндекс.Облако
База данных: AWS RDS PostgreSQL + Read Replicas / Яндекс Managed PostgreSQL
Кэш: AWS ElastiCache Redis / Яндекс Managed Redis
Поиск: AWS Elasticsearch Service / Яндекс Managed Elasticsearch
CDN: AWS CloudFront / Google Cloud CDN / Яндекс CDN
Оркестрация контейнеров: EKS / GKE / Яндекс Managed Kubernetes
CI/CD: GitHub Actions + AWS CodePipeline / GitLab CI
Мониторинг: DataDog + AWS CloudWatch / Яндекс Monitoring
Безопасность: AWS WAF + GuardDuty / Яндекс DDoS Protection
```

---

### Фаза 5: Вопросы по фронтенду

_Задавайте эти вопросы для оценки экспертизы фронтенда:_

1. **"Как бы вы реализовали галерею изображений недвижимости с ленивой загрузкой и оптимизацией?"**

   - Ожидается: Intersection Observer API, адаптивные изображения, формат WebP, прогрессивная загрузка

2. **"Как вы обрабатываете состояние формы для многошагового процесса бронирования?"**

   - Ожидается: Управление состоянием формы, валидация, персистентность, обработка ошибок

3. **"Как бы вы реализовали обмен сообщениями в реальном времени между хозяевами и гостями?"**

   - Ожидается: Реализация WebSocket, персистентность сообщений, поддержка офлайн

4. **"Как вы оптимизируете страницу результатов поиска для производительности?"**

   - Ожидается: Виртуализация, отложенный поиск, кэширование, стратегии пагинации

5. **"Как бы вы реализовали компонент календаря для выбора доступности?"**

   - Ожидается: Пользовательская логика календаря, выбор диапазона дат, обработка заблокированных дат

---

### Фаза 6: Вопросы по бэкенду

_Задавайте эти вопросы для оценки экспертизы бэкенда:_

1. **"Как вы проектируете схему базы данных для обработки доступности недвижимости?"**

   - Ожидается: Дизайн таблицы календаря, стратегии индексирования, оптимизация запросов

2. **"Как бы вы реализовали ограничение скорости для API поиска?"**

   - Ожидается: Ограничение скорости на основе Redis, скользящее окно, разные лимиты для типов пользователей

3. **"Как вы обрабатываете загрузку и обработку изображений?"**

   - Ожидается: Многочастные загрузки, изменение размера изображений, конвертация форматов, интеграция CDN

4. **"Как бы вы реализовали систему уведомлений?"**

   - Ожидается: Событийно-ориентированная архитектура, очереди сообщений, множественные каналы (email, push, SMS)

5. **"Как вы обеспечиваете согласованность данных между микросервисами?"**

   - Ожидается: Паттерн Saga, event sourcing, распределенные транзакции, итоговая согласованность

---

### Фаза 7: Вопросы по системному дизайну

_Задавайте эти вопросы для оценки мышления системного дизайна:_

1. **"Как бы вы справились с внезапным всплеском трафика во время пикового сезона бронирований?"**

   - Ожидается: Автомасштабирование, стратегии кэширования, реплики базы данных для чтения, оптимизация CDN

2. **"Как вы обеспечиваете надежную работу системы в разных странах с различной скоростью интернета?"**

   - Ожидается: Региональные развертывания, прогрессивное улучшение, офлайн возможности, оптимизация изображений

3. **"Как бы вы реализовали обнаружение мошенничества для бронирований и платежей?"**

   - Ожидается: Модели машинного обучения, движки правил, поведенческий анализ, сторонние сервисы

4. **"Как вы обрабатываете соответствие GDPR и конфиденциальность данных?"**

   - Ожидается: Шифрование данных, право на забвение, управление согласием, минимизация данных

5. **"Как бы вы реализовали A/B тестирование для процесса бронирования?"**

   - Ожидается: Флаги функций, отслеживание экспериментов, статистическая значимость, постепенные развертывания

---

## Критерии оценки

### **Сильный кандидат должен:**

- ✅ Задавать уточняющие вопросы о международных требованиях
- ✅ Рассматривать локализацию и культурные различия на раннем этапе дизайна
- ✅ Проектировать для масштабируемости в нескольких регионах
- ✅ Обрабатывать сложную логику бронирования с правильным контролем параллелизма
- ✅ Учитывать соответствие платежей и проблемы нескольких валют
- ✅ Проектировать надежную функциональность поиска с геолокацией
- ✅ Рассматривать безопасность, предотвращение мошенничества и конфиденциальность данных
- ✅ Учитывать дизайн, ориентированный на мобильные устройства, и офлайн возможности
- ✅ Планировать мониторинг, логирование и наблюдаемость
- ✅ Делать технологические выборы, подходящие для глобального масштаба

### **Красные флаги:**

- ❌ Игнорирует требования интернационализации
- ❌ Не учитывает состояния гонки бронирования
- ❌ Упускает соответствие платежей и конвертацию валют
- ❌ Проектирует монолитную архитектуру для сложного домена
- ❌ Забывает о мобильных пользователях и различных условиях сети
- ❌ Не учитывает регулирования конфиденциальности данных
- ❌ Не может объяснить стратегии масштабирования для глобального развертывания
- ❌ Игнорирует производительность поиска и проблемы геолокации

---

## Управление временем

- **Требования (10 мин)**: Уточнить область, масштаб и международные требования
- **Высокоуровневый дизайн (15 мин)**: Общая архитектура и разбивка сервисов
- **Углубленное изучение (25 мин)**: Фокус на 3-4 сложных областях (бронирование, поиск, платежи, i18n)
- **Технологический стек (5 мин)**: Выбор фронтенда, бэкенда и инфраструктуры
- **Заключение (5 мин)**: Масштабирование, мониторинг и дополнительные вопросы

Всего: ~60 минут
