#!/usr/bin/env bash
set -e

echo "Creating Stripe product..."
PRODUCT_ID=$(stripe products create \
  --name "Car Wash Simulator Pro" \
  --description "Unlock AI Business Advisor and premium features" \
  --json | jq -r '.id')
echo "Product created: $PRODUCT_ID"

echo "Creating price ($49/mo recurring)..."
PRICE_ID=$(stripe prices create \
  --unit-amount 4900 \
  --currency usd \
  --recurring interval=month \
  --product $PRODUCT_ID \
  --json | jq -r '.id')
echo "Price created: $PRICE_ID"

echo "Creating payment link..."
PAYMENT_URL=$(stripe payment_links create \
  --line-items price=$PRICE_ID,quantity=1 \
  --json | jq -r '.url')
echo "Payment Link created: $PAYMENT_URL"

echo "Injecting payment link into index.html..."
sed -i '' "s|https://buy.stripe.com/YOUR_LINK|$PAYMENT_URL|g" index.html
echo "Done! The paywall modal now uses the real Stripe link." 