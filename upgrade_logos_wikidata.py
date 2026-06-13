import requests
import json
import os
import re
import time

def get_wikidata_logo(query):
    # Search for the entity on Wikidata
    search_url = "https://www.wikidata.org/w/api.php"
    params = {
        "action": "wbsearchentities",
        "search": query,
        "language": "en",
        "format": "json"
    }
    
    headers = {"User-Agent": "IconicSpace/1.0"}
    try:
        r = requests.get(search_url, params=params, headers=headers)
        data = r.json()
        if not data.get("search"):
            return None
        entity_id = data["search"][0]["id"]
        
        # Get claims for this entity
        claims_url = "https://www.wikidata.org/w/api.php"
        claims_params = {
            "action": "wbgetclaims",
            "entity": entity_id,
            "property": "P154", # Logo image property
            "format": "json"
        }
        r2 = requests.get(claims_url, params=claims_params, headers=headers)
        claims_data = r2.json()
        
        if "claims" in claims_data and "P154" in claims_data["claims"]:
            file_name = claims_data["claims"]["P154"][0]["mainsnak"]["datavalue"]["value"]
            # Construct the wikimedia commons thumbnail URL
            import hashlib
            name_formatted = file_name.replace(" ", "_")
            md5 = hashlib.md5(name_formatted.encode('utf-8')).hexdigest()
            # Request a 256px wide thumbnail
            thumb_url = f"https://upload.wikimedia.org/wikipedia/commons/thumb/{md5[0]}/{md5[0:2]}/{name_formatted}/256px-{name_formatted}"
            if not thumb_url.lower().endswith(('.png', '.jpg', '.jpeg')):
                thumb_url += ".png"
            return thumb_url
    except Exception as e:
        pass
    return None

def safe_name(name):
    return re.sub(r'[^a-z0-9]', '_', name.lower()).strip('_')

# Load data.js
with open('data.js', 'r', encoding='utf-8') as f:
    data = f.read()

entries = re.findall(r'name:\s*"([^"]+)"', data)

upgraded = 0
for name in entries:
    fname = f"logos/{safe_name(name)}.png"
    if os.path.exists(fname) and os.path.getsize(fname) < 2500:
        print(f"[{name}] is small ({os.path.getsize(fname)} bytes). Trying Wikidata...")
        logo_url = get_wikidata_logo(name)
        if not logo_url:
            # try adding ' space' to query
            logo_url = get_wikidata_logo(name + " space")
            
        if logo_url:
            try:
                img_data = requests.get(logo_url, headers=headers).content
                if len(img_data) > 2500:
                    with open(fname, "wb") as f:
                        f.write(img_data)
                    print(f"  -> Upgraded {name} via Wikidata! New size: {len(img_data)}")
                    upgraded += 1
                else:
                    print(f"  -> Wikidata returned small image ({len(img_data)} bytes).")
            except:
                print("  -> Failed to download from Wikimedia Commons.")
        else:
            print("  -> No logo found on Wikidata.")
        time.sleep(0.5)

print(f"Upgraded {upgraded} logos.")
