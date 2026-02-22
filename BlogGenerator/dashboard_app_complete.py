#!/usr/bin/env python3
"""
KnotStranded Blog Generator - Complete Ultimate Edition
Categories + ChatGPT + Images + ClickBank + Squarespace Posting
"""

from flask import Flask, render_template, request, jsonify, send_file
import os
import json
from datetime import datetime
import anthropic
import threading
import re
import time
import random
import requests

app = Flask(__name__)
CONFIG_FILE = 'config.json'

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
    }
}

# ============================================================================
# CLICKBANK PRODUCTS
# ============================================================================
# IMPORTANT: Replace these URLs with your actual ClickBank affiliate links!
# Format: https://[vendor].vendor.hop.clickbank.net/?affiliate=[YOUR_AFFILIATE_ID]

CLICKBANK_PRODUCTS = {
    "movies": [
        {
            "title": "Ultimate Streaming Guide",
            "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=YOURID",
            "description": "comprehensive streaming platform guide"
        },
        {
            "title": "Cinematography Masterclass",
            "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=YOURID",
            "description": "film appreciation course"
        },
        {
            "title": "Home Theater Setup",
            "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=YOURID",
            "description": "home entertainment system"
        }
    ],
    "tv": [
        {
            "title": "TV Series Database",
            "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=YOURID",
            "description": "complete series guide"
        },
        {
            "title": "Streaming Optimizer",
            "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=YOURID",
            "description": "streaming service comparison"
        },
        {
            "title": "Binge Guide Pro",
            "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=YOURID",
            "description": "TV recommendation engine"
        }
    ],
    "music": [
        {
            "title": "Music Production Mastery",
            "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=YOURID",
            "description": "music creation course"
        },
        {
            "title": "Concert Finder Pro",
            "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=YOURID",
            "description": "live music tracker"
        },
        {
            "title": "Music Theory Complete",
            "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=YOURID",
            "description": "music education"
        }
    ],
    "celebrity": [
        {
            "title": "Celebrity Style Guide",
            "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=YOURID",
            "description": "fashion course"
        },
        {
            "title": "Entertainment News Pro",
            "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=YOURID",
            "description": "news aggregator"
        },
        {
            "title": "Social Influence Course",
            "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=YOURID",
            "description": "influencer training"
        }
    ],
    "default": [
        {
            "title": "Entertainment Insider",
            "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=YOURID",
            "description": "industry guide"
        },
        {
            "title": "Pop Culture Toolkit",
            "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=YOURID",
            "description": "analysis resource"
        },
        {
            "title": "Media Discovery Tool",
            "url": "https://YOURVENDOR.hop.clickbank.net/?affiliate=YOURID",
            "description": "content finder"
        }
    ]
}

def get_clickbank_links(category, num_links=3):
    """Get ClickBank links for category"""
    products = CLICKBANK_PRODUCTS.get(category, CLICKBANK_PRODUCTS["default"])
    return random.sample(products, min(num_links, len(products)))

def generate_tags(category):
    """Generate 3 tags for category"""
    tags = NEWS_CATEGORIES.get(category, {}).get("tags", ["entertainment", "news", "culture"])
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
    """Load config"""
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                return json.loads(f.read().strip() or '{}')
        except:
            return {}
    return {}

def save_config(config):
    """Save config"""
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
        return True
    except:
        return False

# ============================================================================
# SEARCH - GEMINI
# ============================================================================

def search_with_gemini(api_key, num_results, query_filter, categories):
    """Search with Gemini"""
    try:
        import google.generativeai as genai
        
        print(f"[Gemini] Searching {num_results} articles in: {categories}")
        genai.configure(api_key=api_key)
        
        # Build query from categories
        keywords = []
        for cat in categories:
            keywords.extend(NEWS_CATEGORIES.get(cat, {}).get("keywords", []))
        
        # Determine if searching all categories (trending mode)
        is_trending_all = len(categories) >= 6  # 6 or more categories = trending mode
        
        if is_trending_all:
            # Trending news mode - search across all entertainment
            if query_filter:
                query = f"Find {num_results} top trending entertainment news stories today about {query_filter}. Include breaking news, viral stories, and major headlines across movies, TV, music, celebrity, awards, streaming, books, and gaming."
            else:
                query = f"Find {num_results} top trending entertainment news stories today. Include breaking news, viral stories, and major headlines across movies, TV, music, celebrity, awards, streaming, books, and gaming. Focus on what's currently trending and getting the most attention."
            print(f"[Gemini] 🔥 TRENDING MODE - Searching all entertainment categories")
        else:
            # Focused category mode
            if query_filter:
                query = f"Find {num_results} recent entertainment news about {query_filter} related to {', '.join(keywords[:5])}"
            else:
                query = f"Find {num_results} recent entertainment news about {', '.join(keywords[:5])}"
        
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

def search_with_claude(api_key, num_results, query_filter, categories):
    """Search with Claude"""
    try:
        print(f"[Claude] Searching {num_results} articles in: {categories}")
        client = anthropic.Anthropic(api_key=api_key)
        
        # Build query
        keywords = []
        for cat in categories:
            keywords.extend(NEWS_CATEGORIES.get(cat, {}).get("keywords", []))
        
        # Determine if searching all categories (trending mode)
        is_trending_all = len(categories) >= 6  # 6 or more categories = trending mode
        
        if is_trending_all:
            # Trending news mode - search across all entertainment
            if query_filter:
                query = f"Find {num_results} top trending entertainment news stories today about {query_filter}. Include breaking news, viral stories, and major headlines across movies, TV, music, celebrity, awards, streaming, books, and gaming. For each article, provide the title and URL."
            else:
                query = f"Find {num_results} top trending entertainment news stories today. Include breaking news, viral stories, and major headlines across movies, TV, music, celebrity, awards, streaming, books, and gaming. Focus on what's currently trending and getting the most attention. For each article, provide the title and URL."
        else:
            # Focused category mode
            if query_filter:
                query = f"Find {num_results} recent entertainment news articles about {query_filter} related to {', '.join(keywords[:5])}. For each article, provide the title and URL."
            else:
                query = f"Find {num_results} recent entertainment news articles about {', '.join(keywords[:5])}. For each article, provide the title and URL."
        
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

def generate_blog_with_gemini(api_key, news_item, temperature, max_tokens, writer, clickbank_links):
    """Generate blog with Gemini"""
    try:
        import google.generativeai as genai
        
        print(f"[Gemini Blog {news_item['id']}] Generating as {writer['name']}...")
        genai.configure(api_key=api_key)
        
        links_text = "\n".join([f"[LINK{i+1}] {l['title']} - {l['description']}" for i, l in enumerate(clickbank_links)])
        
        prompt = f"""You are {writer['name']}, {writer['title']} at KnotStranded.

STYLE: {writer.get('style', 'Engaging')}
VOICE: {writer.get('voice', 'Professional')}

News: {news_item['title']}
{news_item['snippet']}

AFFILIATE LINKS (mention naturally):
{links_text}

Format:
TITLE: [Catchy title]
CONTENT: [500-700 words. Naturally place 3 affiliate links: "For readers, [LINK1] offers..." Be opinionated, expert, concise.]"""
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        config = genai.GenerationConfig(temperature=float(temperature), max_output_tokens=int(max_tokens))
        response = model.generate_content(prompt, generation_config=config)
        
        title_match = re.search(r'TITLE:\s*(.+?)(?:\n|$)', response.text, re.IGNORECASE)
        content_match = re.search(r'CONTENT:\s*(.+)', response.text, re.IGNORECASE | re.DOTALL)
        
        title = title_match.group(1).strip() if title_match and content_match else news_item['title']
        content = content_match.group(1).strip() if title_match and content_match else response.text
        
        # Replace link placeholders
        for i, link in enumerate(clickbank_links):
            content = content.replace(f"[LINK{i+1}]", f'<a href="{link["url"]}" target="_blank" rel="nofollow sponsored">{link["title"]}</a>')
        
        # Clean up content (remove "Full URL" and unwanted text)
        content = clean_blog_content(content, title)
        
        print(f"[Gemini Blog {news_item['id']}] ✓ Generated by {writer['name']}")
        
        return {
            'title': title,
            'content': content,
            'writer': writer,
            'category': news_item.get('category', 'entertainment'),
            'affiliate_links': clickbank_links
        }
    except Exception as e:
        print(f"[Gemini Blog {news_item['id']}] ✗ Error: {str(e)}")
        raise

# ============================================================================
# GENERATION - CLAUDE
# ============================================================================

def generate_blog_with_claude(api_key, news_item, temperature, max_tokens, writer, clickbank_links):
    """Generate blog with Claude"""
    try:
        print(f"[Claude Blog {news_item['id']}] Generating as {writer['name']}...")
        client = anthropic.Anthropic(api_key=api_key)
        
        links_text = "\n".join([f"[LINK{i+1}] {l['title']} - {l['description']}" for i, l in enumerate(clickbank_links)])
        
        prompt = f"""You are {writer['name']}, {writer['title']} at KnotStranded.

STYLE: {writer.get('style', 'Engaging')}
VOICE: {writer.get('voice', 'Professional')}

News: {news_item['title']}
{news_item['snippet']}

AFFILIATE LINKS (mention naturally):
{links_text}

Format:
TITLE: [Catchy title]
CONTENT: [500-700 words. Place 3 links: "For readers, [LINK1]..." Be opinionated, expert.]"""
        
        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=int(max_tokens),
            temperature=float(temperature),
            messages=[{"role": "user", "content": prompt}]
        )
        
        response_text = message.content[0].text
        title_match = re.search(r'TITLE:\s*(.+?)(?:\n|$)', response_text, re.IGNORECASE)
        content_match = re.search(r'CONTENT:\s*(.+)', response_text, re.IGNORECASE | re.DOTALL)
        
        title = title_match.group(1).strip() if title_match and content_match else news_item['title']
        content = content_match.group(1).strip() if title_match and content_match else response_text
        
        for i, link in enumerate(clickbank_links):
            content = content.replace(f"[LINK{i+1}]", f'<a href="{link["url"]}" target="_blank" rel="nofollow sponsored">{link["title"]}</a>')
        
        # Clean up content (remove "Full URL" and unwanted text)
        content = clean_blog_content(content, title)
        
        print(f"[Claude Blog {news_item['id']}] ✓ Generated by {writer['name']}")
        
        return {
            'title': title,
            'content': content,
            'writer': writer,
            'category': news_item.get('category', 'entertainment'),
            'affiliate_links': clickbank_links
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
        content = content_match.group(1).strip() if title_match and content_match else response_text
        
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

def generate_featured_image(api_key, title, blog_id):
    """Generate image with DALL-E"""
    try:
        import openai
        
        print(f"[Image {blog_id}] Generating...")
        openai.api_key = api_key
        
        prompt = f"Professional editorial illustration for entertainment blog: '{title}'. Cinematic, elegant style. No text."
        
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
# SQUARESPACE POSTING
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
        
        url = f"https://api.squarespace.com/1.0/sites/{site_id}/blog/{collection_id}/posts"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        post_data = {
            "title": blog_data['title'],
            "body": blog_data['html_content'],
            "categories": [blog_data.get('category', 'Entertainment')],
            "tags": blog_data.get('tags', []),
            "publishOn": datetime.now().isoformat()
        }
        
        if blog_data.get('featured_image_url'):
            post_data['assetUrl'] = blog_data['featured_image_url']
        
        response = requests.post(url, headers=headers, json=post_data, timeout=30)
        
        if response.status_code in [200, 201]:
            url = response.json().get('fullUrl', '')
            print(f"[Squarespace] ✓ Posted: {url}")
            return True, url
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

def create_styled_html(blog_result, news_item, ai_used):
    """Create HTML"""
    title = blog_result.get('title', news_item['title'])
    content = blog_result.get('content', '')
    writer = blog_result.get('writer', {})
    writer_name = writer.get('name', 'KnotStranded Staff')
    writer_title = writer.get('title', 'Entertainment Writer')
    
    # Format content into paragraphs (extract from f-string to avoid backslash issue)
    paragraphs = content.split('\n\n')
    formatted_content = ''.join(f'<p>{p.strip()}</p>' for p in paragraphs if p.strip())
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Bricolage+Grotesque:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
    <style>
        :root {{
            --text-primary: #1a1a1a;
            --text-secondary: #666666;
            --accent: #6366f1;
            --code-bg: #1e1e1e;
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Bricolage Grotesque', -apple-system, sans-serif;
            background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%);
            color: var(--text-primary);
            line-height: 1.8;
            min-height: 100vh;
        }}

        .container {{
            max-width: 800px;
            margin: 0 auto;
            padding: 60px 40px;
        }}

        .meta {{
            text-align: center;
            margin-bottom: 20px;
        }}

        .date {{
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.875rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 1px;
        }}

        .read-time {{
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-top: 8px;
        }}

        h1, h2, h3 {{
            font-family: 'Playfair Display', serif;
            color: var(--text-primary);
        }}

        h1 {{
            font-size: 3rem;
            font-weight: 700;
            line-height: 1.2;
            margin: 20px 0;
            text-align: center;
        }}

        h2 {{
            font-size: 2rem;
            font-weight: 600;
            margin: 30px 0 15px;
        }}

        h3 {{
            font-size: 1.5rem;
            font-weight: 600;
            margin: 25px 0 12px;
        }}

        .byline {{
            text-align: center;
            margin: 20px 0 40px;
            padding: 20px 0;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
        }}

        .author-name {{
            font-family: 'Playfair Display', serif;
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 4px;
        }}

        .author-title {{
            font-size: 0.875rem;
            color: var(--text-secondary);
            font-style: italic;
        }}

        .content {{
            margin: 40px 0;
        }}

        .content p {{
            margin-bottom: 1.5rem;
        }}

        .content p:first-of-type {{
            font-size: 1.25rem;
            font-weight: 500;
        }}

        .content a {{
            color: var(--accent);
            text-decoration: none;
            border-bottom: 1px solid var(--accent);
            transition: all 0.2s ease;
        }}

        .content a:hover {{
            color: #4f46e5;
            border-bottom-color: #4f46e5;
        }}

        code, pre {{
            font-family: 'JetBrains Mono', monospace;
            background: var(--code-bg);
            border-radius: 8px;
        }}

        code {{
            padding: 2px 6px;
            font-size: 0.875em;
            color: #e5e7eb;
        }}

        pre {{
            padding: 16px;
            overflow-x: auto;
            margin: 20px 0;
        }}

        pre code {{
            padding: 0;
            background: transparent;
        }}

        .card {{
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
        }}

        .card:hover {{
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.1);
        }}

        .footer {{
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.875rem;
        }}

        .copyright {{
            font-weight: 600;
            margin-bottom: 8px;
        }}

        @media (max-width: 768px) {{
            .container {{
                padding: 40px 20px;
            }}

            h1 {{
                font-size: 2rem;
            }}

            h2 {{
                font-size: 1.5rem;
            }}

            h3 {{
                font-size: 1.25rem;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="meta">
            <div class="date">{datetime.now().strftime('%B %d, %Y')}</div>
            <div class="read-time">3 min read</div>
        </div>
        <h1>{title}</h1>
        <div class="byline">
            <div class="author-name">By {writer_name}</div>
            <div class="author-title">{writer_title}</div>
        </div>
        <div class="content">
            {formatted_content}
        </div>
        <div class="footer">
            <p class="copyright">© {datetime.now().strftime('%Y')} KnotStranded. All rights reserved.</p>
            <p>{datetime.now().strftime('%I:%M %p • %B %d, %Y')}</p>
        </div>
    </div>
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
                return search_with_gemini(config['gemini_api_key'], num, query, cats)
            else:
                return search_with_claude(config['anthropic_api_key'], num, query, cats)
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
# GENERATION WORKER
# ============================================================================

generation_state = {
    'status': 'idle',
    'progress': 0,
    'total': 0,
    'current_article': '',
    'news_items': [],
    'generated_files': [],
    'error': None,
    'ai_used': None,
    'posting_status': {}
}

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
            clickbank_links = get_clickbank_links(category, 3)
            
            try:
                blog_result = generate_blog_with_retry(config, news_item, writer, clickbank_links)
                
                featured_image = None
                if provider == 'chatgpt' and config.get('openai_api_key'):
                    featured_image = generate_featured_image(config['openai_api_key'], blog_result['title'], news_item['id'])
                
                html = create_styled_html(blog_result, news_item, provider.title())
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
                    'writer': writer['name'],
                    'category': category,
                    'tags': tags,
                    'html_content': html,
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
# FLASK ROUTES
# ============================================================================

@app.route('/')
def index():
    return render_template('dashboard_ultimate.html')

@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify(load_config())

@app.route('/api/config', methods=['POST'])
def save_config_route():
    return jsonify({'success': save_config(request.json)})

@app.route('/api/categories', methods=['GET'])
def get_categories():
    return jsonify({'categories': [{"id": k, "name": v["name"]} for k, v in NEWS_CATEGORIES.items()]})

@app.route('/api/clickbank-products', methods=['GET'])
def get_clickbank_products():
    """Get ClickBank products organized by category"""
    products_by_category = {}
    
    for category_id, category_data in NEWS_CATEGORIES.items():
        products = CLICKBANK_PRODUCTS.get(category_id, CLICKBANK_PRODUCTS.get("default", []))
        
        # Check if products are placeholders
        products_with_status = []
        for product in products:
            is_placeholder = "YOURVENDOR" in product["url"] or "YOURID" in product["url"]
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

@app.route('/api/image-requirements', methods=['GET'])
def get_image_requirements():
    """Check image generation requirements"""
    config = load_config()
    
    has_openai_key = bool(config.get('openai_api_key'))
    ai_provider = config.get('ai_provider', 'claude')
    
    return jsonify({
        'has_openai_key': has_openai_key,
        'can_generate_images': has_openai_key,
        'requires_chatgpt': ai_provider == 'chatgpt',
        'cost_per_image': 0.04,
        'image_size': '1792x1024',
        'status': 'ready' if has_openai_key else 'needs_key'
    })

@app.route('/api/search', methods=['POST'])
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
def status():
    return jsonify(generation_state)

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

@app.route('/api/post-to-squarespace', methods=['POST'])
def api_post_to_squarespace():
    """Post to Squarespace"""
    try:
        data = request.json
        filename = data['filename']
        
        blog_data = next((f for f in generation_state['generated_files'] if f['filename'] == filename), None)
        if not blog_data:
            return jsonify({'success': False, 'error': 'Blog not found'}), 404
        
        success, result = post_to_squarespace(data['config'], blog_data)
        
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

if __name__ == '__main__':
    print("\n" + "="*70)
    print(" KNOTSTRANDED BLOG GENERATOR - ULTIMATE EDITION")
    print("="*70)
    print("\n✨ Features:")
    print("  • 8 Categories (Movies, TV, Music, Celebrity, Awards, Streaming, Books, Gaming)")
    print("  • 3 AI Providers (Claude, Gemini, ChatGPT)")
    print("  • AI Image Generation (DALL-E 3)")
    print("  • ClickBank Affiliate Links (3 per blog)")
    print("  • One-Click Squarespace Posting")
    print("  • 5 Writer Personalities")
    print("  • Auto-Tagging & Categorization")
    print("\n🌐 Server: http://localhost:5000")
    print("="*70 + "\n")
    
    app.run(debug=False, host='127.0.0.1', port=5000)
