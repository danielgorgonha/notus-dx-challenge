# Daily Report - Pool Listing Endpoint Issue

**Date:** 2025-01-15  
**Type:** Bug Report / API Issue  
**Priority:** High  
**Status:** Workaround Implemented  

## 🚨 Issue Summary

The pool listing endpoint (`GET /liquidity/pools`) is not returning complete data for profitability calculations, specifically missing detailed `stats` information that is required for accurate APR calculations.

## 📊 Problem Details

### **Affected Endpoint:**
```
GET /liquidity/pools?take=50&chainIds=137&rangeInDays=365&filterWhitelist=false
```

### **Expected vs Actual Data:**

#### **Expected Response Structure:**
```json
{
  "pools": [
    {
      "id": "137-0x...",
      "totalValueLockedUSD": "10000.00",
      "stats": {
        "rangeInDays": 365,
        "feesInUSD": "1500.75",      // ❌ Missing or zero
        "volumeInUSD": "50000.25",    // ❌ Missing or zero
        "transactionsCount": 1250
      }
    }
  ]
}
```

#### **Actual Response:**
```json
{
  "pools": [
    {
      "id": "137-0x...",
      "totalValueLockedUSD": "0.000469",  // Very low values
      "stats": {
        "rangeInDays": 30,
        "feesInUSD": "0",                 // ❌ Always zero
        "volumeInUSD": "0",               // ❌ Always zero
        "transactionsCount": 0
      }
    }
  ]
}
```

## 🔍 Root Cause Analysis

1. **Incomplete Data**: The listing endpoint returns aggregated stats that are often zero or very low
2. **Limited Historical Data**: The `rangeInDays` parameter doesn't seem to be properly applied in the listing endpoint
3. **Data Quality**: Many pools show extremely low TVL values (e.g., $0.000469)
4. **Missing Activity**: Most pools show zero fees, volume, and transactions

## 🛠️ Workaround Implemented

### **Solution: Using rangeInDays=365 Parameter**
We implemented the correct usage of the `rangeInDays=365` parameter in the listing endpoint:

```typescript
// Using the listing endpoint with 365 days range
const pools = await liquidityActions.listPools({
  take: 50,
  chainIds: "137", // Polygon only
  rangeInDays: 365, // 1 year for historical data
  filterWhitelist: false
});
```

### **Expected Behavior:**
The listing endpoint should return pools with complete `stats` data when `rangeInDays=365` is used:

```json
{
  "pools": [
    {
      "id": "137-0x...",
      "totalValueLockedUSD": "10000.00",
      "stats": {
        "rangeInDays": 365,
        "feesInUSD": "1500.75",      // Should contain real data
        "volumeInUSD": "50000.25",    // Should contain real data
        "transactionsCount": 1250
      }
    }
  ]
}
```

## 📈 Impact Assessment

### **Before Fix:**
- ❌ All pools showed 0.00% APR
- ❌ TVL values were extremely low
- ❌ Volume and fees were zero
- ❌ Users couldn't make informed decisions

### **After Fix:**
- ✅ Using correct `rangeInDays=365` parameter
- ✅ Accepting that data may be zero until API is fixed
- ✅ Proper error handling for missing data
- ✅ Clear documentation of the issue for Notus team

## 🔧 Technical Implementation

### **Files Modified:**
- `src/app/pools/page.tsx` - Updated to use `rangeInDays=365` parameter
- `src/lib/utils/pool-filters.ts` - Updated filters for Polygon-only
- `src/lib/actions/liquidity.ts` - Already supports `rangeInDays` parameter

### **Key Changes:**
1. **Correct Parameter Usage**: Using `rangeInDays=365` in listing endpoint
2. **Polygon-Only Focus**: Filtering to chain 137 for better data quality
3. **Error Handling**: Graceful handling of zero/undefined data
4. **Documentation**: Clear bug report for Notus team

## 🎯 Recommendations

### **Short Term:**
- ✅ Use correct `rangeInDays=365` parameter (implemented)
- ✅ Accept zero data until API is fixed
- ✅ Report bug to Notus team

### **Long Term:**
- 🔄 **API Fix**: Request Notus team to fix listing endpoint
- 🔄 **Data Quality**: Investigate why many pools have zero activity
- 🔄 **Performance**: Optimize when API returns proper data

## 📝 API Documentation Update Needed

The current API documentation should be updated to reflect:

1. **Listing Endpoint Limitations**: 
   - `stats` data may be incomplete or zero
   - `rangeInDays` parameter may not work as expected
   - Individual pool details are more reliable

2. **Recommended Usage**:
   - Use listing endpoint for pool discovery
   - Use individual pool endpoint for detailed data
   - Implement batch processing for better performance

## 🚀 Next Steps

1. **Monitor Performance**: Track response times with batch requests
2. **Error Handling**: Implement retry logic for failed requests
3. **Caching Strategy**: Optimize cache duration based on data freshness
4. **User Feedback**: Monitor user experience with new data accuracy

## 📊 Metrics to Track

- **API Response Times**: Individual vs batch requests
- **Data Accuracy**: APR calculations before/after
- **Error Rates**: Failed individual pool requests
- **User Engagement**: Pool selection and interaction rates

---

**Reported by:** Development Team  
**Last Updated:** 2025-01-15  
**Next Review:** 2025-01-22
