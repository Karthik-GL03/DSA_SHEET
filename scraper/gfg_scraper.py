#!/usr/bin/env python3
"""
Advanced GeeksforGeeks Profile Scraper with TLS Fingerprint Spoofing & Cloudflare Bypass
Part of the Unified Data Structures and Algorithms Tracking Platform Architecture.

As outlined in the architectural blueprint:
Standard HTTP libraries emit predictable JA3/JA4 TLS fingerprints that trigger Cloudflare WAF 403s.
This module uses curl_cffi with browser impersonation (libcurl-impersonate) to match Chrome TLS cipher suites,
falling back to resilient DOM parsing with proper headers and JSON extraction.
"""

import sys
import json
import re

def scrape_gfg_profile(username: str):
    """
    Scrapes user profile metrics from GeeksforGeeks:
    - Total solved problems
    - Breakdown by difficulty (School, Basic, Easy, Medium, Hard)
    - Overall coding score
    - Streak and contest info
    """
    url = f"https://www.geeksforgeeks.org/user/{username}/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
    }

    html = ""
    # Attempt 1: curl_cffi with Chrome TLS impersonation
    try:
        from curl_cffi import requests as cffi_requests
        response = cffi_requests.get(url, headers=headers, impersonate="chrome124", timeout=12)
        if response.status_code == 200:
            html = response.text
    except Exception as e:
        # Attempt 2: Standard requests with header spoofing
        try:
            import urllib.request
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                html = resp.read().decode("utf-8", errors="ignore")
        except Exception as inner_e:
            pass

    result = {
        "platform": "geeksforgeeks",
        "handle": username,
        "success": False,
        "totalSolved": 0,
        "codingScore": 0,
        "breakdown": {
            "school": 0,
            "basic": 0,
            "easy": 0,
            "medium": 0,
            "hard": 0
        },
        "recentSubmissions": [],
        "source": "scraper"
    }

    if not html:
        return result

    try:
        # Extract Next.js or JSON hydration scripts if present
        next_data_match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.DOTALL)
        if next_data_match:
            try:
                data = json.loads(next_data_match.group(1))
                page_props = data.get("props", {}).get("pageProps", {})
                user_info = page_props.get("userInfo", {}) or page_props.get("userStats", {})
                if user_info:
                    result["totalSolved"] = user_info.get("total_problems_solved", 0)
                    result["codingScore"] = user_info.get("score", 0)
                    result["success"] = True
                    return result
            except Exception:
                pass

        # Regex fallback for coding score and solved counts
        score_match = re.search(r'Coding Score.*?(\d+)', html, re.IGNORECASE | re.DOTALL)
        if score_match:
            result["codingScore"] = int(score_match.group(1))

        solved_match = re.search(r'Problems? Solved.*?(\d+)', html, re.IGNORECASE | re.DOTALL)
        if solved_match:
            result["totalSolved"] = int(solved_match.group(1))

        # Check for difficulty counts
        for diff in ["School", "Basic", "Easy", "Medium", "Hard"]:
            diff_match = re.search(rf'{diff}\s*\((\d+)\)', html, re.IGNORECASE)
            if diff_match:
                result["breakdown"][diff.lower()] = int(diff_match.group(1))

        if result["totalSolved"] > 0 or result["codingScore"] > 0:
            result["success"] = True

    except Exception as parse_err:
        result["error"] = str(parse_err)

    return result

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "geeksforgeeks"
    res = scrape_gfg_profile(target)
    print(json.dumps(res, indent=2))
