# System Design Interview: Online Auction Platform

## Initial Problem Statement (As Client)

"I want to create an online auction platform like eBay. Users should be able to list items, bid on them, and the highest bidder wins when the auction ends. The system should handle thousands of users bidding simultaneously and provide real-time updates."

---

## Step-by-Step Interview Process

### Phase 1: Requirements Clarification (5-10 minutes)

_As the interviewer, ask these follow-up questions when the candidate asks for clarification:_

#### **Functional Requirements:**

- Users can register, login, and manage profiles
- Sellers can list items with photos, descriptions, starting price, and duration
- Buyers can search, browse, and bid on items
- Real-time bidding with automatic updates
- Auction ends automatically after specified time
- Payment processing for winners
- Notification system (email, push notifications)
- Rating/review system for buyers and sellers

#### **Non-Functional Requirements:**

- **Scale**: 1 million registered users, 10k concurrent users, 100k active auctions
- **Performance**: <100ms response time for bids, real-time updates <1 second
- **Availability**: 99.9% uptime
- **Consistency**: Strong consistency for bid data
- **Security**: Secure payments, fraud prevention

#### **Out of Scope** (mention these to bound the problem):

- Complex auction types (Dutch auctions, sealed bids)
- International payments/currencies
- Mobile app development (focus on web platform)

---

### Phase 2: High-Level System Architecture (10-15 minutes)

_Expected candidate response should include:_

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │     CDN     │    │ Load        │
│ (React App) │◄──►│             │◄──►│ Balancer    │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                          ┌───────────────────┼───────────────────┐
                          │                   │                   │
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │   Auth      │    │   Auction   │    │ Notification│
                   │   Service   │    │   Service   │    │   Service   │
                   └─────────────┘    └─────────────┘    └─────────────┘
                          │                   │                   │
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │   User DB   │    │ Auction DB  │    │ Message     │
                   │ (PostgreSQL)│    │(PostgreSQL) │    │ Queue       │
                   └─────────────┘    └─────────────┘    │ (Redis)     │
                                                         └─────────────┘
                               ┌─────────────┐
                               │   Cache     │
                               │  (Redis)    │
                               └─────────────┘
```

#### **Key Components:**

1. **Frontend**: React/Vue.js SPA with real-time WebSocket connections
2. **Load Balancer**: Nginx or cloud LB for traffic distribution
3. **API Gateway**: Request routing, authentication, rate limiting
4. **Microservices**: Auth, Auction, User, Payment, Notification services
5. **Databases**: PostgreSQL for ACID transactions, Redis for caching
6. **Message Queue**: Redis/RabbitMQ for async processing
7. **CDN**: Static asset delivery (images, CSS, JS)
8. **Real-time**: WebSocket server for live bidding updates

---

### Phase 3: Deep Dive Questions

#### **Question 1: "How do you handle real-time bidding updates?"**

_Expected answer should cover:_

**Frontend Solution:**

```javascript
// WebSocket connection management
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
    // Update UI with new highest bid
    store.dispatch(updateCurrentBid(data));

    // Show notification if outbid
    if (data.previousBidder === currentUserId) {
      showNotification("You have been outbid!");
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

**Backend Solution:**

```javascript
// Node.js WebSocket server
const WebSocket = require("ws");
const Redis = require("redis");

class AuctionWebSocketServer {
  constructor() {
    this.wss = new WebSocket.Server({ port: 8080 });
    this.redis = Redis.createClient();
    this.auctionRooms = new Map(); // auctionId -> Set of websockets
  }

  handleConnection(ws, auctionId) {
    // Add to auction room
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
    // Validate bid in database with optimistic locking
    const result = await this.validateAndSaveBid(auctionId, bidData);

    if (result.success) {
      // Broadcast to all clients in this auction
      this.broadcastToAuction(auctionId, {
        type: "BID_UPDATE",
        currentBid: result.newBid,
        bidder: result.bidderName,
        timestamp: result.timestamp,
      });
    } else {
      // Send error only to bidder
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

#### **Question 2: "How do you prevent race conditions in bidding?"**

_Expected answer:_

**Database Level:**

```sql
-- Use optimistic locking with version control
UPDATE auctions
SET
  current_bid = $1,
  current_bidder = $2,
  bid_count = bid_count + 1,
  version = version + 1,
  updated_at = NOW()
WHERE
  id = $3
  AND version = $4  -- Check version hasn't changed
  AND current_bid < $1  -- Ensure bid is higher
  AND status = 'ACTIVE'
  AND end_time > NOW();
```

**Application Level:**

```javascript
async function placeBid(auctionId, userId, bidAmount) {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Get current auction state
      const auction = await db.query("SELECT * FROM auctions WHERE id = $1", [
        auctionId,
      ]);

      // Validate bid
      if (bidAmount <= auction.current_bid) {
        throw new Error("Bid too low");
      }

      // Attempt update with optimistic locking
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
        // Version conflict, retry
        await sleep(Math.random() * 100); // Random backoff
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

#### **Question 3: "How do you handle auction ending and winner selection?"**

_Expected answer:_

**Scheduled Job System:**

```javascript
// Auction scheduler service
class AuctionScheduler {
  constructor() {
    this.redis = Redis.createClient();
    this.db = new DatabaseClient();
  }

  async scheduleAuctionEnd(auctionId, endTime) {
    // Use Redis for precise timing
    const delay = endTime.getTime() - Date.now();

    await this.redis.zadd("auction_endings", endTime.getTime(), auctionId);

    // Also set up backup cron job
    setTimeout(() => this.processAuctionEnd(auctionId), delay);
  }

  async processAuctionEnd(auctionId) {
    const transaction = await this.db.beginTransaction();

    try {
      // Lock auction record
      const auction = await transaction.query(
        `
        SELECT * FROM auctions 
        WHERE id = $1 AND status = 'ACTIVE'
        FOR UPDATE
      `,
        [auctionId]
      );

      if (!auction) return; // Already processed

      // Update auction status
      await transaction.query(
        `
        UPDATE auctions 
        SET status = 'ENDED', ended_at = NOW()
        WHERE id = $1
      `,
        [auctionId]
      );

      // Create winner record if there were bids
      if (auction.current_bidder) {
        await transaction.query(
          `
          INSERT INTO auction_winners 
          (auction_id, winner_id, winning_bid, created_at)
          VALUES ($1, $2, $3, NOW())
        `,
          [auctionId, auction.current_bidder, auction.current_bid]
        );

        // Trigger payment processing
        await this.initiatePayment(auction);
      }

      await transaction.commit();

      // Send notifications
      await this.sendEndNotifications(auction);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

---

#### **Question 4: "How do you scale the system for high traffic?"**

_Expected scaling strategies:_

**1. Database Scaling:**

```yaml
# Master-Slave setup
Database Architecture:
  Master: Write operations (bids, new auctions)
  Read Replicas: Search, browse, user profiles

Sharding Strategy:
  - Horizontal partitioning by auction_id
  - Each shard handles specific auction ranges
  - Use consistent hashing for distribution
```

**2. Caching Strategy:**

```javascript
// Multi-level caching
class AuctionCacheService {
  constructor() {
    this.redis = Redis.createClient();
    this.localCache = new LRU({ max: 1000, ttl: 1000 * 30 }); // 30s local cache
  }

  async getAuction(auctionId) {
    // Level 1: Local cache (fastest)
    let auction = this.localCache.get(auctionId);
    if (auction) return auction;

    // Level 2: Redis cache
    auction = await this.redis.hgetall(`auction:${auctionId}`);
    if (auction) {
      this.localCache.set(auctionId, auction);
      return auction;
    }

    // Level 3: Database
    auction = await db.getAuction(auctionId);
    if (auction) {
      await this.redis.hset(`auction:${auctionId}`, auction);
      this.localCache.set(auctionId, auction);
    }

    return auction;
  }
}
```

**3. CDN and Asset Optimization:**

```javascript
// Image optimization pipeline
const imageOptimization = {
  upload: async (file) => {
    // Resize to multiple formats
    const sizes = [150, 300, 600, 1200];
    const formats = ["webp", "jpg"];

    const optimizedImages = await Promise.all(
      sizes.flatMap((size) =>
        formats.map((format) =>
          sharp(file).resize(size, size).format(format).quality(85).toBuffer()
        )
      )
    );

    // Upload to CDN
    return await cdn.uploadMultiple(optimizedImages);
  },
};
```

---

#### **Question 5: "How do you handle payments and fraud prevention?"**

_Expected answer:_

**Payment Integration:**

```javascript
class PaymentService {
  async processAuctionPayment(auctionId, winnerId) {
    const auction = await db.getAuction(auctionId);
    const winner = await db.getUser(winnerId);

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: auction.current_bid * 100, // Convert to cents
      currency: "usd",
      customer: winner.stripe_customer_id,
      metadata: {
        auction_id: auctionId,
        seller_id: auction.seller_id,
      },
    });

    // Hold payment (authorize but don't capture)
    await stripe.paymentIntents.confirm(paymentIntent.id);

    // Capture after seller confirms shipment
    return paymentIntent;
  }

  async releasePaymentToSeller(auctionId, trackingNumber) {
    // Capture the held payment
    // Take platform fee
    // Transfer to seller
  }
}
```

**Fraud Prevention:**

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
      return { allowed: false, reason: "High fraud risk" };
    }

    return { allowed: true, riskScore };
  }
}
```

---

### Phase 4: Technology Stack Discussion

#### **Frontend Stack:**

```yaml
Framework: React 18 with TypeScript
State Management: Redux Toolkit + RTK Query
Styling: Tailwind CSS + styled-components
Real-time: Socket.io-client
Build Tool: Vite
Testing: Jest + React Testing Library
```

#### **Backend Stack:**

```yaml
Runtime: Node.js + Express.js
Database: PostgreSQL (primary) + Redis (cache/sessions)
Authentication: JWT + OAuth2
File Storage: AWS S3 + CloudFront CDN
Message Queue: Redis Bull queues
Monitoring: DataDog + Winston logging
Deployment: Docker + Kubernetes
```

#### **Infrastructure:**

```yaml
Cloud Provider: AWS
Load Balancer: AWS ALB
Database: AWS RDS PostgreSQL
Cache: AWS ElastiCache Redis
CDN: AWS CloudFront
Container Orchestration: EKS
CI/CD: GitHub Actions + AWS CodePipeline
```

---

### Phase 5: Follow-up Questions

_Ask these based on the candidate's responses:_

1. **"What happens if the WebSocket connection drops during a critical bid?"**

   - Expected: Discuss reconnection strategies, message queuing, fallback to HTTP polling

2. **"How would you implement bid increment rules (minimum bid increases)?"**

   - Expected: Business logic validation, configurable rules per auction type

3. **"How do you handle time zone differences for auction endings?"**

   - Expected: UTC storage, client-side conversion, clear timezone display

4. **"What about mobile responsiveness and offline functionality?"**

   - Expected: Progressive Web App, service workers, offline bid queuing

5. **"How would you implement auction categories and search?"**

   - Expected: Elasticsearch integration, faceted search, auto-suggestions

6. **"What metrics would you track to monitor system health?"**
   - Expected: Response times, bid success rate, WebSocket connection stability, conversion rates

---

## Evaluation Criteria

### **Strong Candidate Should:**

- ✅ Ask clarifying questions about requirements
- ✅ Start with high-level architecture before diving into details
- ✅ Consider scalability and performance implications
- ✅ Handle real-time requirements thoughtfully
- ✅ Address data consistency and race conditions
- ✅ Consider security and fraud prevention
- ✅ Discuss monitoring and observability
- ✅ Make reasonable technology choices with justification

### **Red Flags:**

- ❌ Jumps into implementation without understanding requirements
- ❌ Ignores scalability concerns
- ❌ Doesn't consider race conditions in bidding
- ❌ Overlooks real-time update challenges
- ❌ Forgets about edge cases (network failures, malicious users)
- ❌ Can't explain technology choices
- ❌ Doesn't consider monitoring or debugging

---

## Time Management

- **Requirements (5-10 min)**: Clarify scope and constraints
- **High-level design (10-15 min)**: Overall architecture
- **Deep dives (20-25 min)**: Focus on 2-3 complex areas
- **Wrap-up (5 min)**: Scaling discussion and monitoring

Total: ~45-55 minutes
