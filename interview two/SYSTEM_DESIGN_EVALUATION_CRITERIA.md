# System Design Interview Evaluation Criteria

## 🎯 **Strong Candidate Indicators (Green Flags)**

### **1. Problem-Solving Approach (25%)**

#### **Excellent (9-10/10):**

- ✅ **Asks clarifying questions** before jumping into solutions
- ✅ **Defines scope** and identifies what's in/out of scope
- ✅ **Breaks down complex problems** into manageable components
- ✅ **Prioritizes requirements** (functional vs non-functional)
- ✅ **Considers trade-offs** and explains reasoning
- ✅ **Adapts approach** based on constraints and feedback

#### **Good (7-8/10):**

- ✅ Asks some clarifying questions
- ✅ Shows structured thinking
- ✅ Identifies key components
- ⚠️ May miss some edge cases or trade-offs

#### **Needs Improvement (5-6/10):**

- ⚠️ Jumps to solution too quickly
- ⚠️ Doesn't ask enough clarifying questions
- ⚠️ Misses important requirements

### **2. System Architecture Knowledge (25%)**

#### **Excellent (9-10/10):**

- ✅ **Draws clear diagrams** with proper components
- ✅ **Understands scalability patterns** (load balancing, caching, sharding)
- ✅ **Knows database types** and when to use each (SQL vs NoSQL)
- ✅ **Understands microservices** vs monolith trade-offs
- ✅ **Considers data flow** and component interactions
- ✅ **Mentions appropriate technologies** for the problem

#### **Good (7-8/10):**

- ✅ Draws reasonable architecture
- ✅ Shows understanding of basic patterns
- ✅ Makes appropriate technology choices
- ⚠️ May miss some advanced concepts

#### **Needs Improvement (5-6/10):**

- ⚠️ Architecture is too simple or overly complex
- ⚠️ Doesn't understand scalability concepts
- ⚠️ Makes poor technology choices

### **3. Scalability & Performance (20%)**

#### **Excellent (9-10/10):**

- ✅ **Identifies bottlenecks** and proposes solutions
- ✅ **Understands caching strategies** (Redis, CDN, application-level)
- ✅ **Knows load balancing** techniques and algorithms
- ✅ **Considers database scaling** (read replicas, sharding, partitioning)
- ✅ **Mentions monitoring** and performance metrics
- ✅ **Discusses horizontal vs vertical scaling**

#### **Good (7-8/10):**

- ✅ Identifies some performance concerns
- ✅ Suggests basic scaling strategies
- ✅ Understands caching concepts
- ⚠️ May miss some advanced optimization techniques

#### **Needs Improvement (5-6/10):**

- ⚠️ Doesn't consider performance implications
- ⚠️ No understanding of scaling concepts
- ⚠️ Oversimplifies performance requirements

### **4. Data Design (15%)**

#### **Excellent (9-10/10):**

- ✅ **Designs appropriate data models** for the use case
- ✅ **Considers data relationships** and normalization
- ✅ **Understands database indexing** strategies
- ✅ **Mentions data consistency** requirements (ACID vs BASE)
- ✅ **Considers data partitioning** and sharding strategies
- ✅ **Discusses backup and recovery** strategies

#### **Good (7-8/10):**

- ✅ Designs reasonable data models
- ✅ Shows understanding of basic database concepts
- ✅ Considers some data relationships
- ⚠️ May miss some advanced data design concepts

#### **Needs Improvement (5-6/10):**

- ⚠️ Poor data model design
- ⚠️ Doesn't understand database concepts
- ⚠️ No consideration of data relationships

### **5. Communication & Collaboration (15%)**

#### **Excellent (9-10/10):**

- ✅ **Explains concepts clearly** and uses appropriate terminology
- ✅ **Draws diagrams** that are easy to understand
- ✅ **Listens to feedback** and incorporates suggestions
- ✅ **Asks for clarification** when needed
- ✅ **Stays organized** and follows logical flow
- ✅ **Engages in discussion** and shows enthusiasm

#### **Good (7-8/10):**

- ✅ Communicates reasonably well
- ✅ Draws some diagrams
- ✅ Shows engagement
- ⚠️ May struggle with complex explanations

#### **Needs Improvement (5-6/10):**

- ⚠️ Poor communication skills
- ⚠️ Doesn't draw diagrams or explain clearly
- ⚠️ Doesn't engage in discussion

---

## 🚩 **Red Flags (Immediate Concerns)**

### **Critical Red Flags (Automatic Fail):**

- ❌ **No clarifying questions** - jumps straight to solution
- ❌ **Can't draw basic architecture** - no understanding of components
- ❌ **No consideration of scale** - designs for 100 users when asked for millions
- ❌ **Single point of failure** - no redundancy or failover
- ❌ **No security considerations** - completely ignores security
- ❌ **Can't explain their choices** - doesn't understand their own design
- ❌ **No data persistence** - everything in memory
- ❌ **No error handling** - assumes everything works perfectly

### **Major Red Flags (Significant Concerns):**

- ⚠️ **Over-engineering** - uses complex patterns for simple problems
- ⚠️ **Under-engineering** - oversimplifies complex requirements
- ⚠️ **No trade-off analysis** - doesn't consider pros/cons
- ⚠️ **Poor technology choices** - uses wrong tools for the job
- ⚠️ **No monitoring/logging** - no observability considerations
- ⚠️ **No backup strategy** - no data protection
- ⚠️ **No API design** - doesn't consider how components communicate
- ⚠️ **No testing strategy** - no consideration of reliability

### **Minor Red Flags (Areas for Improvement):**

- ⚠️ **Limited scalability knowledge** - basic understanding only
- ⚠️ **No performance metrics** - doesn't define success criteria
- ⚠️ **Limited database knowledge** - basic SQL only
- ⚠️ **No caching strategy** - misses optimization opportunities
- ⚠️ **Poor diagram quality** - unclear or incomplete diagrams
- ⚠️ **Limited real-world experience** - only theoretical knowledge

---

## 📊 **Scoring Rubric**

### **Overall Score Calculation:**

```
Total Score = (Problem-Solving × 0.25) + (Architecture × 0.25) +
              (Scalability × 0.20) + (Data Design × 0.15) +
              (Communication × 0.15)
```

### **Score Interpretation:**

- **90-100**: **Exceptional** - Hire immediately, senior level
- **80-89**: **Strong** - Good hire, mid to senior level
- **70-79**: **Good** - Consider for hire, mid level
- **60-69**: **Fair** - Junior level, needs mentoring
- **50-59**: **Weak** - Not recommended for hire
- **Below 50**: **Poor** - Definitely not recommended

---

## 🎯 **Interview Tips for Candidates**

### **Before the Interview:**

1. **Practice drawing** system architecture diagrams
2. **Study common patterns** (load balancing, caching, databases)
3. **Understand scalability** concepts and trade-offs
4. **Review real-world systems** (how does Twitter, Uber, Netflix work?)
5. **Practice explaining** technical concepts clearly

### **During the Interview:**

1. **Start with clarifying questions** - don't jump to solutions
2. **Draw diagrams** - visual communication is crucial
3. **Think out loud** - explain your reasoning process
4. **Consider trade-offs** - every decision has pros and cons
5. **Ask for feedback** - engage with the interviewer
6. **Start simple** - build complexity gradually
7. **Consider scale** - think about millions of users
8. **Discuss monitoring** - how do you know if it's working?

### **Common Mistakes to Avoid:**

- ❌ Don't assume requirements - always ask questions
- ❌ Don't over-engineer - start simple, add complexity as needed
- ❌ Don't ignore non-functional requirements - performance, security, etc.
- ❌ Don't forget about data - how is data stored, retrieved, updated?
- ❌ Don't ignore failure cases - what happens when things go wrong?
- ❌ Don't skip the basics - authentication, authorization, validation

---

## 🔍 **Sample Interview Questions to Ask**

### **Clarifying Questions:**

- "What's the expected scale? (users, requests per second, data size)"
- "What are the most important features vs nice-to-haves?"
- "Are there any specific performance requirements?"
- "What's the expected growth rate?"
- "Are there any compliance or security requirements?"

### **Technical Deep-Dive Questions:**

- "How would you handle a sudden spike in traffic?"
- "What happens if the database goes down?"
- "How would you ensure data consistency across services?"
- "What monitoring would you implement?"
- "How would you handle user authentication and authorization?"

### **Trade-off Questions:**

- "What are the pros and cons of using microservices vs monolith?"
- "When would you choose SQL vs NoSQL?"
- "What are the trade-offs between consistency and availability?"
- "How would you balance performance vs cost?"

---

## 📝 **Evaluation Checklist**

### **For Interviewers:**

- [ ] Did the candidate ask clarifying questions?
- [ ] Did they draw clear architecture diagrams?
- [ ] Did they consider scalability and performance?
- [ ] Did they design appropriate data models?
- [ ] Did they discuss trade-offs and alternatives?
- [ ] Did they consider security and reliability?
- [ ] Did they communicate clearly and engage well?
- [ ] Did they show growth mindset and learning ability?

### **For Candidates:**

- [ ] Did I ask enough clarifying questions?
- [ ] Did I draw clear, understandable diagrams?
- [ ] Did I consider the scale and performance requirements?
- [ ] Did I design appropriate data storage?
- [ ] Did I discuss trade-offs and explain my choices?
- [ ] Did I consider security and error handling?
- [ ] Did I communicate my ideas clearly?
- [ ] Did I engage with the interviewer and ask for feedback?

---

## 🎯 **Final Notes**

**Remember:** System design interviews are not just about getting the "right" answer. They're about:

- **Problem-solving approach** and structured thinking
- **Technical knowledge** and understanding of trade-offs
- **Communication skills** and ability to explain complex concepts
- **Learning ability** and openness to feedback
- **Real-world experience** and practical considerations

**The best candidates** show a combination of technical depth, clear communication, and the ability to think through complex problems systematically while considering real-world constraints and trade-offs.
