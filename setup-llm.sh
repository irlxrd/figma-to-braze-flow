#!/bin/bash

# LLM Liquid Tag Suggestions - Quick Setup Script
# This script helps you configure the LLM API for liquid tag suggestions

echo "🚀 LLM Liquid Tag Suggestions - Setup"
echo "======================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file"
    else
        echo "❌ .env.example not found. Please create .env manually"
        exit 1
    fi
fi

echo ""
echo "📝 Configure LLM Provider"
echo "========================="
echo ""
echo "Select your LLM provider:"
echo "1) OpenAI (recommended - gpt-4o-mini)"
echo "2) OpenAI (gpt-4o - more capable, higher cost)"
echo "3) Anthropic Claude"
echo "4) Custom/Other provider"
echo "5) Skip (I'll configure manually)"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo ""
        read -p "Enter your OpenAI API key: " api_key
        sed -i "s/LLM_API_KEY=.*/LLM_API_KEY=$api_key/" .env
        sed -i "s/# LLM_MODEL=.*/LLM_MODEL=gpt-4o-mini/" .env
        echo "✅ Configured OpenAI with gpt-4o-mini"
        ;;
    2)
        echo ""
        read -p "Enter your OpenAI API key: " api_key
        sed -i "s/LLM_API_KEY=.*/LLM_API_KEY=$api_key/" .env
        sed -i "s/# LLM_MODEL=.*/LLM_MODEL=gpt-4o/" .env
        echo "✅ Configured OpenAI with gpt-4o"
        ;;
    3)
        echo ""
        read -p "Enter your Anthropic API key: " api_key
        sed -i "s/LLM_API_KEY=.*/LLM_API_KEY=$api_key/" .env
        sed -i "s|# LLM_API_URL=.*|LLM_API_URL=https://api.anthropic.com/v1/messages|" .env
        sed -i "s/# LLM_MODEL=.*/LLM_MODEL=claude-3-5-sonnet-20241022/" .env
        echo "✅ Configured Anthropic Claude"
        ;;
    4)
        echo ""
        read -p "Enter your API key: " api_key
        read -p "Enter API URL: " api_url
        read -p "Enter model name: " model
        sed -i "s/LLM_API_KEY=.*/LLM_API_KEY=$api_key/" .env
        sed -i "s|# LLM_API_URL=.*|LLM_API_URL=$api_url|" .env
        sed -i "s/# LLM_MODEL=.*/LLM_MODEL=$model/" .env
        echo "✅ Configured custom provider"
        ;;
    5)
        echo "⏩ Skipped - you can edit .env manually"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✨ Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Restart your development server:"
echo "   npm run dev"
echo ""
echo "2. Open the HTML Editor in your browser"
echo "3. Click 'AI Suggest Tags' to try it out!"
echo ""
echo "📚 Documentation:"
echo "   - LLM_SUGGESTIONS_README.md - Full guide"
echo "   - IMPLEMENTATION_SUMMARY.md - Technical details"
echo "   - VISUAL_GUIDE.md - UI walkthrough"
echo ""
echo "💡 Tip: The first request might take 3-5 seconds"
echo ""
