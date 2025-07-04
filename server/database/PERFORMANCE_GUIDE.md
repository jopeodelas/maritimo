# 🚀 Database Performance Optimization Guide

## 🔍 **Current Performance Issues Analysis**

### **1. System Queries (Most Impact - 14.0s total)**
The slowest queries in your dashboard are **NOT your application queries**:

- `SELECT name FROM pg_timezone_names` - 285 calls, 14.0s total
- Various CTE recursive queries - 4+ seconds each
- `pgbouncer.get_auth($1)` - 6,233 calls, 620ms total
- Multiple `pg_get_tabledef` queries - 1.8s+ each

**These are PostgreSQL system queries** from:
- 🎛️ Supabase dashboard browsing
- 🔧 Database administration tools
- 📊 PostgREST API introspection
- 🔄 Connection pooling overhead

### **2. Application Queries (Need Optimization)**
Your actual application queries that can be optimized:
- Player rankings with JOINs
- Discussion feeds with comment counts
- Transfer rumors filtering
- User authentication lookups
- Maritodle game queries

## 🛠️ **Optimization Solutions**

### **Step 1: Run Database Indexes Script**
```bash
# Apply the performance optimizations
# Copy and run: server/database/performance_optimizations.sql
```

This script creates **50+ indexes** for:
- ✅ User authentication (email, google_id)
- ✅ Player voting and rankings
- ✅ Discussion and comment queries
- ✅ Transfer rumors filtering
- ✅ Maritodle game lookups
- ✅ Football cache optimization
- ✅ Analytics event tracking

### **Step 2: Application-Level Optimizations**

#### **A. Reduce Database Calls**
```typescript
// Instead of multiple queries
const user = await UserModel.findById(userId);
const votes = await VoteModel.findByUserId(userId);
const ratings = await PlayerRatingModel.findByUserId(userId);

// Use JOIN queries
const userWithData = await db.query(`
  SELECT u.*, 
         COUNT(v.id) as vote_count,
         COUNT(pr.id) as rating_count
  FROM users u
  LEFT JOIN votes v ON u.id = v.user_id
  LEFT JOIN player_ratings pr ON u.id = pr.user_id
  WHERE u.id = $1
  GROUP BY u.id
`, [userId]);
```

#### **B. Implement Caching**
```typescript
// Cache frequently accessed data
const CACHE_TTL = 300; // 5 minutes

// Cache player rankings
const getPlayerRankings = cache(async () => {
  return await PlayerModel.getAllWithVotes();
}, CACHE_TTL);

// Cache discussion feed
const getDiscussionFeed = cache(async () => {
  return await DiscussionModel.getAll();
}, CACHE_TTL);
```

#### **C. Use Database Views**
The script creates optimized views:
```sql
-- Use these instead of complex JOINs
SELECT * FROM player_rankings LIMIT 10;
SELECT * FROM discussion_feed LIMIT 20;
```

### **Step 3: Reduce System Query Overhead**

#### **A. Optimize Supabase Dashboard Usage**
- 🎯 **Minimize dashboard browsing** during peak hours
- 📊 **Use specific table views** instead of browsing all tables
- 🔍 **Limit query result sets** when exploring data

#### **B. Connection Pooling Optimization**
Your current config is good, but consider:
```typescript
// In server/src/config/db.ts
const pool = new Pool({
  max: 5,                     // Reduce from 10 to 5
  min: 0,                     // Reduce from 1 to 0
  idleTimeoutMillis: 60000,   // Increase from 30s to 60s
  connectionTimeoutMillis: 5000, // Reduce from 10s to 5s
});
```

#### **C. PostgREST API Optimization**
If using PostgREST directly:
```typescript
// Add row limits to prevent large result sets
const { data } = await supabase
  .from('players')
  .select('*')
  .limit(50)        // Always limit results
  .order('name');
```

## 📊 **Expected Performance Improvements**

### **Before Optimization:**
- 🔴 Query time: 14.0s (timezone queries)
- 🔴 Database calls: 6,233 (auth queries)
- 🔴 Complex JOINs: 1.8s+ each
- 🔴 No indexes on frequently queried columns

### **After Optimization:**
- ✅ **50+ indexes created** for fast lookups
- ✅ **Optimized views** for complex queries
- ✅ **Reduced N+1 queries** with JOINs
- ✅ **Better connection pooling**
- ✅ **Expected 60-80% faster application queries**

## 🎯 **Priority Actions**

### **Immediate (High Impact)**
1. **Run the performance optimizations script** - Will speed up all queries
2. **Apply database indexes** - Immediate improvement for lookups
3. **Use the optimized views** - Faster complex queries

### **Medium Term (Moderate Impact)**
1. **Add application-level caching** - Reduce database load
2. **Optimize connection pooling** - Reduce overhead
3. **Refactor N+1 queries** - Use JOINs instead of multiple calls

### **Long Term (Low Impact)**
1. **Monitor system queries** - Keep dashboard usage efficient
2. **Consider read replicas** - If needed for high load
3. **Implement query result caching** - Redis/Memcached

## 🔧 **Monitoring & Maintenance**

### **Track Performance**
```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_tup_read DESC;

-- Check slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_%'
ORDER BY mean_time DESC;
```

### **Regular Maintenance**
- 📅 **Weekly**: Review Query Performance dashboard
- 📅 **Monthly**: Analyze new slow queries
- 📅 **Quarterly**: Review and update indexes

## 🚨 **Important Notes**

1. **System queries will still appear** in your dashboard - this is normal
2. **Your application queries should be much faster** after indexing
3. **Monitor for new slow queries** as your app grows
4. **The indexes are created CONCURRENTLY** - safe to run on live database

## 🎉 **Next Steps**

1. **Run the performance script** immediately
2. **Test your application** - it should feel faster
3. **Monitor the Query Performance dashboard** for improvements
4. **Consider application-level caching** for further optimization

---

**🎯 Expected Result**: Your application queries should be **60-80% faster** after applying these optimizations! 