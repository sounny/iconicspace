import requests
import os
import re

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def try_clearbit(domain):
    url = f"https://logo.clearbit.com/{domain}"
    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code == 200 and len(r.content) > 1000:
            return r.content
    except:
        pass
    return None

def get_domain(url):
    domain = re.sub(r'^https?://', '', url)
    domain = re.sub(r'^www\.', '', domain)
    domain = domain.split('/')[0]
    return domain

print("Testing clearbit for esa.int...")
content = try_clearbit("esa.int")
if content:
    print(f"Success! {len(content)} bytes")
else:
    print("Failed or too small.")
