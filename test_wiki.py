import requests

def search_wiki_logo(query):
    url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": f"{query} logo",
        "gsrlimit": 1,
        "prop": "pageimages",
        "pithumbsize": 256,
        "format": "json"
    }
    headers = {"User-Agent": "IconicSpace/1.0 (sounny.github.io)"}
    
    try:
        r = requests.get(url, params=params, headers=headers)
        data = r.json()
        pages = data.get("query", {}).get("pages", {})
        for page_id, page_info in pages.items():
            if "thumbnail" in page_info:
                return page_info["thumbnail"]["source"]
    except Exception as e:
        print(f"Error: {e}")
    return None

esa_logo = search_wiki_logo("European Space Agency")
print(f"ESA logo: {esa_logo}")
