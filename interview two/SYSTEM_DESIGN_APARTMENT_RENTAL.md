# System Design Interview: Apartment Rental Platform (Airbnb-like)

## Initial Problem Statement (As Client)

"I want to create an apartment rental platform like Airbnb. Users should be able to list their properties, search and book accommodations, make payments, and leave reviews. The platform should support multiple languages and currencies, handle thousands of concurrent users, and provide a seamless experience across different countries and cultures."

---

## Step-by-Step Interview Process

### Phase 1: Requirements Clarification (5-10 minutes)

_As the interviewer, ask these follow-up questions when the candidate asks for clarification:_

#### **Functional Requirements:**

- **User Management**: Hosts and guests can register, login, manage profiles with identity verification
- **Property Management**: Hosts can list properties with photos, descriptions, pricing, availability calendar
- **Search & Discovery**: Guests can search by location, dates, price, amenities with filters and maps
- **Booking System**: Real-time availability, instant booking, request-to-book workflows
- **Payment Processing**: Multiple payment methods, currency conversion, escrow system
- **Review & Rating**: Bidirectional reviews between hosts and guests
- **Messaging System**: In-app communication between hosts and guests
- **Internationalization**: Multi-language support, local currencies, cultural adaptations
- **Mobile Support**: Responsive web and native mobile apps

#### **Non-Functional Requirements:**

- **Scale**: 10 million users, 1 million properties, 100k concurrent users, 10k bookings/day
- **Performance**: <200ms search response, <100ms booking confirmation, <1s page load
- **Availability**: 99.95% uptime, graceful degradation during peak times
- **Consistency**: Strong consistency for bookings, eventual consistency for reviews/search
- **Security**: PCI compliance, data encryption, fraud prevention, identity verification
- **Localization**: Support for 50+ languages, 100+ currencies, regional regulations

#### **Out of Scope** (mention these to bound the problem):

- Advanced features like Airbnb Plus, Experiences, or Business Travel
- Complex pricing algorithms (dynamic pricing, smart pricing)
- Advanced fraud detection and machine learning recommendations

---

### Phase 2: High-Level System Architecture (10-15 minutes)

_Expected candidate response should include:_

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Mobile    │    │     Web     │    │     CDN     │
│    Apps     │    │   Client    │    │ (Images,    │
│(iOS/Android)│◄──►│ (React SPA) │◄──►│ Static      │
└─────────────┘    └─────────────┘    │ Assets)     │
                                      └─────────────┘
                           │                  │
                    ┌─────────────┐    ┌─────────────┐
                    │     API     │    │ Load        │
                    │   Gateway   │◄──►│ Balancer    │
                    │(Rate Limit, │    │ (Nginx)     │
                    │Auth, Route) │    └─────────────┘
                    └─────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │  Property   │    │   Booking   │
│  Service    │    │  Service    │    │   Service   │
└─────────────┘    └─────────────┘    └─────────────┘
        │                  │                  │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Payment   │    │   Search    │    │ Notification│
│  Service    │    │  Service    │    │   Service   │
└─────────────┘    └─────────────┘    └─────────────┘
        │                  │                  │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ PostgreSQL  │    │Elasticsearch│    │   Redis     │
│(Users, Book-│    │(Properties, │    │(Cache,      │
│ings, Pay-   │    │ Search      │    │ Sessions)   │
│ ments)      │    │ Index)      │    └─────────────┘
└─────────────┘    └─────────────┘
        │                  │
┌─────────────┐    ┌─────────────┐
│   Message   │    │   File      │
│   Queue     │    │  Storage    │
│ (RabbitMQ)  │    │  (AWS S3)   │
└─────────────┘    └─────────────┘
```

#### **Key Components:**

1. **Frontend**: React SPA with TypeScript, React Native for mobile apps
2. **API Gateway**: Kong/AWS API Gateway for routing, authentication, rate limiting
3. **Microservices**: User, Property, Booking, Payment, Search, Notification services
4. **Databases**: PostgreSQL for transactional data, Elasticsearch for search, Redis for caching
5. **File Storage**: AWS S3 for images and documents with CloudFront CDN
6. **Message Queue**: RabbitMQ/AWS SQS for async processing
7. **External APIs**: Payment processors (Stripe, PayPal), Maps (Google Maps), Translation services

---

### Phase 3: Deep Dive Questions

#### **Question 1: "How do you handle real-time availability and prevent double bookings?"**

_Expected answer should cover:_

**Database Design:**

```sql
-- Properties table
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

-- Availability calendar
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

-- Bookings table with optimistic locking
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

**Booking Logic with Concurrency Control:**

```javascript
class BookingService {
  async createBooking(bookingData) {
    const { propertyId, checkIn, checkOut, guestId, guestsCount } = bookingData;

    return await this.db.transaction(async (trx) => {
      // 1. Lock property for update
      const property = await trx("properties")
        .where("id", propertyId)
        .forUpdate()
        .first();

      if (!property) {
        throw new Error("Property not found");
      }

      // 2. Check availability for date range
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
        throw new Error("Property not available for selected dates");
      }

      // 3. Create booking
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

      // 4. Update availability calendar
      const dates = this.getDateRange(checkIn, checkOut);
      await trx("availability_calendar")
        .whereIn("date", dates)
        .where("property_id", propertyId)
        .update({ is_available: false });

      return booking[0];
    });
  }

  // Distributed locking with Redis for high-scale scenarios
  async createBookingWithDistributedLock(bookingData) {
    const lockKey = `booking_lock:${bookingData.propertyId}`;
    const lockValue = uuid();
    const lockTTL = 30000; // 30 seconds

    try {
      // Acquire distributed lock
      const acquired = await this.redis.set(
        lockKey,
        lockValue,
        "PX",
        lockTTL,
        "NX"
      );

      if (!acquired) {
        throw new Error("Property is being booked by another user");
      }

      return await this.createBooking(bookingData);
    } finally {
      // Release lock
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

#### **Question 2: "How do you implement internationalization and localization?"**

_Expected answer should cover:_

**Frontend Internationalization:**

```javascript
// i18n configuration
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: "en", // default language
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

// React component with localization
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

// Localization utilities
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

// Currency conversion hook
const useCurrencyConversion = () => {
  const [exchangeRates, setExchangeRates] = useState({});
  const [userCurrency, setUserCurrency] = useState("USD");

  useEffect(() => {
    // Fetch exchange rates from API
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

**Backend Localization Service:**

```javascript
class LocalizationService {
  constructor() {
    this.translationCache = new Map();
    this.exchangeRateCache = new Map();
  }

  // Translation management
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

  // Currency conversion
  async getExchangeRates() {
    const cached = this.exchangeRateCache.get("rates");
    if (cached && Date.now() - cached.timestamp < 3600000) {
      // 1 hour cache
      return cached.rates;
    }

    // Fetch from external API (e.g., Fixer.io, CurrencyAPI)
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

  // Content localization
  async localizeProperty(property, targetLanguage, targetCurrency) {
    const localized = { ...property };

    // Translate text content if available
    if (property.translations && property.translations[targetLanguage]) {
      localized.title =
        property.translations[targetLanguage].title || property.title;
      localized.description =
        property.translations[targetLanguage].description ||
        property.description;
    }

    // Convert currency
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

  // Regional compliance
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

#### **Question 3: "How do you implement the search functionality with filters and geo-location?"**

_Expected answer should cover:_

**Elasticsearch Index Design:**

```javascript
// Property index mapping
const propertyIndexMapping = {
  mappings: {
    properties: {
      id: { type: "keyword" },
      title: {
        type: "text",
        analyzer: "standard",
        fields: {
          keyword: { type: "keyword" },
        },
      },
      description: { type: "text", analyzer: "standard" },
      location: { type: "geo_point" },
      address: {
        properties: {
          street: { type: "text" },
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

// Search service implementation
class SearchService {
  constructor() {
    this.esClient = new Client({ node: process.env.ELASTICSEARCH_URL });
  }

  async searchProperties(searchParams) {
    const {
      query,
      location,
      radius = 10, // km
      checkIn,
      checkOut,
      guests = 1,
      minPrice,
      maxPrice,
      currency = "USD",
      propertyType,
      amenities = [],
      instantBook,
      sortBy = "relevance",
      page = 1,
      limit = 20,
    } = searchParams;

    const must = [];
    const filter = [];

    // Text search
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

    // Geo-location search
    if (location) {
      filter.push({
        geo_distance: {
          distance: `${radius}km`,
          location: {
            lat: location.lat,
            lon: location.lon,
          },
        },
      });
    }

    // Guest capacity
    filter.push({
      range: {
        maxGuests: { gte: guests },
      },
    });

    // Price range (with currency conversion)
    if (minPrice || maxPrice) {
      const priceFilter = { range: { pricePerNight: {} } };
      if (minPrice) priceFilter.range.pricePerNight.gte = minPrice;
      if (maxPrice) priceFilter.range.pricePerNight.lte = maxPrice;
      filter.push(priceFilter);
    }

    // Property type
    if (propertyType) {
      filter.push({ term: { propertyType } });
    }

    // Amenities
    if (amenities.length > 0) {
      filter.push({
        terms: { amenities },
      });
    }

    // Instant book
    if (instantBook) {
      filter.push({ term: { instantBook: true } });
    }

    // Availability check
    if (checkIn && checkOut) {
      filter.push({
        range: {
          "availability.start": { lte: checkIn },
          "availability.end": { gte: checkOut },
        },
      });
    }

    // Sorting
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
                unit: "km",
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
                { to: 50 },
                { from: 50, to: 100 },
                { from: 100, to: 200 },
                { from: 200 },
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
        distance: hit.sort?.[0], // if sorted by distance
      })),
      total: response.body.hits.total.value,
      aggregations: response.body.aggregations,
      page,
      limit,
    };
  }

  // Auto-complete suggestions
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

#### **Question 4: "How do you handle payments with multiple currencies and compliance?"**

_Expected answer should cover:_

**Payment Service Architecture:**

```javascript
class PaymentService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.paypal = new PayPal({
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      environment: process.env.NODE_ENV === "production" ? "live" : "sandbox",
    });
  }

  async createBookingPayment(bookingId, paymentData) {
    const booking = await this.getBooking(bookingId);
    const { amount, currency, paymentMethod, guestId } = paymentData;

    // Calculate fees and taxes
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

        case "paypal":
          paymentResult = await this.processPayPalPayment({
            amount: totalAmount,
            currency,
            bookingId,
          });
          break;

        default:
          throw new Error("Unsupported payment method");
      }

      // Create payment record
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

      // Update booking status
      await this.updateBookingStatus(bookingId, "confirmed");

      // Schedule host payout (after check-in or 24 hours)
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
    // Convert amount to smallest currency unit
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      customer: customerId,
      payment_method: paymentMethodId,
      confirmation_method: "manual",
      confirm: true,
      metadata,
      // Hold funds for marketplace
      transfer_data: {
        destination: metadata.hostId, // Host's Stripe Connect account
      },
      application_fee_amount: Math.round(amount * 0.03 * 100), // 3% platform fee
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

    // Service fee (percentage-based with minimum)
    const serviceFeeRate = 0.03; // 3%
    const minServiceFee = this.getMinServiceFee(currency);
    const serviceFee = Math.max(totalPrice * serviceFeeRate, minServiceFee);

    // Taxes (varies by location)
    const taxRate = await this.getTaxRate(hostCountry, guestCountry);
    const taxes = totalPrice * taxRate;

    // Payment processing fee
    const processingFee = this.getProcessingFee(currency);

    return {
      serviceFee,
      taxes,
      processingFee,
      total: serviceFee + taxes + processingFee,
    };
  }

  // Compliance and regulatory handling
  async validatePaymentCompliance(paymentData) {
    const { amount, currency, guestCountry, hostCountry } = paymentData;

    // AML (Anti-Money Laundering) checks
    if (amount > this.getAMLThreshold(currency)) {
      await this.performAMLCheck(paymentData);
    }

    // Sanctions screening
    await this.screenForSanctions(paymentData.guestId);

    // Regional compliance
    const compliance = await this.getRegionalCompliance(
      guestCountry,
      hostCountry
    );

    if (compliance.requiresAdditionalVerification) {
      throw new Error("Additional verification required");
    }

    return true;
  }

  // Multi-currency support
  async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;

    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  // Payout to hosts
  async scheduleHostPayout(booking, payment) {
    const payoutDate = new Date(booking.checkIn);
    payoutDate.setDate(payoutDate.getDate() + 1); // 24 hours after check-in

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

#### **Question 5: "How do you implement the review and rating system?"**

_Expected answer should cover:_

**Review System Design:**

```javascript
// Database schema for reviews
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

// Review service implementation
class ReviewService {
  async createReview(reviewData) {
    const { bookingId, reviewerId, reviewerType, ratings, comment } = reviewData;

    // Validate booking eligibility
    const booking = await this.validateReviewEligibility(bookingId, reviewerId, reviewerType);

    // Check if review already exists
    const existingReview = await this.db.query(`
      SELECT id FROM reviews
      WHERE booking_id = $1 AND reviewer_type = $2
    `, [bookingId, reviewerType]);

    if (existingReview.length > 0) {
      throw new Error('Review already exists for this booking');
    }

    // Create review
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

    // Update aggregate ratings
    await this.updateAggregateRatings(
      reviewerType === 'guest' ? booking.propertyId : booking.hostId,
      reviewerType === 'guest' ? 'property' : 'host'
    );

    // Send notification
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
      throw new Error('Booking not eligible for review');
    }

    const bookingData = booking[0];

    // Verify reviewer is part of the booking
    if (reviewerType === 'guest' && bookingData.guestId !== reviewerId) {
      throw new Error('Unauthorized to review this booking');
    }

    if (reviewerType === 'host' && bookingData.hostId !== reviewerId) {
      throw new Error('Unauthorized to review this booking');
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

      // Update search index
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

  // Review moderation
  async moderateReview(reviewId, action, moderatorId) {
    const review = await this.db.query(`
      SELECT * FROM reviews WHERE id = $1
    `, [reviewId]);

    if (!review.length) {
      throw new Error('Review not found');
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

    // Log moderation action
    await this.db.query(`
      INSERT INTO review_moderation_log (
        review_id, moderator_id, action, created_at
      ) VALUES ($1, $2, $3, NOW())
    `, [reviewId, moderatorId, action]);
  }

  // Sentiment analysis and spam detection
  async analyzeReviewContent(comment) {
    // Use external service like AWS Comprehend or Google Cloud Natural Language
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

### Phase 4: Technology Stack Discussion

#### **Frontend Stack:**

```yaml
Framework: React 18 with TypeScript
State Management: Redux Toolkit + RTK Query
Styling: Tailwind CSS + Styled Components
Maps: Google Maps API / Mapbox
Internationalization: react-i18next
Date Handling: date-fns with locale support
Form Handling: React Hook Form + Yup validation
Testing: Jest + React Testing Library + Cypress
Build Tool: Vite
Mobile: React Native with shared business logic
```

#### **Backend Stack:**

```yaml
Runtime: Node.js + Express.js / Fastify
Language: TypeScript
Database: PostgreSQL (primary) + Redis (cache/sessions)
Search: Elasticsearch
Authentication: JWT + OAuth2 (Google, Facebook, Apple)
File Storage: AWS S3 + CloudFront CDN
Payment: Stripe Connect + PayPal
Message Queue: RabbitMQ / AWS SQS
Email: SendGrid / AWS SES
SMS: Twilio
Monitoring: DataDog + Winston logging
API Documentation: OpenAPI/Swagger
```

#### **Infrastructure:**

```yaml
Cloud Provider: AWS / Google Cloud
Load Balancer: AWS ALB / Google Cloud Load Balancer
Database: AWS RDS PostgreSQL + Read Replicas
Cache: AWS ElastiCache Redis
Search: AWS Elasticsearch Service
CDN: AWS CloudFront / Google Cloud CDN
Container Orchestration: EKS / GKE
CI/CD: GitHub Actions + AWS CodePipeline
Monitoring: DataDog + AWS CloudWatch
Security: AWS WAF + GuardDuty
```

---

### Phase 5: Frontend-Specific Questions

_Ask these to evaluate frontend expertise:_

1. **"How would you implement the property image gallery with lazy loading and optimization?"**

   - Expected: Intersection Observer API, responsive images, WebP format, progressive loading

2. **"How do you handle form state for the multi-step booking process?"**

   - Expected: Form state management, validation, persistence, error handling

3. **"How would you implement real-time messaging between hosts and guests?"**

   - Expected: WebSocket implementation, message persistence, offline support

4. **"How do you optimize the search results page for performance?"**

   - Expected: Virtualization, debounced search, caching, pagination strategies

5. **"How would you implement the calendar component for availability selection?"**

   - Expected: Custom calendar logic, date range selection, blocked dates handling

---

### Phase 6: Backend-Specific Questions

_Ask these to evaluate backend expertise:_

1. **"How do you design the database schema for handling property availability?"**

   - Expected: Calendar table design, indexing strategies, query optimization

2. **"How would you implement rate limiting for the search API?"**

   - Expected: Redis-based rate limiting, sliding window, different limits per user type

3. **"How do you handle image uploads and processing?"**

   - Expected: Multipart uploads, image resizing, format conversion, CDN integration

4. **"How would you implement the notification system?"**

   - Expected: Event-driven architecture, message queues, multiple channels (email, push, SMS)

5. **"How do you ensure data consistency across microservices?"**

   - Expected: Saga pattern, event sourcing, distributed transactions, eventual consistency

---

### Phase 7: System Design Specific Questions

_Ask these to evaluate system design thinking:_

1. **"How would you handle a sudden spike in traffic during peak booking season?"**

   - Expected: Auto-scaling, caching strategies, database read replicas, CDN optimization

2. **"How do you ensure the system works reliably across different countries with varying internet speeds?"**

   - Expected: Regional deployments, progressive enhancement, offline capabilities, image optimization

3. **"How would you implement fraud detection for bookings and payments?"**

   - Expected: Machine learning models, rule engines, behavioral analysis, third-party services

4. **"How do you handle GDPR compliance and data privacy?"**

   - Expected: Data encryption, right to be forgotten, consent management, data minimization

5. **"How would you implement A/B testing for the booking flow?"**

   - Expected: Feature flags, experiment tracking, statistical significance, gradual rollouts

---

## Evaluation Criteria

### **Strong Candidate Should:**

- ✅ Ask clarifying questions about international requirements
- ✅ Consider localization and cultural differences early in design
- ✅ Design for scalability across multiple regions
- ✅ Handle complex booking logic with proper concurrency control
- ✅ Consider payment compliance and multi-currency challenges
- ✅ Design robust search functionality with geo-location
- ✅ Address security, fraud prevention, and data privacy
- ✅ Consider mobile-first design and offline capabilities
- ✅ Plan for monitoring, logging, and observability
- ✅ Make technology choices suitable for global scale

### **Red Flags:**

- ❌ Ignores internationalization requirements
- ❌ Doesn't consider booking race conditions
- ❌ Overlooks payment compliance and currency conversion
- ❌ Designs monolithic architecture for complex domain
- ❌ Forgets about mobile users and varying network conditions
- ❌ Doesn't consider data privacy regulations
- ❌ Can't explain scaling strategies for global deployment
- ❌ Ignores search performance and geo-location challenges

---

## Time Management

- **Requirements (10 min)**: Clarify scope, scale, and international requirements
- **High-level design (15 min)**: Overall architecture and service breakdown
- **Deep dives (25 min)**: Focus on 3-4 complex areas (booking, search, payments, i18n)
- **Technology stack (5 min)**: Frontend, backend, and infrastructure choices
- **Wrap-up (5 min)**: Scaling, monitoring, and follow-up questions

Total: ~60 minutes
