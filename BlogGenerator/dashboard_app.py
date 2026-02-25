#!/usr/bin/env python3
"""
KnotStranded Blog Generator - Complete Ultimate Edition
Categories + ChatGPT + Images + ClickBank + Squarespace Posting
"""

from flask import Flask, render_template, request, jsonify, send_file, send_from_directory, session, redirect, url_for
from functools import wraps
import os
import json
from datetime import datetime
import anthropic
import threading
import re
import time
import random
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'knotstranded-secret-key-9988')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
CONFIG_FILE = 'config.json'
SUBSCRIBERS_FILE = 'subscribers.json'

@app.route('/robots.txt')
def robots_txt():
    """Build a search-engine friendly robots.txt"""
    content = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /dashboard",
        "Disallow: /api/",
        "Disallow: /login",
        f"Sitemap: {request.host_url.rstrip('/')}/sitemap.xml"
    ]
    return "\n".join(content), 200, {'Content-Type': 'text/plain'}

# ============================================================================
# CATEGORIES
# ============================================================================

NEWS_CATEGORIES = {
    "movies": {
        "name": "Movies",
        "keywords": ["movie", "film", "cinema", "box office", "blockbuster"],
        "tags": ["cinema", "film review", "box office", "hollywood", "movie news"]
    },
    "tv": {
        "name": "TV Shows",
        "keywords": ["tv show", "television", "series", "streaming", "episode"],
        "tags": ["television", "tv series", "streaming", "binge watch", "tv news"]
    },
    "music": {
        "name": "Music",
        "keywords": ["music", "album", "concert", "artist", "song"],
        "tags": ["music industry", "albums", "concerts", "artists", "music news"]
    },
    "celebrity": {
        "name": "Celebrity News",
        "keywords": ["celebrity", "star", "actor", "actress", "famous"],
        "tags": ["celebrities", "hollywood stars", "entertainment", "pop culture"]
    },
    "awards": {
        "name": "Awards & Events",
        "keywords": ["oscar", "grammy", "awards", "festival", "ceremony"],
        "tags": ["awards season", "red carpet", "entertainment awards", "ceremonies"]
    },
    "streaming": {
        "name": "Streaming Services",
        "keywords": ["netflix", "disney+", "hulu", "streaming", "platform"],
        "tags": ["streaming wars", "netflix", "content", "digital entertainment"]
    },
    "books": {
        "name": "Books & Literature",
        "keywords": ["book", "novel", "author", "publishing", "bestseller"],
        "tags": ["literature", "bestsellers", "authors", "publishing", "book news"]
    },
    "gaming": {
        "name": "Gaming & Esports",
        "keywords": ["game", "gaming", "esports", "video game", "console"],
        "tags": ["video games", "esports", "gaming industry", "game releases"]
    },
    "local": {
        "name": "Local Pulse",
        "keywords": ["local news", "community", "city council", "regional", "hometown", "church", "business news", "programs", "city events"],
        "tags": ["local", "community", "regional", "hometown", "local news"]
    },
    "tech": {
        "name": "Tech & AI",
        "keywords": ["artificial intelligence", "gadgets", "software", "tech news", "innovation", "silicon valley"],
        "tags": ["technology", "ai", "gadgets", "future", "software"]
    },
    "finance": {
        "name": "Finance & Business",
        "keywords": ["stocks", "crypto", "economy", "entrepreneurship", "markets", "investing"],
        "tags": ["finance", "business", "investing", "crypto", "stocks"]
    },
    "health": {
        "name": "Health & Wellness",
        "keywords": ["fitness", "mental health", "nutrition", "biohacking", "wellness", "medical"],
        "tags": ["health", "wellness", "fitness", "lifestyle", "mental health"]
    },
    "lifestyle": {
        "name": "Lifestyle & Travel",
        "keywords": ["travel", "home decor", "food", "fashion", "luxury", "diy"],
        "tags": ["lifestyle", "travel", "food", "fashion", "home"]
    },
    "science": {
        "name": "Science & Nature",
        "keywords": ["space", "environment", "discoveries", "biology", "physics", "climate"],
        "tags": ["science", "space", "nature", "environment", "discovery"]
    },
    "sports": {
        "name": "Sports World",
        "keywords": ["nba", "nfl", "soccer", "mlb", "olympics", "racing"],
        "tags": ["sports", "athletes", "games", "competition", "teams"]
    },
    "politics": {
        "name": "Global Politics",
        "keywords": ["politics", "election", "government", "policy", "senate", "white house", "congress"],
        "tags": ["politics", "government", "elections", "policy", "world news"]
    }
}

# ============================================================================
# CLICKBANK PRODUCTS
# ============================================================================
# IMPORTANT: Replace these URLs with your actual ClickBank affiliate links!
# Format: https://[vendor].vendor.hop.clickbank.net/?affiliate=[YOUR_AFFILIATE_ID]

CLICKBANK_PRODUCTS = {
    "movies": [
        {"title": "Ultimate Streaming Guide", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "comprehensive streaming platform guide"},
        {"title": "Cinematography Masterclass", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "film appreciation course"},
        {"title": "Home Theater Setup", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "home entertainment system"}
    ],
    "tv": [
        {"title": "TV Series Database", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "complete series guide"},
        {"title": "Streaming Optimizer", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "streaming service comparison"},
        {"title": "Binge Guide Pro", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "TV recommendation engine"}
    ],
    "music": [
        {"title": "Music Production Mastery", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "music creation course"},
        {"title": "Concert Finder Pro", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "live music tracker"},
        {"title": "Music Theory Complete", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "music education"}
    ],
    "celebrity": [
        {"title": "Celebrity Style Guide", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "fashion course"},
        {"title": "Entertainment News Pro", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "news aggregator"},
        {"title": "Social Influence Course", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "influencer training"}
    ],
    "awards": [
        {"title": "Red Carpet Styling", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "fashion analysis tool"},
        {"title": "Event Planning Pro", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "ceremony guide"},
        {"title": "Industry Insider Access", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "exclusive event reports"}
    ],
    "streaming": [
        {"title": "VPN for Streaming", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "unlock global content"},
        {"title": "Smart DNS Setup", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "high-speed streaming tool"},
        {"title": "Content Discovery App", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "find trending shows fast"}
    ],
    "books": [
        {"title": "Author Success Blueprint", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "writing and publishing course"},
        {"title": "Speed Reading Mastery", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "read more books faster"},
        {"title": "Literary Analysis Pro", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "deep book study tool"}
    ],
    "gaming": [
        {"title": "Pro Gamer Reflexes", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "competitive gaming training"},
        {"title": "Game Dev Fundamentals", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "create your own games"},
        {"title": "E-sports Betting Guide", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "gaming analysis resource"}
    ],
    "local": [
        {"title": "Home Security Mastery", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "protect your local residence"},
        {"title": "Organic Gardening Guide", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "grow your own local food"},
        {"title": "Emergency Preparedness Pro", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "stay safe in your region"}
    ],
    "default": [
        {"title": "Entertainment Insider", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "industry guide"},
        {"title": "Pop Culture Toolkit", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "analysis resource"},
        {"title": "Media Discovery Tool", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "content finder"}
    ],
    "tech": [
        {"title": "AI Profit Masterclass", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "leverage AI for business"},
        {"title": "Smart Home Automation", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "complete automation guide"},
        {"title": "Coding Bootcamp Pro", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "professional dev training"}
    ],
    "finance": [
        {"title": "Crypto Wealth Secrets", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "cryptocurrency trading course"},
        {"title": "Passive Income Blueprint", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "build wealth automatically"},
        {"title": "Forex Trading Pro", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "expert market analysis"}
    ],
    "health": [
        {"title": "Custom Keto Plan", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "personalized nutrition"},
        {"title": "Mindfulness Mastery", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "mental wellness training"},
        {"title": "21-Day Workout Challenge", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "fitness transformation"}
    ],
    "lifestyle": [
        {"title": "Vagabond Travel Guide", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "budget luxury travel"},
        {"title": "Interior Design Course", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "transform your space"},
        {"title": "Gourmet Home Cooking", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "chef-level recipes"}
    ],
    "science": [
        {"title": "Astronomy Essentials", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "guide to the cosmos"},
        {"title": "Sustainability Handbook", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "green living guide"},
        {"title": "Bio-Age Optimizer", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "science of longevity"}
    ],
    "sports": [
        {"title": "Vertical Jump Training", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "explosive athletic power"},
        {"title": "Golf Swing Secret", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "pro-level golf training"},
        {"title": "Sports Nutrition Pro", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "fuel for performance"}
    ],
    "politics": [
        {"title": "Political Intelligence Brief", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "insider power reports"},
        {"title": "Crisis Management Course", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "leadership in turmoil"},
        {"title": "Debate Mastery Pro", "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=l4j4n", "description": "advanced persuasion tactics"}
    ]
}

# ============================================================================
# NEW: SUBSCRIPTION & SaaS OFFERS (Impact/Rakuten Networks)
# ============================================================================

SUBSCRIPTION_OFFERS = {
    "tech": [
        {"title": "Jasper AI Writing", "url": "https://jasper.ai/?fpr=knotstranded", "description": "top-rated AI content assistant"},
        {"title": "NordVPN Security", "url": "https://nordvpn.com/knotstranded", "description": "industry-leading privacy protection"},
        {"title": "SEMrush SEO Tool", "url": "https://semrush.sjv.io/knotstranded", "description": "professional market intelligence"}
    ],
    "finance": [
        {"title": "Coinbase Trading", "url": "https://coinbase.com/join/knotstranded", "description": "secure crypto exchange"},
        {"title": "Robinhood Investing", "url": "https://robinhood.com/referral/knotstranded", "description": "commission-free stock trading"},
        {"title": "eToro Social Trading", "url": "https://etoro.com/knotstranded", "description": "copy top-performing investors"}
    ],
    "health": [
        {"title": "Performance Lab Nucleus", "url": "https://performancelab.com/knotstranded", "description": "world's cleanest supplements"},
        {"title": "Fitbit Premium", "url": "https://fitbit.com/knotstranded", "description": "advanced health metrics"},
        {"title": "Peloton App", "url": "https://onepeloton.com/knotstranded", "description": "expert-led fitness classes"}
    ],
    "entertainment": [
        {"title": "Disney+ Bundle", "url": "https://disneyplus.com/knotstranded", "description": "Disney, Pixar, Marvel, & Star Wars"},
        {"title": "Paramount+ Global", "url": "https://paramountplus.com/knotstranded", "description": "live sports & breaking news"},
        {"title": "Apple One", "url": "https://apple.com/knotstranded", "description": "all Apple services in one simplified plan"}
    ],
    "politics": [
        {"title": "NYT Digital Subscription", "url": "https://nytimes.com/knotstranded", "description": "independent journalism & analysis"},
        {"title": "Bookshop.org", "url": "https://bookshop.org/shop/knotstranded", "description": "support local independent bookstores"},
        {"title": "WSJ Digital Access", "url": "https://wsj.com/knotstranded", "description": "business and political intelligence"}
    ],
    "default": [
        {"title": "KnotStranded VIP", "url": "https://knotstranded.com/vip", "description": "exclusive membership & reports"}
    ]
}

AMAZON_PRODUCTS = {
    "movies": [
        {"title": "4K Projector for Home Cinema", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "bring the theater home"},
        {"title": "Movie Poster Collection", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "decorate your film room"},
        {"title": "Classic Cinema Blu-ray Box Set", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "must-see film collection"}
    ],
    "tv": [
        {"title": "OLED Smart TV 65-inch", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "ultimate binge watching experience"},
        {"title": "Universal Remote Control", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "manage all your devices"},
        {"title": "TV Backlight Ambient Lighting", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "immersive viewing setup"}
    ],
    "music": [
        {"title": "Noise Cancelling Headphones", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "pure audio bliss"},
        {"title": "Vinyl Record Player", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "classic sound experience"},
        {"title": "Portable Bluetooth Speaker", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "music wherever you go"}
    ],
    "celebrity": [
        {"title": "Designer Sunglasses", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "star-quality eye protection"},
        {"title": "Luxury Skincare Kit", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "red carpet ready skin"},
        {"title": "Professional Ring Light", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "look like an influencer"}
    ],
    "awards": [
        {"title": "Evening Gown Designer Book", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "history of red carpet fashion"},
        {"title": "Crystal Trophy Award Decor", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "elegant shelf piece"},
        {"title": "Smart Watch for Event Tracking", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "stay on schedule in style"}
    ],
    "streaming": [
        {"title": "Streaming Media Player Pro", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "fastest content access"},
        {"title": "Ethernet Adapter for TV", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "lag-free 4K streaming"},
        {"title": "Ergonomic Binge Pillow", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "ultimate comfort for marathons"}
    ],
    "books": [
        {"title": "Kindle Paperwhite", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "read thousands of books anywhere"},
        {"title": "Adjustable Book Stand", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "comfortable reading posture"},
        {"title": "Reading Lamp with Eye Protection", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "perfect night-time lighting"}
    ],
    "gaming": [
        {"title": "Mechanical Gaming Keyboard", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "ultra-fast response time"},
        {"title": "High-Precision Gaming Mouse", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "perfect accuracy in game"},
        {"title": "Gaming Headset with 7.1 Surround", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "hear everything in the game"}
    ],
    "local": [
        {"title": "Local Smart Home Security", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "top-rated local protection"},
        {"title": "Regional Weather Station", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "precise local climate tracking"},
        {"title": "Neighborhood Crisis Radio", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "stay informed in your area"}
    ],
    "default": [
        {"title": "Digital Content Creator Kit", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "everything you need to start"},
        {"title": "Ergonomic Workspace Desk", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "write in comfort"},
        {"title": "Portable Power Bank", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "stay charged on the move"}
    ],
    "tech": [
        {"title": "Latest Mechanical Keyboard", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "premium typing experience"},
        {"title": "Smart Home Hub", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "center of your smart home"},
        {"title": "Noise Cancelling Earbuds", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "pure audio focus"}
    ],
    "finance": [
        {"title": "Hardcover Ledger Nano", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "secure your crypto assets"},
        {"title": "Dual Screen Monitor Setup", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "maximize trading productivity"},
        {"title": "Finance Management Journal", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "track your wealth building"}
    ],
    "health": [
        {"title": "Smart Fitness Watch", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "track every heartbeat"},
        {"title": "Premium Yoga Mat", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "ultimate comfort for practice"},
        {"title": "High-Speed Nutrient Blender", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "perfect smoothies every time"}
    ],
    "lifestyle": [
        {"title": "Carry-on Travel Backpack", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "organized travel perfection"},
        {"title": "Aesthetic Coffee Maker", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "morning ritual upgrade"},
        {"title": "Organic Essential Oil Diffuser", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "relaxing home atmosphere"}
    ],
    "science": [
        {"title": "Reflector Telescope Kit", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "explore the night sky"},
        {"title": "Microscope for Hobbyists", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "discover hidden worlds"},
        {"title": "Weather Monitoring Station", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "professional climate data"}
    ],
    "sports": [
        {"title": "Adjustable Dumbbell Set", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "versatile home strength training"},
        {"title": "Portable Basketball Hoop", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "game on anywhere"},
        {"title": "Agility Training Kit", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "improve your performance"}
    ],
    "politics": [
        {"title": "Political Strategy Hardcover", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "essential reading for leaders"},
        {"title": "Noise-Cancelling Privacy Booth", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "secure workspace for sensitive work"},
        {"title": "World History Encyclopedia", "url": "https://amazon.com/dp/B00EXAMPLES?tag=knotstranded-20", "description": "context for modern global events"}
    ]
}

def get_affiliate_links(category, num_cb=2, num_amz=2, num_sub=2):
    """Get ClickBank, Amazon, and Subscription links for category"""
    cb_products = CLICKBANK_PRODUCTS.get(category, CLICKBANK_PRODUCTS["default"])
    amz_products = AMAZON_PRODUCTS.get(category, AMAZON_PRODUCTS["default"])
    
    # Map high-level niches for subscriptions
    sub_map = {
        "tech": "tech", "finance": "finance", "health": "health", "politics": "politics",
        "movies": "entertainment", "tv": "entertainment", "music": "entertainment", 
        "celebrity": "entertainment", "streaming": "entertainment"
    }
    sub_cat = sub_map.get(category, "default")
    sub_products = SUBSCRIPTION_OFFERS.get(sub_cat, SUBSCRIPTION_OFFERS["default"])
    
    cb_sample = random.sample(cb_products, min(num_cb, len(cb_products)))
    amz_sample = random.sample(amz_products, min(num_amz, len(amz_products)))
    sub_sample = random.sample(sub_products, min(num_sub, len(sub_products)))
    
    return {"clickbank": cb_sample, "amazon": amz_sample, "subscriptions": sub_sample}

DAILY_TIPS = {
    "movies": "Master the art of color grading in your home theater by adjusting the 'Warm 2' preset for a cinematic look.",
    "tv": "Use a specialized backlight kit to reduce eye strain during your next 10-hour binge session.",
    "music": "Clean your vinyl records with a carbon fiber brush before every play to preserve the grooves for decades.",
    "celebrity": "Follow stylists on 'Behind the Bling' for early leaks on red carpet trends before they hit the mainstream.",
    "awards": "Check the 'Shortlist' categories three months early to win your next Oscars betting pool.",
    "streaming": "Restart your router weekly to clear the cache and maintain 4K bitrate without buffering dips.",
    "books": "Try the 'pomodoro' reading method: 25 minutes of reading followed by a 5-minute break to increase retention.",
    "gaming": "Lower your mouse DPI to 800 for better muscle memory and precision in competitive shooters.",
    "local": "Join your local 'Buy Nothing' group to save money and strengthen community ties in your zip code.",
    "tech": "Enable Two-Factor Authentication (2FA) on all devices today to protect your digital identity from leaks.",
    "finance": "Review your automated subscriptions monthly; cancelling just two forgotten services can save you $300/year.",
    "health": "Drink 500ml of water immediately upon waking to kickstart your metabolism and cognitive functions.",
    "lifestyle": "Roll your clothes instead of folding them when packing—it saves 30% more space and prevents deep wrinkles.",
    "science": "Use a specialized blue-light filter in the evening to maintain your natural circadian rhythm for deeper sleep.",
    "sports": "Dynamic stretching before a workout is 40% more effective at preventing injury than static stretching."
}

def generate_tags(category):
    """Generate 3 tags for category"""
    tags = NEWS_CATEGORIES.get(category, {}).get("tags", ["news", "intelligence", "trends"])
    return random.sample(tags, min(3, len(tags)))

# ============================================================================
# WRITERS
# ============================================================================

def load_writers():
    """Load writer personalities"""
    try:
        with open('writers.json', 'r') as f:
            return json.load(f)['writers']
    except:
        return [{"id": 1, "name": "The Editor", "title": "Entertainment Writer"}]

def select_random_writer():
    """Select random writer"""
    return random.choice(load_writers())

# ============================================================================
# CONFIG
# ============================================================================

def load_config():
    """Load config with Environment Variable priority for Railway/Production"""
    config = {}
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                config = json.loads(f.read().strip() or '{}')
        except:
            config = {}
    
    # Environment Variable Overrides (Cloud Deployment)
    env_map = {
        'anthropic_api_key': 'ANTHROPIC_API_KEY',
        'gemini_api_key': 'GEMINI_API_KEY',
        'openai_api_key': 'OPENAI_API_KEY',
        'clickbank_affiliate_id': 'CLICKBANK_ID',
        'squarespace_api_key': 'SQUARESPACE_API_KEY',
        'squarespace_site_id': 'SQUARESPACE_SITE_ID',
        'squarespace_collection_id': 'SQUARESPACE_COLLECTION_ID',
        'amazon_tag': 'AMAZON_TAG',
        'admin_password': 'ADMIN_PASSWORD'
    }
    
    for config_key, env_key in env_map.items():
        val = os.environ.get(env_key)
        if val:
            config[config_key] = val
            
    return config

def save_config(config):
    """Save config"""
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
        return True
    except:
        return False

# ============================================================================
# GEOLOCATION
# ============================================================================

def get_location_from_ip():
    """Get location from user's IP address"""
    try:
        # Get IP accurately
        ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        # Use ip-api.com for free geolocation
        res = requests.get(f'http://ip-api.com/json/{ip if ip != "127.0.0.1" else ""}').json()
        
        if res.get('status') == 'success':
            return {
                'city': res.get('city'),
                'region': res.get('regionName'),
                'country': res.get('country'),
                'postal': res.get('zip'),
                'description': f"{res.get('city')}, {res.get('regionName')}"
            }
    except:
        pass
    return {'city': 'Unknown', 'region': 'Unknown', 'postal': 'Unknown', 'description': 'Unknown Location'}

# ============================================================================
# SEARCH - GEMINI
# ============================================================================

def search_with_gemini(api_key, num_results, query_filter, categories, config=None):
    """Search with Gemini"""
    try:
        import google.generativeai as genai
        
        print(f"[Gemini] Searching {num_results} articles in: {categories}")
        genai.configure(api_key=api_key)
        
        # Build query from categories
        keywords = []
        for cat in categories:
            keywords.extend(NEWS_CATEGORIES.get(cat, {}).get("keywords", []))
        
        if query_filter:
            query = f"Find {num_results} recent news stories about {query_filter}. Focus on high-authority sources."
        elif len(categories) >= 6:
            # Trending Mode
            query = f"Find {num_results} top trending news stories today across various global topics. Include breaking news, viral science discoveries, tech innovation, major sports events, financial shifts, and entertainment headlines. Focus on what's currently trending globally."
        elif 'local' in categories:
            loc = get_location_from_ip()
            # Use custom location if provided in config
            location_info = (config or {}).get('custom_location') or loc['description']
            postal_info = (config or {}).get('custom_zip') or loc['postal']
            query = f"Find {num_results} recent community news, city council decisions, city events and programs, local church events, and local business news/events for {location_info} (around zip {postal_info}). If news is sparse, expand search to the county and {loc['region']} state level. Include local business updates and cultural happenings."
        else:
            query = f"Find {num_results} recent news about {', '.join(keywords[:5])}"
        
        model = genai.GenerativeModel('gemini-1.5-flash', tools='google_search')
        response = model.generate_content(query)
        
        # Parse results
        articles = []
        urls = re.findall(r'https?://[^\s<>"\')]+[^\s<>"\').,]', response.text)
        
        for i, url in enumerate(urls[:num_results], 1):
            pos = response.text.find(url)
            before = response.text[max(0, pos-300):pos]
            after = response.text[pos+len(url):pos+len(url)+300]
            
            # Extract title from text before URL
            lines = [l.strip() for l in before.split('\n') if l.strip()]
            
            # Filter out common non-title lines
            filtered_lines = []
            skip_phrases = ['full url', 'url:', 'source:', 'link:', 'article:', 'here', 'http']
            for line in lines:
                line_lower = line.lower()
                if len(line) > 10 and not any(phrase in line_lower for phrase in skip_phrases):
                    filtered_lines.append(line)
            
            # Use the last good line as title
            if filtered_lines:
                title = filtered_lines[-1]
            else:
                title = f"Entertainment News Article {i}"
            
            # Clean up title
            title = title.replace('**', '').replace('*', '').replace('#', '').strip()
            
            snippet_lines = [l.strip() for l in after.split('\n') if l.strip() and len(l.strip()) > 20]
            snippet = snippet_lines[0][:200] if snippet_lines else "Recent entertainment news."
            
            # Determine category
            text = (title + " " + snippet).lower()
            article_cat = "entertainment"
            for cat in categories:
                if any(kw in text for kw in NEWS_CATEGORIES.get(cat, {}).get("keywords", [])):
                    article_cat = cat
                    break
            
            articles.append({
                'id': i,
                'title': title[:100],
                'link': url,
                'source': re.search(r'https?://(?:www\.)?([^/]+)', url).group(1) if re.search(r'https?://(?:www\.)?([^/]+)', url) else 'Source',
                'snippet': snippet,
                'category': article_cat
            })
        
        print(f"[Gemini] ✓ Found {len(articles)} articles")
        return articles, None
        
    except Exception as e:
        print(f"[Gemini] ✗ Error: {str(e)}")
        return [], f"Gemini error: {str(e)}"

# ============================================================================
# SEARCH - CLAUDE
# ============================================================================

def search_with_claude(api_key, num_results, query_filter, categories, config=None):
    """Search with Claude"""
    try:
        print(f"[Claude] Searching {num_results} articles in: {categories}")
        client = anthropic.Anthropic(api_key=api_key)
        
        # Build query
        keywords = []
        for cat in categories:
            keywords.extend(NEWS_CATEGORIES.get(cat, {}).get("keywords", []))
        
        if query_filter:
            query = f"Find {num_results} recent high-authority news articles about {query_filter}. Provide titles and URLs."
        elif len(categories) >= 6:
            # Trending Mode
            query = f"Find {num_results} top trending news stories today globally. Include major headlines in Tech, Finance, Science, Sports, Health, and Entertainment. Focus on stories that are viral or have significant impact. Provide titles and URLs for each story."
        elif 'local' in categories:
            loc = get_location_from_ip()
            location_info = (config or {}).get('custom_location') or loc['description']
            postal_info = (config or {}).get('custom_zip') or loc['postal']
            query = f"Find {num_results} recent community news, city council headlines, city events and programs, local church events, and local business news/events for {location_info} (around zip {postal_info}). If news is sparse, expand search to {loc['region']} state level. Provide titles and URLs for each significant story."
        else:
            query = f"Find {num_results} recent news articles about {', '.join(keywords[:5])}. For each article, provide the title and URL."
        
        print(f"[Claude] Query: {query}")
        
        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=2000,
            tools=[{"type": "web_search_20250305", "name": "web_search"}],
            messages=[{"role": "user", "content": query}]
        )
        
        # DEBUG: Check what blocks we got
        print(f"[Claude] Response blocks: {len(message.content)}")
        for idx, block in enumerate(message.content):
            print(f"[Claude] Block {idx}: type={block.type}")
        
        response_text = "".join(block.text for block in message.content if block.type == "text")
        
        # DEBUG: Print response info
        print(f"[Claude] Response text length: {len(response_text)} chars")
        print(f"[Claude] First 500 chars: {response_text[:500]}")
        
        # Parse results
        articles = []
        urls = re.findall(r'https?://[^\s<>"\')]+[^\s<>"\').,]', response_text)
        
        print(f"[Claude] URLs found in response: {len(urls)}")
        if urls:
            print(f"[Claude] Sample URLs: {urls[:3]}")
        else:
            print(f"[Claude] ⚠️ NO URLS FOUND - Claude may not have used web search")
            print(f"[Claude] Full response:\n{response_text}")
        
        for i, url in enumerate(urls[:num_results], 1):
            pos = response_text.find(url)
            before = response_text[max(0, pos-300):pos]
            after = response_text[pos+len(url):pos+len(url)+300]
            
            # Extract title from text before URL
            lines = [l.strip() for l in before.split('\n') if l.strip()]
            
            # Filter out common non-title lines
            filtered_lines = []
            skip_phrases = ['full url', 'url:', 'source:', 'link:', 'article:', 'here', 'http']
            for line in lines:
                line_lower = line.lower()
                # Skip if line is too short or contains skip phrases
                if len(line) > 10 and not any(phrase in line_lower for phrase in skip_phrases):
                    filtered_lines.append(line)
            
            # Use the last good line as title, or generate one
            if filtered_lines:
                title = filtered_lines[-1]
            else:
                title = f"Entertainment News Article {i}"
            
            # Clean up title - remove markdown, special chars
            title = title.replace('**', '').replace('*', '').replace('#', '').strip()
            
            snippet_lines = [l.strip() for l in after.split('\n') if l.strip() and len(l.strip()) > 20]
            snippet = snippet_lines[0][:200] if snippet_lines else "Recent entertainment news."
            
            text = (title + " " + snippet).lower()
            article_cat = "entertainment"
            for cat in categories:
                if any(kw in text for kw in NEWS_CATEGORIES.get(cat, {}).get("keywords", [])):
                    article_cat = cat
                    break
            
            articles.append({
                'id': i,
                'title': title[:100],
                'link': url,
                'source': re.search(r'https?://(?:www\.)?([^/]+)', url).group(1) if re.search(r'https?://(?:www\.)?([^/]+)', url) else 'Source',
                'snippet': snippet,
                'category': article_cat
            })
        
        if articles:
            print(f"[Claude] ✓ Found {len(articles)} articles")
            for article in articles:
                print(f"  {article['id']}. {article['title'][:60]}...")
        else:
            print(f"[Claude] ⚠️ Parsed 0 articles from response")
            return [], "No articles found. Claude may not have used web search. Try again."
        
        return articles, None
        
    except Exception as e:
        print(f"[Claude] ✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return [], f"Claude error: {str(e)}"

# ============================================================================
# CONTENT CLEANUP
# ============================================================================

def clean_blog_content(content, blog_title):
    """Remove unwanted text like 'Full URL' and clean up content"""
    
    # Remove "Full URL:" and similar patterns
    patterns_to_remove = [
        r'Full URL:\s*',
        r'Full url:\s*',
        r'FULL URL:\s*',
        r'Source URL:\s*',
        r'Article URL:\s*',
        r'Read more:\s*https?://[^\s<]+',
        r'Original article:\s*https?://[^\s<]+',
        r'\[Full URL\]\s*',
        r'\[Source\]\s*',
    ]
    
    for pattern in patterns_to_remove:
        content = re.sub(pattern, '', content, flags=re.IGNORECASE)
    
    # Remove standalone URLs that aren't in anchor tags
    # (but keep URLs that are already in <a> tags)
    content = re.sub(r'(?<!href=")(?<!src=")(https?://[^\s<>"]+)(?![^<]*</a>)', '', content)
    
    # Clean up multiple newlines
    content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)
    
    # Remove any references to source URLs in text
    content = re.sub(r'You can read (?:the full article|more) at:?\s*', '', content, flags=re.IGNORECASE)
    content = re.sub(r'Source:?\s*', '', content, flags=re.IGNORECASE)
    
    return content.strip()

# ============================================================================
# GENERATION - GEMINI
# ============================================================================

def generate_blog_with_gemini(api_key, news_item, temperature, max_tokens, writer, links):
    """Generate blog with Gemini"""
    try:
        import google.generativeai as genai
        
        print(f"[Gemini Blog {news_item['id']}] Generating as {writer['name']}...")
        genai.configure(api_key=api_key)
        
        cb_text = "\n".join([f"[CB{i+1}] {l['title']} - {l['description']}" for i, l in enumerate(links['clickbank'])])
        amz_text = "\n".join([f"[AMZ{i+1}] {l['title']} - {l['description']}" for i, l in enumerate(links['amazon'])])
        sub_text = "\n".join([f"[SUB{i+1}] {l['title']} - {l['description']}" for i, l in enumerate(links['subscriptions'])])
        
        prompt = f"""You are {writer['name']}, {writer['title']} at KnotStranded.
STYLE: {writer.get('style', 'Expert')} | VOICE: {writer.get('voice', 'Professional')}

SEO INSTRUCTIONS: 
1. Research high-volume keywords related to the topic.
2. Use a Provocative, SEO-optimized title.
3. Use semantic H2 and H3 tags.
4. Include a 150-word summary at the start (Meta info).
5. Weave in affiliate links naturally within high-value paragraphs.

Write a 2000-word deep-dive research article based on: "{news_item['title']}"
Snippet: {news_item['snippet']}

MONETIZATION (Mention each at least once):
CLICKBANK: {cb_text}
AMAZON: {amz_text}
PREMIUM SUBSCRIPTIONS: {sub_text}

Format:
TITLE: [Provocative Title]
CONTENT: [2000 words. Naturally weave in [CB1], [CB2], [AMZ1], [AMZ2], [SUB1], [SUB2]. Use headings.]"""
        
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        config = genai.GenerationConfig(temperature=float(temperature), max_output_tokens=4000)
        response = model.generate_content(prompt, generation_config=config)
        
        # Parsing logic same as before but with more placeholders
        title_match = re.search(r'TITLE:\s*(.+?)(?:\n|$)', response.text, re.IGNORECASE)
        content_match = re.search(r'CONTENT:\s*(.+)', response.text, re.IGNORECASE | re.DOTALL)
        
        title = title_match.group(1).strip() if title_match else news_item['title']
        content = content_match.group(1).strip() if content_match else response.text
        
        for i, link in enumerate(links['clickbank']):
            content = content.replace(f"[CB{i+1}]", f'<a href="{link["url"]}" class="affiliate-link cb-link">{link["title"]}</a>')
        for i, link in enumerate(links['amazon']):
            content = content.replace(f"[AMZ{i+1}]", f'<a href="{link["url"]}" class="affiliate-link amz-link">{link["title"]}</a>')
        for i, link in enumerate(links['subscriptions']):
            content = content.replace(f"[SUB{i+1}]", f'<a href="{link["url"]}" class="affiliate-link sub-link">{link["title"]}</a>')
            
        print(f"[Gemini Blog {news_item['id']}] ✓ Generated by {writer['name']}")

        return {
            'title': title,
            'content': clean_blog_content(content, title),
            'writer': writer,
            'category': news_item.get('category', 'entertainment'),
            'affiliate_links': links # Keep original links structure for consistency
        }
    except Exception as e:
        print(f"[Gemini Blog {news_item['id']}] ✗ Error: {str(e)}")
        raise

# ============================================================================
# GENERATION - CLAUDE
# ============================================================================

def generate_blog_with_claude(api_key, news_item, temperature, max_tokens, writer, links):
    """Generate blog with Claude"""
    try:
        print(f"[Claude Blog {news_item['id']}] Generating as {writer['name']}...")
        client = anthropic.Anthropic(api_key=api_key)
        
        cb_text = "\n".join([f"[CB{i+1}] {l['title']} - {l['description']}" for i, l in enumerate(links['clickbank'])])
        amz_text = "\n".join([f"[AMZ{i+1}] {l['title']} - {l['description']}" for i, l in enumerate(links['amazon'])])
        sub_text = "\n".join([f"[SUB{i+1}] {l['title']} - {l['description']}" for i, l in enumerate(links['subscriptions'])])
        
        prompt = f"""You are {writer['name']}, {writer['title']} at KnotStranded.
SEO TASK (AGGRESSIVE):
1. TARGET KEYWORDS: Identify and use the most high-volume terms for "{news_item['title']}".
2. SEMANTIC STRUCTURE: Use H2/H3 tags. Include at least 3 bulleted lists for Google snippets.
3. ENTITY LINKING: Reference other major entities (actors, companies, locations) to build a knowledge graph.
4. WORD COUNT: Write a complete 2000-word authoritative guide.
5. INTERNAL RELEVANCE: Mention other KnotStranded categories (Tech, Finance, Health) where relevant.

Topic: {news_item['title']}
Snippet: {news_item['snippet']}

AFFILIATE PRODUCTS (Insert as 'Recommended Intelligence Resources'):
CLICKBANK: {cb_text}
AMAZON: {amz_text}
SUBSCRIPTIONS: {sub_text}

FORMAT:
TITLE: [High-CTR Headline]
CONTENT: [Complete 2000-word research guide. Weave in [CB1..3], [AMZ1..3], and [SUB1..3].]"""
        
        message = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=4000,
            temperature=float(temperature),
            messages=[{"role": "user", "content": prompt}]
        )
        rt = message.content[0].text
        title = re.search(r'TITLE:\s*(.+?)(?:\n|$)', rt, re.I).group(1).strip() if re.search(r'TITLE:\s*(.+?)(?:\n|$)', rt, re.I) else news_item['title']
        content = re.search(r'CONTENT:\s*(.+)', rt, re.I | re.S).group(1).strip() if re.search(r'CONTENT:\s*(.+)', rt, re.I | re.S) else rt
        
        for i, link in enumerate(links['clickbank']):
            content = content.replace(f"[CB{i+1}]", f'<a href="{link["url"]}" class="affiliate-link cb-link">{link["title"]}</a>')
        for i, link in enumerate(links['amazon']):
            content = content.replace(f"[AMZ{i+1}]", f'<a href="{link["url"]}" class="affiliate-link amz-link">{link["title"]}</a>')
        for i, link in enumerate(links['subscriptions']):
            content = content.replace(f"[SUB{i+1}]", f'<a href="{link["url"]}" class="affiliate-link sub-link">{link["title"]}</a>')
            
        print(f"[Claude Blog {news_item['id']}] ✓ Generated by {writer['name']}")

        return {
            'title': title,
            'content': clean_blog_content(content, title),
            'writer': writer,
            'category': news_item.get('category', 'entertainment'),
            'affiliate_links': links # Keep original links structure for consistency
        }
    except Exception as e:
        print(f"[Claude Blog {news_item['id']}] ✗ Error: {str(e)}")
        raise

# ============================================================================
# GENERATION - CHATGPT
# ============================================================================

def generate_blog_with_chatgpt(api_key, news_item, temperature, max_tokens, writer, clickbank_links):
    """Generate blog with ChatGPT"""
    try:
        import openai
        
        print(f"[ChatGPT Blog {news_item['id']}] Generating as {writer['name']}...")
        openai.api_key = api_key
        
        links_text = "\n".join([f"[LINK{i+1}] {l['title']} - {l['description']}" for i, l in enumerate(clickbank_links)])
        
        prompt = f"""You are {writer['name']}, {writer['title']} at KnotStranded.

STYLE: {writer.get('style', 'Engaging')}

News: {news_item['title']}
{news_item['snippet']}

LINKS (mention naturally):
{links_text}

Format:
TITLE: [Title]
CONTENT: [500-700 words with 3 links: "For readers, [LINK1]..." Be opinionated.]"""
        
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": f"You are {writer['name']}."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=int(max_tokens),
            temperature=float(temperature)
        )
        
        response_text = response.choices[0].message.content
        title_match = re.search(r'TITLE:\s*(.+?)(?:\n|$)', response_text, re.IGNORECASE)
        content_match = re.search(r'CONTENT:\s*(.+)', response_text, re.IGNORECASE | re.DOTALL)
        
        title = title_match.group(1).strip() if title_match and content_match else news_item['title']
        content = content_match.group(1).strip() if title_match and content_match else response.text
        
        for i, link in enumerate(clickbank_links):
            content = content.replace(f"[LINK{i+1}]", f'<a href="{link["url"]}" target="_blank" rel="nofollow sponsored">{link["title"]}</a>')
        
        # Clean up content (remove "Full URL" and unwanted text)
        content = clean_blog_content(content, title)
        
        print(f"[ChatGPT Blog {news_item['id']}] ✓ Generated by {writer['name']}")
        
        return {
            'title': title,
            'content': content,
            'writer': writer,
            'category': news_item.get('category', 'entertainment'),
            'affiliate_links': clickbank_links
        }
    except Exception as e:
        print(f"[ChatGPT Blog {news_item['id']}] ✗ Error: {str(e)}")
        raise

# ============================================================================
# IMAGE GENERATION
# ============================================================================

def generate_featured_image(api_key, title, blog_id, category='entertainment'):
    """Generate image with DALL-E with category-aware prompts"""
    try:
        import openai
        
        print(f"[Image {blog_id}] Generating ({category})...")
        openai.api_key = api_key
        
        # Category-specific visual styles
        styles = {
            "tech": "Futuristic, sleek, digital innovation aesthetic, high-tech neon accents",
            "finance": "Professional, data-driven, clean minimalism, sophisticated corporate colors",
            "health": "Natural, organic, bright and airy, wellness-focused sanctuary vibes",
            "lifestyle": "Vibrant, trendy, warm lighting, cozy and aesthetic arrangement",
            "science": "Cosmic, micro-detailed, scientific discovery atmosphere, intriguing and accurate",
            "sports": "Action-oriented, dynamic motion blur, high-energy stadium atmosphere",
            "local": "Community-focused, warm neighborhood vibe, authentic and welcoming",
            "gaming": "Cyberpunk, immersive, high-contrast gaming environment, vibrant RGB lighting",
            "books": "Classic, literary, deep wood textures, cozy library or artistic cover style",
            "movies": "Cinematic, film-noir or blockbuster lighting, dramatic composition",
            "music": "Rhythmic, audio-visual, abstract sound waves or artistic performance style"
        }
        
        style_desc = styles.get(category, "Cinematic, elegant editorial style")
        prompt = f"Professional editorial illustration for a {category} article: '{title}'. Style: {style_desc}. High-resolution, artistic, no text."
        
        response = openai.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1792x1024",
            quality="standard",
            n=1
        )
        
        # Download image
        img_url = response.data[0].url
        img_data = requests.get(img_url, timeout=30)
        
        if img_data.status_code == 200:
            os.makedirs('generated_posts', exist_ok=True)
            filename = f"featured_{blog_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            filepath = os.path.join('generated_posts', filename)
            
            with open(filepath, 'wb') as f:
                f.write(img_data.content)
            
            print(f"[Image {blog_id}] ✓ Saved")
            return filepath
        
        return None
    except Exception as e:
        print(f"[Image {blog_id}] ✗ Error: {str(e)}")
        return None
# ============================================================================
# SQUARESPACE INTEGRATION
# ============================================================================

def post_to_squarespace(config, blog_data):
    """Post to Squarespace"""
    try:
        api_key = config.get('squarespace_api_key')
        site_id = config.get('squarespace_site_id')
        collection_id = config.get('squarespace_collection_id')
        
        if not all([api_key, site_id, collection_id]):
            return False, "Missing Squarespace config"
        
        print(f"[Squarespace] Posting: {blog_data['title'][:50]}...")
        
        # Squarespace Blog Post API
        # endpoint: POST /1.0/sites/{siteId}/blog/{collectionId}/posts
        url = f"https://api.squarespace.com/1.0/sites/{site_id}/blog/{collection_id}/posts"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "KnotStranded-Generator/1.0"
        }
        
        # Format the body for Squarespace
        post_data = {
            "title": blog_data['title'],
            "body": blog_data['html_content'],
            "categories": [blog_data.get('category', 'News')],
            "tags": blog_data.get('tags', []),
            "publishOn": datetime.now().isoformat()
        }
        
        # If we have an image URL from DALL-E, Squarespace can fetch it
        if blog_data.get('featured_image'):
            # Convert local path to temporary public URL if needed, 
            # but usually Squarespace wants a public URL.
            # Local images won't work unless the site is live.
            pass
            
        response = requests.post(url, headers=headers, json=post_data, timeout=30)
        
        if response.status_code in [200, 201]:
            full_url = response.json().get('fullUrl', 'Posted')
            print(f"[Squarespace] ✓ Posted!")
            return True, full_url
        else:
            error = f"API {response.status_code}: {response.text[:200]}"
            print(f"[Squarespace] ✗ {error}")
            return False, error
            
    except Exception as e:
        print(f"[Squarespace] ✗ Error: {str(e)}")
        return False, str(e)

# ============================================================================
# HTML GENERATION
# ============================================================================

def create_styled_html(blog_data, news_metadata, provider_name, featured_image=None):
    """Create a world-class editorial HTML page for the blog post"""
    title = blog_data['title']
    content = blog_data['content']
    writer = blog_data['writer']
    
    writer_name = writer['name']
    writer_title = writer['title']
    writer_bio = writer.get('bio', 'Senior Correspondent at KnotStranded.')
    
    # Convert markdown-style content to HTML
    formatted_content = content
    if "<p>" not in content:
        paragraphs = content.split('\n\n')
        formatted_content = "".join([f"<p>{p.strip()}</p>" for p in paragraphs if p.strip()])
    
    # Advanced Typography & Callouts
    formatted_content = re.sub(r'<h2>(.*?)</h2>', r'<h2 class="editorial-heading">\1</h2>', formatted_content)
    formatted_content = re.sub(r'<h3>(.*?)</h3>', r'<h3 class="editorial-subheading">\1</h3>', formatted_content)
    
    # Style affiliate links as native recommendation cards
    def replace_affiliate_card(match):
        url, classes, title = match.groups()
        btn_text = "Get Access" if "sub-link" in classes else "Check Price"
        label = "Premium Access" if "sub-link" in classes else "Editor's Choice"
        return f'''<div class="product-recommendation {"subscription-card" if "sub-link" in classes else ""}">
                <div class="rec-label">{label}</div>
                <div class="rec-content">
                    <div class="rec-info">
                        <span class="rec-title">{title}</span>
                    </div>
                    <a href="{url}" target="_blank" class="rec-button">{btn_text}</a>
                </div>
            </div>'''

    formatted_content = re.sub(
        r'<a href="(.*?)" class="affiliate-link (.*?)">(.*?)</a>',
        replace_affiliate_card,
        formatted_content
    )

    img_html = f'<div class="hero-image-container"><img src="{featured_image}" class="hero-image" alt="{title}"></div>' if featured_image else ''

    base_url = request.host_url.rstrip('/')
    meta_description = re.sub(r'<.*?>', '', formatted_content)[:160].replace('"', "'")
    post_slug = title.lower().replace(' ', '-')
    canonical_url = f"{base_url}/post/{blog_data.get('filename', post_slug + '.html')}"
    publish_date = datetime.now().strftime('%Y-%m-%dT%H:%M:%S+00:00')

    # SEO SCHEMA (JSON-LD)
    schema_json = json.dumps({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "image": [f"{base_url}/{featured_image}" if featured_image else f"{base_url}/assets/banner.jpg"],
        "datePublished": publish_date,
        "dateModified": publish_date,
        "author": [{
            "@type": "Person",
            "name": writer_name,
            "jobTitle": writer_title,
            "url": base_url
        }],
        "publisher": {
            "@type": "Organization",
            "name": "KnotStranded Intelligence",
            "logo": {
                "@type": "ImageObject",
                "url": f"{base_url}/assets/logo.png"
            }
        },
        "description": meta_description,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonical_url
        }
    })

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | KnotStranded</title>
    <meta name="description" content="{meta_description}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="{canonical_url}">
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {schema_json}
    </script>
    <style>
        :root {{
            --primary: #000000;
            --accent: #4f46e5;
            --text-main: #1a1a1a;
            --text-body: #2c2c2c;
            --bg-body: #ffffff;
            --max-width: 740px;
        }}
        
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: 'Inter', -apple-system, blinkmacsystemfont, sans-serif;
            background: var(--bg-body);
            color: var(--text-main);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }}

        /* Header / Nav Area */
        .site-nav {{
            padding: 2rem;
            display: flex;
            justify-content: center;
            border-bottom: 1px solid #eee;
            margin-bottom: 4rem;
        }}
        .site-logo {{
            font-family: 'Fraunces', serif;
            font-weight: 900;
            font-size: 1.5rem;
            text-decoration: none;
            color: black;
            font-variant: small-caps;
            letter-spacing: -1px;
        }}

        /* Main Article Layout */
        .article-header {{
            max-width: 900px;
            margin: 0 auto 4rem;
            padding: 0 2rem;
            text-align: center;
        }}

        .kicker {{
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: var(--accent);
            margin-bottom: 1.5rem;
        }}

        h1 {{
            font-family: 'Fraunces', serif;
            font-size: clamp(2.5rem, 8vw, 4.5rem);
            font-weight: 800;
            line-height: 0.95;
            letter-spacing: -3px;
            margin-bottom: 2rem;
            color: #000;
        }}

        .author-meta {{
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
            font-size: 13px;
            font-weight: 600;
            color: #666;
        }}
        .author-meta span {{ color: #000; font-weight: 800; }}

        .hero-image-container {{
            max-width: 1200px;
            margin: 0 auto 5rem;
            padding: 0 2rem;
        }}
        .hero-image {{
            width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        }}

        .article-content {{
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 2rem;
            font-family: 'Inter', sans-serif;
            font-size: 1.25rem;
            color: var(--text-body);
            line-height: 1.8;
        }}

        .article-content p {{ margin-bottom: 2.5rem; }}

        .editorial-heading {{
            font-family: 'Fraunces', serif;
            font-size: 2.25rem;
            font-weight: 800;
            margin: 5rem 0 2rem;
            line-height: 1.1;
            letter-spacing: -1px;
        }}

        .editorial-subheading {{
            font-family: 'Fraunces', serif;
            font-size: 1.5rem;
            font-weight: 700;
            margin: 3rem 0 1.5rem;
        }}

        /* High-End Affiliate Callouts */
        .product-recommendation {{
            background: #fdf6f0;
            border: 2px solid #000;
            margin: 4rem 0;
            padding: 2rem;
            position: relative;
        }}
        .rec-label {{
            position: absolute;
            top: -12px;
            left: 24px;
            background: #000;
            color: #fff;
            padding: 4px 12px;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }}
        .rec-content {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 2rem;
        }}
        .rec-title {{
            font-family: 'Fraunces', serif;
            font-size: 1.25rem;
            font-weight: 800;
        }}
        .rec-button {{
            background: #000;
            color: #fff;
            text-decoration: none;
            padding: 12px 24px;
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            transition: transform 0.2s;
        }}
        .rec-button:hover { transform: translateY(-2px); }

        .subscription-card {
            background: #f0f4ff;
            border-color: #4f46e5;
        }
        .subscription-card .rec-label { background: #4f46e5; }
        .subscription-card .rec-button { background: #4f46e5; }

        /* Author Bio Block */
        .author-card {{
            max-width: var(--max-width);
            margin: 8rem auto;
            padding: 4rem 2rem;
            border-top: 1px solid #eee;
            display: flex;
            gap: 2rem;
            align-items: flex-start;
        }}
        .author-avatar {{
            width: 80px;
            height: 80px;
            background: #000;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Fraunces', serif;
            font-size: 2rem;
            font-weight: 900;
            flex-shrink: 0;
        }}
        .author-info h4 {{ font-size: 14px; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem; }}
        .author-info p {{ font-size: 15px; color: #666; line-height: 1.5; }}

        /* Responsive */
        @media (max-width: 640px) {{
            h1 {{ font-size: 3rem; letter-spacing: -2px; }}
            .rec-content {{ flex-direction: column; align-items: flex-start; gap: 1rem; }}
        }}
    </style>
</head>
<body>
    <nav class="site-nav"><a href="/" class="site-logo">KnotStranded</a></nav>

    <article>
        <header class="article-header">
            <div class="kicker">Viral Intelligence Report</div>
            <h1>{title}</h1>
            <div class="author-meta">
                <span>{writer_name}</span> &centerdot; {datetime.now().strftime('%B %d, %Y')} &centerdot; 5 min read
            </div>
        </header>

        {img_html}

        <div class="article-content">
            {formatted_content}
        </div>

        <section class="author-card">
            <div class="author-avatar">{writer_name[0]}</div>
            <div class="author-info">
                <h4>Written by {writer_name}</h4>
                <p>{writer_bio}</p>
            </div>
        </section>
    </article>

    <footer style="padding: 10rem 2rem; text-align: center; background: #fafafa; border-top: 1px solid #eee;">
        <div class="site-logo" style="margin-bottom: 1.5rem;">KnotStranded</div>
        <p style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.1em;">© 2026 Viral Intelligence Group. All rights reserved.</p>
    </footer>
</body>
</html>"""
    return html

# ============================================================================
# RETRY LOGIC
# ============================================================================

def search_with_retry(config, max_retries=2):
    """Search with retry"""
    provider = config.get('ai_provider', 'claude')
    num = int(config.get('num_articles', 5))
    query = config.get('query_filter', '')
    cats = config.get('selected_categories', ['movies', 'tv'])
    
    for attempt in range(max_retries):
        try:
            if provider == 'gemini':
                return search_with_gemini(config['gemini_api_key'], num, query, cats, config)
            else:
                return search_with_claude(config['anthropic_api_key'], num, query, cats, config)
        except:
            if attempt < max_retries - 1:
                time.sleep(5)
    return [], "Search failed"

def generate_blog_with_retry(config, news_item, writer, clickbank_links, max_retries=3):
    """Generate with retry"""
    provider = config.get('ai_provider', 'claude')
    
    for attempt in range(max_retries):
        try:
            if provider == 'chatgpt':
                return generate_blog_with_chatgpt(config['openai_api_key'], news_item, config['temperature'], config['max_tokens'], writer, clickbank_links)
            elif provider == 'gemini':
                return generate_blog_with_gemini(config['gemini_api_key'], news_item, config['temperature'], config['max_tokens'], writer, clickbank_links)
            else:
                return generate_blog_with_claude(config['anthropic_api_key'], news_item, config['temperature'], config['max_tokens'], writer, clickbank_links)
        except anthropic.RateLimitError:
            if attempt < max_retries - 1:
                time.sleep((attempt + 1) * 20)
            else:
                raise Exception("Rate limit")
        except:
            if attempt < max_retries - 1:
                time.sleep(5)
            else:
                raise

# ============================================================================
# DUPLICATE PREVENTION SYSTEM
# ============================================================================

def get_recent_history(days=7):
    """Scan generated posts from the last N days to build a topic database"""
    history = []
    if not os.path.exists('generated_posts'):
        return []
        
    cutoff = datetime.now() - timedelta(days=days)
    
    for filename in os.listdir('generated_posts'):
        if filename.endswith('.html'):
            filepath = os.path.join('generated_posts', filename)
            mtime = datetime.fromtimestamp(os.path.getmtime(filepath))
            
            if mtime > cutoff:
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        title_match = re.search(r'<h1>(.*?)</h1>', content)
                        if title_match:
                            history.append({
                                'title': title_match.group(1).lower(),
                                'date': mtime
                            })
                except:
                    continue
    return history

def is_duplicate_subject(new_title, history):
    """
    Checks if a new title overlaps significantly with recent history.
    Uses basic keyword overlap (excluding common stop words).
    """
    new_title = new_title.lower()
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'about', 'is', 'are', 'was', 'were', 'new', 'latest', 'recent', 'exclusive'}
    
    new_words = set(re.findall(r'\w+', new_title)) - stop_words
    
    if len(new_words) < 2: return False # Title too short to reliably check
    
    for record in history:
        old_words = set(re.findall(r'\w+', record['title'])) - stop_words
        overlap = new_words.intersection(old_words)
        
        # If 60% of keywords match, it's probably the same subject
        if len(overlap) >= (len(new_words) * 0.6):
            return True
            
    return False

# ============================================================================
# AUTO-PILOT SCHEDULER (Daily Updates)
# ============================================================================

def auto_pilot_worker():
    """Background task that runs on a schedule: 
    - Politics: 6 AM and 12 PM
    - Others: 6 AM
    """
    print("\n[Auto-Pilot] Scheduled Engine Initialized.")
    print("[Auto-Pilot] Monitoring: Politics (06:00, 12:00) | All Others (06:00)")
    
    last_run_hour = -1
    
    while True:
        try:
            now = datetime.now()
            current_hour = now.hour
            current_minute = now.minute
            
            config = load_config()
            if config.get('auto_pilot') == 'enabled':
                run_categories = []
                
                # Check for 6 AM trigger
                if current_hour == 6 and last_run_hour != current_hour:
                    print(f"\n[Auto-Pilot] {now.strftime('%H:%M')} - Triggering Full Daily Update (All Categories)...")
                    run_categories = config.get('selected_categories', list(NEWS_CATEGORIES.keys()))
                    last_run_hour = current_hour
                
                # Check for 12 PM trigger (Politics only)
                elif current_hour == 12 and last_run_hour != current_hour:
                    print(f"\n[Auto-Pilot] {now.strftime('%H:%M')} - Triggering Mid-Day Political Update...")
                    if 'politics' in config.get('selected_categories', []):
                        run_categories = ['politics']
                    last_run_hour = current_hour

                if run_categories:
                    # 1. Search for trending news for these categories
                    provider = config.get('ai_provider', 'claude')
                    num = int(config.get('num_articles', 3))
                    
                    if provider == 'claude':
                        items, err = search_with_claude(config['anthropic_api_key'], num, "", run_categories, config)
                    elif provider == 'gemini':
                        items, err = search_with_gemini(config['gemini_api_key'], num, "", run_categories, config)
                    else:
                        items, err = search_with_gpt(config['openai_api_key'], num, "", run_categories)
                    
                    if items:
                        print(f"[Auto-Pilot] Found {len(items)} trending stories. Filtering duplicates...")
                        history = get_recent_history(days=7)
                        filtered_items = []
                        for item in items:
                            if not is_duplicate_subject(item['title'], history):
                                filtered_items.append(item)
                            else:
                                print(f"[Auto-Pilot] ⚠ Skipping Duplicate: {item['title'][:40]}...")
                        
                        if filtered_items:
                            generation_state['news_items'] = filtered_items
                            ids = [item['id'] for item in filtered_items]
                            generation_worker(config, ids) 
                            
                            if config.get('auto_post_squarespace') == 'enabled':
                                for file_data in generation_state['generated_files'][-len(filtered_items):]:
                                    post_to_squarespace(config, file_data)
                            
                            print(f"[Auto-Pilot] ✓ Scheduled Update Complete.")
                        else:
                            print("[Auto-Pilot] No new stories found after deduplication.")
            else:
                # Reset last_run_hour if disabled so it can run immediately when re-enabled if in time
                if last_run_hour != -2:
                    print("[Auto-Pilot] Sleeping (Mode: Disabled)")
                    last_run_hour = -2
                
        except Exception as e:
            print(f"[Auto-Pilot] Error in scheduler: {str(e)}")
            
        # Wait 60 seconds before checking again
        time.sleep(60)

# ============================================================================
# GENERATION WORKER
# ============================================================================

generation_state = {
    'status': 'idle',
    'progress': 0,
    'total': 0,
    'current_article': '',
    'news_items': [],
    'generated_files': [],
    'posting_status': {}, # filename: {success, url, error}
    'error': None,
    'ai_used': None
}

def load_subscribers():
    if os.path.exists(SUBSCRIBERS_FILE):
        with open(SUBSCRIBERS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_subscribers(subs):
    with open(SUBSCRIBERS_FILE, 'w') as f:
        json.dump(subs, f, indent=2)

def send_demo_email(to_email, subject, body):
    """Placeholder for real email sending logic (SendGrid/SMTP)"""
    print(f"\n[EMAIL SIMULATOR] To: {to_email}")
    print(f"[EMAIL SIMULATOR] Subject: {subject}")
    print(f"[EMAIL SIMULATOR] Content: {body[:100]}...")
    return True

def generation_worker(config, selected_ids):
    """Background generation"""
    global generation_state
    
    try:
        items = [item for item in generation_state['news_items'] if item['id'] in selected_ids]
        if not items:
            generation_state['status'] = 'error'
            generation_state['error'] = "No articles selected"
            return
        
        provider = config.get('ai_provider', 'claude')
        print(f"\n{'='*60}")
        print(f"GENERATING {len(items)} BLOGS WITH {provider.upper()}")
        print(f"{'='*60}")
        
        generation_state['status'] = 'generating'
        generation_state['total'] = len(items)
        generation_state['ai_used'] = provider.title()
        
        os.makedirs('generated_posts', exist_ok=True)
        
        for i, news_item in enumerate(items, 1):
            generation_state['progress'] = i
            generation_state['current_article'] = news_item['title']
            
            print(f"\n[{i}/{len(items)}] {news_item['title'][:50]}...")
            
            writer = select_random_writer()
            print(f"[{i}/{len(items)}] Writer: {writer['name']}")
            
            category = news_item.get('category', 'entertainment')
            
            try:
                links = get_affiliate_links(category)
                blog_result = generate_blog_with_retry(config, news_item, writer, links)
                
                featured_image = None
                if config.get('openai_api_key'):
                    featured_image = generate_featured_image(config['openai_api_key'], blog_result['title'], news_item['id'], category)
                
                html = create_styled_html(blog_result, news_item, provider.title(), featured_image)
                tags = generate_tags(category)
                
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"blog_{news_item['id']}_{timestamp}.html"
                filepath = os.path.join('generated_posts', filename)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(html)
                
                generation_state['generated_files'].append({
                    'filename': filename,
                    'title': blog_result['title'],
                    'filepath': filepath,
                    'html_content': html,
                    'writer': writer['name'],
                    'category': category,
                    'tags': tags,
                    'featured_image': featured_image
                })
                
                print(f"[{i}/{len(items)}] ✓ Saved by {writer['name']}")
                
                if i < len(items):
                    time.sleep(2)
                    
            except Exception as e:
                print(f"[{i}/{len(items)}] ✗ Error: {str(e)}")
                if 'rate' in str(e).lower():
                    generation_state['status'] = 'error'
                    generation_state['error'] = "Rate limit. Wait 60s."
                    return
        
        generation_state['status'] = 'complete'
        print(f"\n{'='*60}")
        print(f"✓ COMPLETED {len(generation_state['generated_files'])} BLOGS!")
        print(f"{'='*60}\n")
        
    except Exception as e:
        generation_state['status'] = 'error'
        generation_state['error'] = str(e)
        print(f"\n✗ Error: {str(e)}\n")

# ============================================================================
# AUTHENTICATION
# ============================================================================

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Unauthorized'}), 401
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['password'] == ADMIN_PASSWORD:
            session['logged_in'] = True
            next_url = request.args.get('next') or url_for('dashboard_portal')
            return redirect(next_url)
        else:
            error = 'Invalid password. Please try again.'
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('home'))

# ============================================================================
# FLASK ROUTES
# ============================================================================

@app.route('/')
def home():
    """Serve a clean blog index as a portal with 48h archiving logic"""
    # Structure: categories[cat_id] = {'active': [], 'archived': []}
    posts_by_category = {cat: {'active': [], 'archived': []} for cat in NEWS_CATEGORIES.keys()}
    latest_posts = []
    
    archive_threshold = 48 * 3600 # 48 hours in seconds
    now_ts = time.time()
    
    if os.path.exists('generated_posts'):
        filenames = sorted(os.listdir('generated_posts'), key=lambda x: os.path.getmtime(os.path.join('generated_posts', x)), reverse=True)
        
        for filename in filenames:
            if filename.endswith('.html'):
                filepath = os.path.join('generated_posts', filename)
                try:
                    mtime = os.path.getmtime(filepath)
                    age = now_ts - mtime
                    is_archived = age > archive_threshold
                    
                    with open(filepath, 'r') as f:
                        content = f.read()
                        title = re.search(r'<h1>(.*?)</h1>', content).group(1) if re.search(r'<h1>(.*?)</h1>', content) else filename
                        date_match = re.search(r'• (.*?) &centerdot;', content)
                        date = date_match.group(1) if date_match else "Recent"
                        
                        # Extract featured image
                        img_match = re.search(r'src="(static/img/.*?)"', content)
                        img = img_match.group(1) if img_match else None
                        
                        # Find category
                        cat = "movies"
                        for c in NEWS_CATEGORIES.keys():
                            if c in filename.lower():
                                cat = c
                                break
                        
                        post_data = {
                            'filename': filename,
                            'title': title,
                            'date': date,
                            'img': img,
                            'category': cat,
                            'category_name': NEWS_CATEGORIES[cat]['name']
                        }
                        
                        if not is_archived and len(latest_posts) < 6:
                            latest_posts.append(post_data)
                        
                        if is_archived:
                            posts_by_category[cat]['archived'].append(post_data)
                        else:
                            posts_by_category[cat]['active'].append(post_data)
                except:
                    continue
    
    return render_template('landing.html', 
                          latest_posts=latest_posts, 
                          categories=posts_by_category, 
                          tips=DAILY_TIPS,
                          cat_info=NEWS_CATEGORIES)

@app.route('/blog_generator_hero.png')
def send_hero():
    return send_from_directory('.', 'blog_generator_hero.png')

@app.route('/dashboard')
@login_required
def dashboard_portal():
    return render_template('dashboard_v2.html')

@app.route('/assets/<path:path>')
def send_assets(path):
    return send_from_directory('webapp/dist/assets', path)

@app.route('/vite.svg')
def send_vite_svg():
    return send_from_directory('webapp/dist', 'vite.svg')

@app.route('/post/<filename>')
def view_post(filename):
    """View a specific post"""
    return send_from_directory('generated_posts', filename)

@app.route('/robots.txt')
def robots():
    return """User-agent: *
Allow: /
Sitemap: http://localhost:5000/sitemap.xml
""", 200, {'Content-Type': 'text/plain'}

@app.route('/sitemap.xml')
def sitemap():
    pages = []
    base_url = request.host_url.rstrip('/')
    # Dynamic pages
    pages.append({'loc': f'{base_url}/', 'lastmod': datetime.now().strftime('%Y-%m-%d')})
    
    if os.path.exists('generated_posts'):
        for filename in os.listdir('generated_posts'):
            if filename.endswith('.html'):
                filepath = os.path.join('generated_posts', filename)
                mtime = datetime.fromtimestamp(os.path.getmtime(filepath)).strftime('%Y-%m-%d')
                pages.append({'loc': f'{base_url}/post/{filename}', 'lastmod': mtime})
    
    sitemap_xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for page in pages:
        sitemap_xml += f"  <url>\n    <loc>{page['loc']}</loc>\n    <lastmod>{page['lastmod']}</lastmod>\n    <changefreq>daily</changefreq>\n  </url>\n"
    sitemap_xml += '</urlset>'
    
    return sitemap_xml, 200, {'Content-Type': 'application/xml'}
@app.route('/api/config', methods=['GET'])
@login_required
def get_config():
    config = load_config()
    # Add geolocation hints if not present
    loc = get_location_from_ip()
    config['detected_location'] = loc['description']
    config['postal_hint'] = loc['postal']
    return jsonify(config)

@app.route('/api/config', methods=['POST'])
@login_required
def save_config_route():
    return jsonify({'success': save_config(request.json)})

@app.route('/api/categories', methods=['GET'])
@login_required
def get_categories():
    return jsonify({'categories': [{"id": k, "name": v["name"]} for k, v in NEWS_CATEGORIES.items()]})

@app.route('/api/clickbank-products', methods=['GET'])
@login_required
def get_clickbank_products():
    """Get ClickBank products organized by category"""
    products_by_category = {}
    
    for category_id, category_data in NEWS_CATEGORIES.items():
        products = CLICKBANK_PRODUCTS.get(category_id, CLICKBANK_PRODUCTS.get("default", []))
        
        # Check if products are placeholders
        products_with_status = []
        for product in products:
            is_placeholder = "YOURVENDOR" in product["url"] or "l4j4n" in product["url"]
            products_with_status.append({
                "title": product["title"],
                "description": product["description"],
                "url": product["url"],
                "is_placeholder": is_placeholder
            })
        
        products_by_category[category_id] = {
            "category_name": category_data["name"],
            "products": products_with_status
        }
    
    return jsonify(products_by_category)

@app.route('/api/search', methods=['POST'])
@login_required
def search():
    config = request.json
    save_config(config)
    
    generation_state['news_items'] = []
    generation_state['generated_files'] = []
    
    articles, error = search_with_retry(config)
    
    if error:
        return jsonify({'error': error}), 400
    
    generation_state['news_items'] = articles
    return jsonify({'news_items': articles, 'ai_used': config.get('ai_provider', 'claude').title()})

@app.route('/api/generate', methods=['POST'])
@login_required
def generate():
    data = request.json
    save_config(data['config'])
    
    generation_state['status'] = 'idle'
    generation_state['progress'] = 0
    generation_state['error'] = None
    generation_state['generated_files'] = []
    
    thread = threading.Thread(target=generation_worker, args=(data['config'], data['selected_ids']))
    thread.daemon = True
    thread.start()
    
    return jsonify({'status': 'started'})

@app.route('/api/status', methods=['GET'])
@login_required
def status():
    return jsonify(generation_state)

@app.route('/api/post-to-squarespace', methods=['POST'])
@login_required
def api_post_to_squarespace():
    """Post to Squarespace API endpoint"""
    try:
        data = request.json
        filename = data['filename']
        config = data['config']
        
        blog_data = next((f for f in generation_state['generated_files'] if f['filename'] == filename), None)
        if not blog_data:
            return jsonify({'success': False, 'error': 'Blog not found locally'}), 404
        
        success, result = post_to_squarespace(config, blog_data)
        
        # Save status
        generation_state['posting_status'][filename] = {
            'success': success,
            'url': result if success else None,
            'error': result if not success else None
        }
        
        return jsonify({
            'success': success,
            'url': result if success else None,
            'error': result if not success else None
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/download/<filename>')
def download(filename):
    filepath = os.path.join('generated_posts', filename)
    if os.path.exists(filepath):
        return send_file(filepath, as_attachment=True)
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/view/<filename>')
def view(filename):
    filepath = os.path.join('generated_posts', filename)
    if os.path.exists(filepath):
        return send_file(filepath)
    return jsonify({'error': 'Not found'}), 404


# ============================================================================
# NEWSLETTER & SUBSCRIBERS
# ============================================================================

@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    data = request.json
    email = data.get('email')
    if not email or '@' not in email:
        return jsonify({'success': False, 'error': 'Invalid email'}), 400
    
    subs = load_subscribers()
    if email in [s['email'] for s in subs]:
        return jsonify({'success': True, 'message': 'Already subscribed'})
    
    subs.append({
        'email': email,
        'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'status': 'active'
    })
    save_subscribers(subs)
    return jsonify({'success': True, 'message': 'Subscribed successfully'})

@app.route('/api/subscribers')
@login_required
def get_subscribers():
    return jsonify({'subscribers': load_subscribers()})

@app.route('/api/push-newsletter', methods=['POST'])
@login_required
def push_newsletter():
    """Generate and 'send' a daily recap newsletter to all subscribers"""
    subs = load_subscribers()
    if not subs:
        return jsonify({'success': False, 'error': 'No subscribers found'})
    
    # Get latest articles
    history = get_recent_history(days=1)
    if not history:
        return jsonify({'success': False, 'error': 'No new articles to recap today'})
    
    recap_html = "<h1>Today's Intelligence Briefing</h1><ul>"
    for item in history[:5]:
        recap_html += f"<li><strong>{item['title']}</strong></li>"
    recap_html += "</ul><p>Read more at KnotStranded.com</p>"
    
    success_count = 0
    for sub in subs:
        if sub['status'] == 'active':
            if send_demo_email(sub['email'], "KnotStranded Daily Recap", recap_html):
                success_count += 1
                
    return jsonify({
        'success': True, 
        'message': f'Newsletter pushed to {success_count} subscribers',
        'articles_recapitulated': len(history[:5])
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("\n" + "="*70)
    print(" KNOTSTRANDED BLOG GENERATOR - PRODUCTION READY")
    print("="*70)
    print(f"\n🌐 Server: http://0.0.0.0:{port}")
    print("="*70 + "\n")
    
    # Start Auto-Pilot Thread
    ap_thread = threading.Thread(target=auto_pilot_worker, daemon=True)
    ap_thread.start()
    
    app.run(debug=False, host='0.0.0.0', port=port)
