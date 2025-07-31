#!/bin/bash

# Setup script for E2E test credentials

echo "Setting up E2E test credentials..."

# Create credentials directory
mkdir -p ./credentials

# Check for Google Service Account
if [ ! -f "./credentials/google-service-account.json" ]; then
    echo "❌ Google Service Account key not found!"
    echo "Please place your service account JSON at: ./credentials/google-service-account.json"
    echo ""
    echo "To create a service account:"
    echo "1. Go to Google Cloud Console"
    echo "2. Create a service account with Calendar, Places, Vision API access"
    echo "3. Enable domain-wide delegation for user impersonation"
    echo "4. Download the JSON key"
    exit 1
fi

# Create .env.test from example if not exists
if [ ! -f ".env.test" ]; then
    cp .env.test.example .env.test
    echo "✅ Created .env.test - Please fill in your API keys"
fi

# Validate required environment variables
source .env.test

required_vars=(
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
    "GOOGLE_TEST_USER_EMAIL"
    "OPENAI_API_KEY"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=($var)
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi

echo "✅ All required credentials are configured"

# Test API connectivity
echo ""
echo "Testing API connectivity..."

# Test Google Auth
node -e "
const { google } = require('googleapis');
const key = require('./credentials/google-service-account.json');

const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/calendar']
);

jwtClient.authorize()
    .then(() => console.log('✅ Google API authentication successful'))
    .catch(err => console.error('❌ Google API authentication failed:', err.message));
"

# Test OpenAI
curl -s -H "Authorization: Bearer $OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.openai.com/v1/models \
     > /dev/null && echo "✅ OpenAI API key is valid" || echo "❌ OpenAI API key is invalid"

echo ""
echo "Setup complete! You can now run: npm run test:e2e:real"