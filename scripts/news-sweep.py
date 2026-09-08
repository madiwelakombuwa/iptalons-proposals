#!/usr/bin/env python3
"""Policy & market intel sweep for the IPTalons outreach platform.

Pulls recent posts from X via Apify (same actor as the demand radar / tweets
aggregator), from a curated set of policy accounts and narrow keyword queries.
Dumps raw items to stdout/JSON for Claude to qualify and ingest via
POST /api/news/ingest — this script does NOT decide what is relevant.

Known actor gotchas (see radar memory):
  - sinceDate/untilDate inputs are silently ignored on run-sync — embed the
    window in each search term ("... since:YYYY-MM-DD until:YYYY-MM-DD").
  - Broad terms are ~98% noise; keep queries narrow, qualify downstream.

Usage: python3 scripts/news-sweep.py [days_back] > raw-news.json
Token: default value of APIFY_API_TOKEN in ~/tweets/config.py, or the
       APIFY_API_TOKEN env var, or ~/.apify_token.
"""

import datetime as dt
import json
import os
import re
import sys
import urllib.request

ACTOR = "apidojo~tweet-scraper"


def apify_token() -> str:
    tok = os.environ.get("APIFY_API_TOKEN")
    if tok:
        return tok
    cfg = os.path.expanduser("~/tweets/config.py")
    if os.path.exists(cfg):
        m = re.search(r'APIFY_API_TOKEN\s*=\s*os\.environ\.get\(\s*"APIFY_API_TOKEN",\s*"([^"]+)"', open(cfg).read())
        if m:
            return m.group(1)
    fallback = os.path.expanduser("~/.apify_token")
    if os.path.exists(fallback):
        return open(fallback).read().strip()
    sys.exit("no Apify token found")


def sweep(days_back: int = 7):
    until = dt.date.today() + dt.timedelta(days=1)
    since = dt.date.today() - dt.timedelta(days=days_back)
    win = f"since:{since} until:{until}"

    # Curated: policy accounts (alert wire) + narrow keyword queries.
    terms = [
        f"from:NIH {win}",
        f"from:NSF {win}",
        f"from:HouseScience {win}",
        f"from:committeeonccp {win}",
        f"from:DSDimensions {win}",
        f'"NSPM-33" {win}',
        f'"research security" NIH {win}',
        f'"research security" NSF {win}',
        f'"foreign risk assessment" {win}',
        f'"Section 117" university {win}',
        f'"MFTRP" {win}',
    ]

    body = json.dumps({
        "searchTerms": terms,
        "maxItems": 120,
        "sort": "Latest",
    }).encode()

    req = urllib.request.Request(
        f"https://api.apify.com/v2/acts/{ACTOR}/run-sync-get-dataset-items?token={apify_token()}",
        data=body,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=300) as resp:
        items = json.load(resp)

    slim = []
    for it in items:
        if not isinstance(it, dict) or not it.get("id"):
            continue
        author = it.get("author") or {}
        slim.append({
            "id": str(it.get("id")),
            "createdAt": it.get("createdAt"),
            "handle": author.get("userName"),
            "authorName": author.get("name"),
            "followers": author.get("followers"),
            "text": (it.get("fullText") or it.get("text") or "")[:600],
            "url": it.get("url") or it.get("twitterUrl"),
            "likes": it.get("likeCount"),
            "retweets": it.get("retweetCount"),
        })
    return slim


def sweep_federal_register(days_back: int = 7):
    """Authoritative source: Federal Register documents API (free, no auth)."""
    import urllib.parse
    since = (dt.date.today() - dt.timedelta(days=days_back)).isoformat()
    terms = ['"research security"', '"foreign talent"', '"NSPM-33"', '"foreign gifts" education']
    seen = {}
    for t in terms:
        q = urllib.parse.urlencode({
            "conditions[term]": t,
            "conditions[publication_date][gte]": since,
            "per_page": 10,
            "order": "newest",
        })
        q += "".join("&fields[]=" + f for f in ["title", "abstract", "html_url", "publication_date", "agencies", "document_number", "type"])
        try:
            with urllib.request.urlopen(f"https://www.federalregister.gov/api/v1/documents.json?{q}", timeout=60) as r:
                for doc in json.load(r).get("results", []):
                    seen[doc["document_number"]] = doc
        except Exception as e:
            print(f"fedreg term {t!r} failed: {e}", file=sys.stderr)
    return [{
        "source": "fedreg",
        "id": d["document_number"],
        "date": d["publication_date"],
        "doc_type": d.get("type"),
        "agencies": [a.get("name", "") for a in (d.get("agencies") or [])[:3]],
        "title": d.get("title"),
        "abstract": (d.get("abstract") or "")[:600],
        "url": d.get("html_url"),
    } for d in seen.values()]


if __name__ == "__main__":
    days = int(sys.argv[1]) if len(sys.argv) > 1 else 7
    out = [dict(it, source="x") for it in sweep(days)] + sweep_federal_register(max(days, 14))
    json.dump(out, sys.stdout, indent=1)
    print(f"\n[{len(out)} items]", file=sys.stderr)
