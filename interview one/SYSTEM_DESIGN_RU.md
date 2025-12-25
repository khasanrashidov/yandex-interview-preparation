# Интервью по системному дизайну: Онлайн-платформа для аукционов

## Первоначальная постановка задачи (Как клиент)

"Я хочу создать онлайн-платформу для аукционов, как eBay. Пользователи должны иметь возможность выставлять товары на продажу, делать ставки на них, и участник с самой высокой ставкой выигрывает, когда аукцион заканчивается. Система должна обрабатывать тысячи пользователей, делающих ставки одновременно, и предоставлять обновления в реальном времени."

---

## Пошаговый процесс интервью

### Фаза 1: Уточнение требований (5-10 минут)

_Как интервьюер, задавайте эти уточняющие вопросы, когда кандидат просит разъяснения:_

#### **Функциональные требования:**

- Пользователи могут регистрироваться, входить в систему и управлять профилями
- Продавцы могут выставлять товары с фотографиями, описаниями, начальной ценой и продолжительностью
- Покупатели могут искать, просматривать и делать ставки на товары
- Торги в реальном времени с автоматическими обновлениями
- Аукцион завершается автоматически по истечении указанного времени
- Обработка платежей для победителей
- Система уведомлений (email, push-уведомления)
- Система рейтингов/отзывов для покупателей и продавцов

#### **Нефункциональные требования:**

- **Масштаб**: 1 миллион зарегистрированных пользователей, 10 тысяч одновременных пользователей, 100 тысяч активных аукционов
- **Производительность**: <100мс время отклика для ставок, обновления в реальном времени <1 секунды
- **Доступность**: 99.9% времени безотказной работы
- **Согласованность**: Строгая согласованность для данных ставок
- **Безопасность**: Безопасные платежи, предотвращение мошенничества

#### **Вне области рассмотрения** (упомяните это, чтобы ограничить проблему):

- Сложные типы аукционов (голландские аукционы, закрытые ставки)
- Международные платежи/валюты
- Разработка мобильного приложения (фокус на веб-платформе)

---

### Фаза 2: Высокоуровневая архитектура системы (10-15 минут)

_Ожидаемый ответ кандидата должен включать:_

```
┌─────────────┐    ┌─────────────┐    ┌──────────────┐
│   Клиент    │    │     CDN     │    │ Балансировщик│
│ (React App) │◄──►│             │◄──►│ нагрузки     │
└─────────────┘    └─────────────┘    └──────────────┘
                                              │
                          ┌───────────────────┼───────────────────┐
                          │                   │                   │
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │   Сервис    │    │   Сервис    │    │   Сервис    │
                   │ аутентиф.   │    │ аукционов   │    │ уведомлений │
                   └─────────────┘    └─────────────┘    └─────────────┘
                          │                   │                   │
                   ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
                   │   БД         │    │ БД          │    │ Очередь     │
                   │ пользователей│    │ аукционов   │    │ сообщений   │
                   │ (PostgreSQL) │    │(PostgreSQL) │    │ (Redis)     │
                   └──────────────┘    └─────────────┘    └─────────────┘
                               ┌─────────────┐
                               │    Кэш      │
                               │  (Redis)    │
                               └─────────────┘
```

#### **Ключевые компоненты:**

1. **Фронтенд**: React/Vue.js SPA с WebSocket соединениями в реальном времени
2. **Балансировщик нагрузки**: Nginx или облачный LB для распределения трафика
3. **API Gateway**: Маршрутизация запросов, аутентификация, ограничение скорости
4. **Микросервисы**: Сервисы аутентификации, аукционов, пользователей, платежей, уведомлений
5. **Базы данных**: PostgreSQL для ACID транзакций, Redis для кэширования
6. **Очередь сообщений**: Redis/RabbitMQ для асинхронной обработки
7. **CDN**: Доставка статических ресурсов (изображения, CSS, JS)
8. **Реальное время**: WebSocket сервер для обновлений торгов в реальном времени

---

### Фаза 3: Углубленные вопросы

#### **Вопрос 1: "Как вы обрабатываете обновления торгов в реальном времени?"**

_Ожидаемый ответ должен охватывать:_

**Решение для фронтенда:**

```javascript
// Управление WebSocket соединением
class AuctionWebSocket {
  constructor(auctionId) {
    this.auctionId = auctionId;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    this.ws = new WebSocket(
      `wss://api.auction.com/auctions/${this.auctionId}/live`
    );

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleBidUpdate(data);
    };

    this.ws.onclose = () => {
      this.handleReconnection();
    };
  }

  handleBidUpdate(data) {
    // Обновить UI с новой максимальной ставкой
    store.dispatch(updateCurrentBid(data));

    // Показать уведомление, если перебили
    if (data.previousBidder === currentUserId) {
      showNotification("Вас перебили!");
    }
  }

  placeBid(amount) {
    const bidData = {
      type: "PLACE_BID",
      auctionId: this.auctionId,
      amount: amount,
      userId: getCurrentUserId(),
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(bidData));
  }
}
```

**Решение для бэкенда:**

```javascript
// Node.js WebSocket сервер
const WebSocket = require("ws");
const Redis = require("redis");

class AuctionWebSocketServer {
  constructor() {
    this.wss = new WebSocket.Server({ port: 8080 });
    this.redis = Redis.createClient();
    this.auctionRooms = new Map(); // auctionId -> Set of websockets
  }

  handleConnection(ws, auctionId) {
    // Добавить в комнату аукциона
    if (!this.auctionRooms.has(auctionId)) {
      this.auctionRooms.set(auctionId, new Set());
    }
    this.auctionRooms.get(auctionId).add(ws);

    ws.on("message", async (message) => {
      const data = JSON.parse(message);

      if (data.type === "PLACE_BID") {
        await this.processBid(auctionId, data);
      }
    });
  }

  async processBid(auctionId, bidData) {
    // Валидировать ставку в базе данных с оптимистичной блокировкой
    const result = await this.validateAndSaveBid(auctionId, bidData);

    if (result.success) {
      // Транслировать всем клиентам в этом аукционе
      this.broadcastToAuction(auctionId, {
        type: "BID_UPDATE",
        currentBid: result.newBid,
        bidder: result.bidderName,
        timestamp: result.timestamp,
      });
    } else {
      // Отправить ошибку только участнику торгов
      ws.send(
        JSON.stringify({
          type: "BID_ERROR",
          message: result.error,
        })
      );
    }
  }
}
```

---

#### **Вопрос 2: "Как вы предотвращаете состояния гонки в торгах?"**

_Ожидаемый ответ:_

**Уровень базы данных:**

```sql
-- Использовать оптимистичную блокировку с контролем версий
UPDATE auctions
SET
  current_bid = $1,
  current_bidder = $2,
  bid_count = bid_count + 1,
  version = version + 1,
  updated_at = NOW()
WHERE
  id = $3
  AND version = $4  -- Проверить, что версия не изменилась
  AND current_bid < $1  -- Убедиться, что ставка выше
  AND status = 'ACTIVE'
  AND end_time > NOW();
```

**Уровень приложения:**

```javascript
async function placeBid(auctionId, userId, bidAmount) {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Получить текущее состояние аукциона
      const auction = await db.query("SELECT * FROM auctions WHERE id = $1", [
        auctionId,
      ]);

      // Валидировать ставку
      if (bidAmount <= auction.current_bid) {
        throw new Error("Ставка слишком низкая");
      }

      // Попытка обновления с оптимистичной блокировкой
      const result = await db.query(
        `
        UPDATE auctions 
        SET current_bid = $1, current_bidder = $2, version = version + 1
        WHERE id = $3 AND version = $4
        RETURNING *
      `,
        [bidAmount, userId, auctionId, auction.version]
      );

      if (result.rowCount === 0) {
        // Конфликт версий, повторить попытку
        await sleep(Math.random() * 100); // Случайная задержка
        continue;
      }

      return { success: true, auction: result.rows[0] };
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
    }
  }
}
```

---

#### **Вопрос 3: "Как вы обрабатываете завершение аукциона и выбор победителя?"**

_Ожидаемый ответ:_

**Система запланированных задач:**

```javascript
// Сервис планировщика аукционов
class AuctionScheduler {
  constructor() {
    this.redis = Redis.createClient();
    this.db = new DatabaseClient();
  }

  async scheduleAuctionEnd(auctionId, endTime) {
    // Использовать Redis для точного времени
    const delay = endTime.getTime() - Date.now();

    await this.redis.zadd("auction_endings", endTime.getTime(), auctionId);

    // Также настроить резервную cron задачу
    setTimeout(() => this.processAuctionEnd(auctionId), delay);
  }

  async processAuctionEnd(auctionId) {
    const transaction = await this.db.beginTransaction();

    try {
      // Заблокировать запись аукциона
      const auction = await transaction.query(
        `
        SELECT * FROM auctions 
        WHERE id = $1 AND status = 'ACTIVE'
        FOR UPDATE
      `,
        [auctionId]
      );

      if (!auction) return; // Уже обработан

      // Обновить статус аукциона
      await transaction.query(
        `
        UPDATE auctions 
        SET status = 'ENDED', ended_at = NOW()
        WHERE id = $1
      `,
        [auctionId]
      );

      // Создать запись победителя, если были ставки
      if (auction.current_bidder) {
        await transaction.query(
          `
          INSERT INTO auction_winners 
          (auction_id, winner_id, winning_bid, created_at)
          VALUES ($1, $2, $3, NOW())
        `,
          [auctionId, auction.current_bidder, auction.current_bid]
        );

        // Запустить обработку платежа
        await this.initiatePayment(auction);
      }

      await transaction.commit();

      // Отправить уведомления
      await this.sendEndNotifications(auction);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

---

#### **Вопрос 4: "Как вы масштабируете систему для высокого трафика?"**

_Ожидаемые стратегии масштабирования:_

**1. Масштабирование базы данных:**

```yaml
# Настройка Master-Slave
Архитектура базы данных:
  Master: Операции записи (ставки, новые аукционы)
  Read Replicas: Поиск, просмотр, профили пользователей

Стратегия шардинга:
  - Горизонтальное разделение по auction_id
  - Каждый шард обрабатывает определенные диапазоны аукционов
  - Использовать консистентное хеширование для распределения
```

**2. Стратегия кэширования:**

```javascript
// Многоуровневое кэширование
class AuctionCacheService {
  constructor() {
    this.redis = Redis.createClient();
    this.localCache = new LRU({ max: 1000, ttl: 1000 * 30 }); // 30с локальный кэш
  }

  async getAuction(auctionId) {
    // Уровень 1: Локальный кэш (самый быстрый)
    let auction = this.localCache.get(auctionId);
    if (auction) return auction;

    // Уровень 2: Redis кэш
    auction = await this.redis.hgetall(`auction:${auctionId}`);
    if (auction) {
      this.localCache.set(auctionId, auction);
      return auction;
    }

    // Уровень 3: База данных
    auction = await db.getAuction(auctionId);
    if (auction) {
      await this.redis.hset(`auction:${auctionId}`, auction);
      this.localCache.set(auctionId, auction);
    }

    return auction;
  }
}
```

**3. CDN и оптимизация ресурсов:**

```javascript
// Пайплайн оптимизации изображений
const imageOptimization = {
  upload: async (file) => {
    // Изменить размер в несколько форматов
    const sizes = [150, 300, 600, 1200];
    const formats = ["webp", "jpg"];

    const optimizedImages = await Promise.all(
      sizes.flatMap((size) =>
        formats.map((format) =>
          sharp(file).resize(size, size).format(format).quality(85).toBuffer()
        )
      )
    );

    // Загрузить в CDN
    return await cdn.uploadMultiple(optimizedImages);
  },
};
```

---

#### **Вопрос 5: "Как вы обрабатываете платежи и предотвращение мошенничества?"**

_Ожидаемый ответ:_

**Интеграция платежей:**

```javascript
class PaymentService {
  async processAuctionPayment(auctionId, winnerId) {
    const auction = await db.getAuction(auctionId);
    const winner = await db.getUser(winnerId);

    // Создать намерение платежа со Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: auction.current_bid * 100, // Конвертировать в копейки
      currency: "usd",
      customer: winner.stripe_customer_id,
      metadata: {
        auction_id: auctionId,
        seller_id: auction.seller_id,
      },
    });

    // Удержать платеж (авторизовать, но не списывать)
    await stripe.paymentIntents.confirm(paymentIntent.id);

    // Списать после подтверждения отправки продавцом
    return paymentIntent;
  }

  async releasePaymentToSeller(auctionId, trackingNumber) {
    // Списать удержанный платеж
    // Взять комиссию платформы
    // Перевести продавцу
  }
}
```

**Предотвращение мошенничества:**

```javascript
class FraudDetectionService {
  async validateBid(bidData) {
    const checks = await Promise.all([
      this.checkBidIncrement(bidData),
      this.checkUserHistory(bidData.userId),
      this.checkBiddingPattern(bidData),
      this.checkAccountAge(bidData.userId),
      this.checkPaymentMethodValidity(bidData.userId),
    ]);

    const riskScore = this.calculateRiskScore(checks);

    if (riskScore > 0.8) {
      return { allowed: false, reason: "Высокий риск мошенничества" };
    }

    return { allowed: true, riskScore };
  }
}
```

---

### Фаза 4: Обсуждение технологического стека

#### **Стек фронтенда:**

```yaml
Фреймворк: React 18 с TypeScript
Управление состоянием: Redux Toolkit + RTK Query
Стилизация: Tailwind CSS + styled-components
Реальное время: Socket.io-client
Инструмент сборки: Vite
Тестирование: Jest + React Testing Library
```

#### **Стек бэкенда:**

```yaml
Среда выполнения: Node.js + Express.js
База данных: PostgreSQL (основная) + Redis (кэш/сессии)
Аутентификация: JWT + OAuth2
Хранение файлов: AWS S3 + CloudFront CDN
Очередь сообщений: Redis Bull queues
Мониторинг: DataDog + Winston logging
Развертывание: Docker + Kubernetes
```

#### **Инфраструктура:**

```yaml
Облачный провайдер: AWS
Балансировщик нагрузки: AWS ALB
База данных: AWS RDS PostgreSQL
Кэш: AWS ElastiCache Redis
CDN: AWS CloudFront
Оркестрация контейнеров: EKS
CI/CD: GitHub Actions + AWS CodePipeline
```

---

### Фаза 5: Дополнительные вопросы

_Задавайте эти вопросы на основе ответов кандидата:_

1. **"Что происходит, если WebSocket соединение обрывается во время критической ставки?"**

   - Ожидается: Обсуждение стратегий переподключения, очереди сообщений, резервный HTTP polling

2. **"Как бы вы реализовали правила приращения ставок (минимальное увеличение ставок)?"**

   - Ожидается: Валидация бизнес-логики, настраиваемые правила для каждого типа аукциона

3. **"Как вы обрабатываете различия часовых поясов для завершения аукционов?"**

   - Ожидается: Хранение в UTC, конвертация на стороне клиента, четкое отображение часового пояса

4. **"А как насчет адаптивности для мобильных устройств и офлайн функциональности?"**

   - Ожидается: Progressive Web App, service workers, очередь офлайн ставок

5. **"Как бы вы реализовали категории аукционов и поиск?"**

   - Ожидается: Интеграция с Elasticsearch, фасетный поиск, автоподсказки

6. **"Какие метрики вы бы отслеживали для мониторинга здоровья системы?"**
   - Ожидается: Время отклика, процент успешных ставок, стабильность WebSocket соединений, коэффициенты конверсии

---

## Критерии оценки

### **Сильный кандидат должен:**

- ✅ Задавать уточняющие вопросы о требованиях
- ✅ Начинать с высокоуровневой архитектуры перед погружением в детали
- ✅ Учитывать масштабируемость и производительность
- ✅ Продуманно обрабатывать требования реального времени
- ✅ Рассматривать согласованность данных и состояния гонки
- ✅ Учитывать безопасность и предотвращение мошенничества
- ✅ Обсуждать мониторинг и наблюдаемость
- ✅ Делать разумный выбор технологий с обоснованием

### **Красные флаги:**

- ❌ Переходит к реализации без понимания требований
- ❌ Игнорирует вопросы масштабируемости
- ❌ Не учитывает состояния гонки в торгах
- ❌ Упускает из виду проблемы обновлений в реальном времени
- ❌ Забывает о крайних случаях (сбои сети, злонамеренные пользователи)
- ❌ Не может объяснить выбор технологий
- ❌ Не рассматривает мониторинг или отладку

---

## Управление временем

- **Требования (5-10 мин)**: Уточнить область и ограничения
- **Высокоуровневый дизайн (10-15 мин)**: Общая архитектура
- **Углубленное изучение (20-25 мин)**: Фокус на 2-3 сложных областях
- **Заключение (5 мин)**: Обсуждение масштабирования и мониторинга

Всего: ~45-55 минут
