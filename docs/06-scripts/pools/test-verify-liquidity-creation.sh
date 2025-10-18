#!/bin/bash

# Verify Liquidity Creation Script
# Tests the GET /api/v1/liquidity/pools/{id}/historical-data endpoint to verify liquidity was created

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# API Configuration
API_BASE="https://api.notus.team/api/v1"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s"

echo -e "${BLUE}🔍 Verifying Liquidity Creation${NC}"
echo "================================================"

# Pool ID to check (USDC.E/LINK pool)
POOL_ID="137-0x94ab9e4553ffb839431e37cc79ba8905f45bfbea"
RANGE_DAYS=30
GROUP_BY_INTERVAL="DAILY"

echo -e "${YELLOW}📊 Verification Parameters:${NC}"
echo "Pool ID: $POOL_ID"
echo "Range: $RANGE_DAYS days"
echo "Group By: $GROUP_BY_INTERVAL"
echo ""

# Make the API call
echo -e "${BLUE}📤 Fetching historical data for pool...${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/liquidity/pools/$POOL_ID/historical-data?rangeInDays=$RANGE_DAYS&groupByInterval=$GROUP_BY_INTERVAL" \
  -H "x-api-key: $API_KEY")

# Extract HTTP status code
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

echo -e "${BLUE}📡 Response Status: $HTTP_CODE${NC}"

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Success! Historical data retrieved${NC}"
    echo ""
    
    # Parse and display key information
    if command -v jq &> /dev/null; then
        echo -e "${YELLOW}📋 Pool Statistics Summary:${NC}"
        echo "Range: $(echo "$RESPONSE_BODY" | jq -r '.statistics.rangeInDays // "N/A"') days"
        echo "Group By: $(echo "$RESPONSE_BODY" | jq -r '.statistics.groupByInterval // "N/A"')"
        echo "Pool ID: $(echo "$RESPONSE_BODY" | jq -r '.statistics.poolId // "N/A"')"
        echo "Data Points: $(echo "$RESPONSE_BODY" | jq -r '.statistics.items | length')"
        echo ""
        
        # Check if there are recent data points
        ITEMS_COUNT=$(echo "$RESPONSE_BODY" | jq -r '.statistics.items | length')
        if [ "$ITEMS_COUNT" -gt 0 ]; then
            echo -e "${GREEN}📈 Recent Activity Found:${NC}"
            
            # Get the most recent data point
            LATEST_ITEM=$(echo "$RESPONSE_BODY" | jq -r '.statistics.items[-1]')
            if [ "$LATEST_ITEM" != "null" ]; then
                TIMESTAMP=$(echo "$LATEST_ITEM" | jq -r '.timestamp')
                VOLUME=$(echo "$LATEST_ITEM" | jq -r '.volumeInUSD')
                FEES=$(echo "$LATEST_ITEM" | jq -r '.feesInUSD')
                TVL=$(echo "$LATEST_ITEM" | jq -r '.totalValueLockedInUSD')
                
                # Convert timestamp to readable date
                if [ "$TIMESTAMP" != "null" ] && [ "$TIMESTAMP" != "0" ]; then
                    READABLE_DATE=$(date -d "@$((TIMESTAMP/1000))" 2>/dev/null || date -r "$((TIMESTAMP/1000))" 2>/dev/null || echo "Unknown date")
                    echo "Latest Update: $READABLE_DATE"
                fi
                
                echo "Volume (24h): \$${VOLUME:-N/A}"
                echo "Fees (24h): \$${FEES:-N/A}"
                echo "TVL: \$${TVL:-N/A}"
                echo ""
                
                # Check for liquidity creation indicators
                echo -e "${PURPLE}🔍 Liquidity Creation Indicators:${NC}"
                
                # Check if TVL has increased recently
                if [ "$TVL" != "null" ] && [ "$TVL" != "0" ]; then
                    TVL_NUM=$(echo "$TVL" | sed 's/[^0-9.]//g')
                    if [ -n "$TVL_NUM" ] && [ "$TVL_NUM" != "0" ]; then
                        echo -e "${GREEN}✅ TVL Active: \$${TVL}${NC}"
                    else
                        echo -e "${YELLOW}⚠️  TVL: \$${TVL} (Low or zero)${NC}"
                    fi
                else
                    echo -e "${RED}❌ TVL: No data available${NC}"
                fi
                
                # Check for recent volume
                if [ "$VOLUME" != "null" ] && [ "$VOLUME" != "0" ]; then
                    VOLUME_NUM=$(echo "$VOLUME" | sed 's/[^0-9.]//g')
                    if [ -n "$VOLUME_NUM" ] && [ "$VOLUME_NUM" != "0" ]; then
                        echo -e "${GREEN}✅ Recent Volume: \$${VOLUME}${NC}"
                    else
                        echo -e "${YELLOW}⚠️  Volume: \$${VOLUME} (Low or zero)${NC}"
                    fi
                else
                    echo -e "${RED}❌ Volume: No data available${NC}"
                fi
                
                # Check for fees
                if [ "$FEES" != "null" ] && [ "$FEES" != "0" ]; then
                    FEES_NUM=$(echo "$FEES" | sed 's/[^0-9.]//g')
                    if [ -n "$FEES_NUM" ] && [ "$FEES_NUM" != "0" ]; then
                        echo -e "${GREEN}✅ Recent Fees: \$${FEES}${NC}"
                    else
                        echo -e "${YELLOW}⚠️  Fees: \$${FEES} (Low or zero)${NC}"
                    fi
                else
                    echo -e "${RED}❌ Fees: No data available${NC}"
                fi
                
            else
                echo -e "${YELLOW}⚠️  No recent data points found${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  No historical data available${NC}"
        fi
        
        echo ""
        echo -e "${BLUE}📊 Full Response:${NC}"
        echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
        
    else
        echo -e "${YELLOW}⚠️  jq not available, showing raw response:${NC}"
        echo "$RESPONSE_BODY"
    fi
    
elif [ "$HTTP_CODE" -eq 403 ]; then
    echo -e "${RED}❌ Forbidden (403)${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
    
elif [ "$HTTP_CODE" -eq 404 ]; then
    echo -e "${RED}❌ Pool Not Found (404)${NC}"
    echo "The pool $POOL_ID was not found"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
    
else
    echo -e "${RED}❌ Error: HTTP $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
fi

echo ""
echo -e "${BLUE}🏁 Verification completed${NC}"

# Additional check: Compare with previous TVL if available
echo ""
echo -e "${PURPLE}💡 Tips for Verification:${NC}"
echo "1. Check if TVL (Total Value Locked) has increased"
echo "2. Look for recent volume and fees activity"
echo "3. Verify the pool ID matches the one used for creation"
echo "4. Compare timestamps to see if data is recent"
echo "5. If TVL is zero or very low, the liquidity might not have been created successfully"
