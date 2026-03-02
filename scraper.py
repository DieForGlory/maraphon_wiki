import json
import os
import requests
import urllib3
from playwright.sync_api import sync_playwright

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://tauceti.gg"
CATEGORIES = [
    "weapons", "ammo", "backpacks", "consumables", "cores",
    "currency", "equipment", "implants", "keys", "mods",
    "profile-backgrounds", "profile-emblems", "runner-skins",
    "salvage", "sponsored-kits", "valuables", "weapon-charms",
    "weapon-skins", "weapon-stickers"
]


def download_image(url, filepath):
    try:
        response = requests.get(url, stream=True, timeout=10, verify=False)
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
    except Exception as e:
        print(f"Image download error {url}: {e}")


def scrape_runners(page):
    print(f"\n{'=' * 40}\n>>> PROCESSING CATEGORY: SHELLS (RUNNERS)\n{'=' * 40}")
    category = "shells"
    image_dir = f"frontend/public/images/{category}"
    json_path = f"backend/app/static_data/{category}.json"

    os.makedirs(image_dir, exist_ok=True)
    os.makedirs(os.path.dirname(json_path), exist_ok=True)

    items_data = []

    page.goto(f"{BASE_URL}/runners/assassin", wait_until="networkidle")

    link_elements = page.locator("a[href^='/runners/']").all()
    runner_urls = set()
    for link in link_elements:
        href = link.get_attribute("href")
        if href and href.count('/') == 2:
            runner_urls.add(BASE_URL + href)

    for url in runner_urls:
        try:
            page.goto(url, wait_until="networkidle")

            name_loc = page.locator("h1.font-\\[\\'BackBone\\'\\]").first
            if name_loc.count() == 0:
                continue
            name = name_loc.inner_text().strip()
            safe_name = name.replace('"', '\\"')

            item_info = {
                "id": f"s_{name.lower().replace(' ', '_')}",
                "name": name,
                "category": category,
                "abilities": []
            }

            about_loc = page.locator("h3:has-text('About') + p").first
            if about_loc.count() > 0:
                item_info["description"] = about_loc.inner_text().strip()

            details_rows = page.locator("div.border-b.border-white\\/5:has(span.font-nippo)").all()
            for row in details_rows:
                key_loc = row.locator("span.font-nippo").first
                val_loc = row.locator("span.font-barlow").first
                if key_loc.count() > 0 and val_loc.count() > 0:
                    k = key_loc.inner_text().strip().lower().replace(" ", "_")
                    v = val_loc.inner_text().strip()
                    item_info[k] = v

            img_loc = page.locator(f'img[alt*="{safe_name}" i][src*="/cdn-images/"]').first
            if img_loc.count() == 0:
                img_loc = page.locator("img[src*='/cdn-images/images/']").first

            img_url = ""
            if img_loc.count() > 0:
                raw_src = img_loc.get_attribute("src")
                img_url = BASE_URL + raw_src if not raw_src.startswith("http") else raw_src

            ext = img_url.split('.')[-1].split('?')[0] if img_url else 'webp'
            img_filename = f"{name.lower().replace(' ', '_')}.{ext}"

            if img_url:
                download_image(img_url, os.path.join(image_dir, img_filename))

            item_info["image"] = f"/images/{category}/{img_filename}"

            stats_url = f"{url}/abilities-stats"
            page.goto(stats_url, wait_until="networkidle")

            ability_cards = page.locator(
                "h3:has-text('Abilities') + div > div, h3:has-text('Abilities AND TRAITS') + div > div").all()
            for card in ability_cards:
                texts = card.locator("span").all_inner_texts()
                if len(texts) >= 2:
                    ab_name = texts[0].strip()
                    ab_type = texts[1].strip()
                    desc_loc = card.locator("p").first
                    desc = desc_loc.inner_text().strip() if desc_loc.count() > 0 else ""
                    item_info["abilities"].append({
                        "name": ab_name,
                        "type": ab_type,
                        "description": desc
                    })

            implant_buttons = page.locator("h3:has-text('SELECT IMPLANTS') + div button").all()
            slots = [btn.get_attribute("title").lower() for btn in implant_buttons if btn.get_attribute("title")]
            if slots:
                item_info["slots"] = slots
            else:
                item_info["slots"] = ["head", "torso", "legs", "shield"]

            stat_rows = page.locator("h3:has-text('STATS') + div > div").all()
            for row in stat_rows:
                stat_name_loc = row.locator("div.flex.items-center.gap-1 span").first
                stat_val_loc = row.locator("div.flex.items-center.gap-1\\.5 span").first

                if stat_name_loc.count() > 0 and stat_val_loc.count() > 0:
                    k = stat_name_loc.inner_text().strip().lower().replace(" ", "_").replace("-", "_")
                    v_str = stat_val_loc.inner_text().strip()

                    try:
                        v_num = float(v_str) if '.' in v_str else int(v_str)
                        item_info[k] = v_num
                    except ValueError:
                        item_info[k] = v_str

            if "heat_capacity" in item_info:
                item_info["base_heat"] = item_info["heat_capacity"]
            else:
                item_info["base_heat"] = 100

            items_data.append(item_info)
            print(f"Parsed Abilities & Stats: {name}")

        except Exception as e:
            print(f"Error scraping {url}: {e}")

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(items_data, f, indent=2, ensure_ascii=False)
    print(f"✅ Successfully exported shells.json")


def scrape_db_categories(page):
    for category in CATEGORIES:
        print(f"\n{'=' * 40}\n>>> PROCESSING CATEGORY: {category.upper()}\n{'=' * 40}")
        catalog_url = f"{BASE_URL}/db/{category}"
        image_dir = f"frontend/public/images/{category}"
        json_path = f"backend/app/static_data/{category}.json"

        os.makedirs(image_dir, exist_ok=True)
        os.makedirs(os.path.dirname(json_path), exist_ok=True)

        items_data = []

        page.goto(catalog_url, wait_until="networkidle")

        link_elements = page.locator(f"a[href^='/db/{category}/']").all()
        item_urls = set()
        for link in link_elements:
            href = link.get_attribute("href")
            if href and href.strip('/') != f"db/{category}":
                item_urls.add(BASE_URL + href)

        if not item_urls:
            print("Skipping empty category.")
            continue

        for url in item_urls:
            try:
                page.goto(url, wait_until="networkidle")

                name_loc = page.locator("h1.font-marathon").first
                if name_loc.count() == 0:
                    continue
                name = name_loc.inner_text().strip()
                safe_name = name.replace('"', '\\"')

                item_info = {
                    "id": f"{category[:3]}_{name.lower().replace(' ', '_').replace('-', '_')}",
                    "name": name,
                    "category": category
                }

                details_rows = page.locator("div.border-b.border-white\\/5").all()
                for row in details_rows:
                    key_loc = row.locator("span").first
                    val_loc = row.locator("div").first
                    if key_loc.count() > 0 and val_loc.count() > 0:
                        k = key_loc.inner_text().strip().lower().replace(" ", "_")
                        v = val_loc.inner_text().strip()
                        item_info[k] = v

                stat_rows = page.locator("div.group\\/stat").all()
                for row in stat_rows:
                    key_loc = row.locator("span").first
                    val_loc = row.locator("div span.tabular-nums").first
                    if key_loc.count() > 0 and val_loc.count() > 0:
                        k = key_loc.inner_text().strip().lower().replace(" ", "_")
                        v = val_loc.inner_text().strip()
                        v_clean = v.replace('%', '').replace('°', '').replace('s', '').replace('x', '').replace('RPM',
                                                                                                                '').replace(
                            'm', '').strip()
                        try:
                            v_num = float(v_clean) if '.' in v_clean else int(v_clean)
                            item_info[k] = v_num
                        except ValueError:
                            item_info[k] = v

                mod_buttons = page.locator("h3:has-text('SELECT MODS') + div button").all()
                if mod_buttons:
                    item_info["mod_slots"] = [btn.get_attribute("title").lower() for btn in mod_buttons if
                                              btn.get_attribute("title")]

                img_loc = page.locator(f'img[alt*="{safe_name}" i][src*="/cdn-images/"]').first
                if img_loc.count() == 0:
                    img_loc = page.locator("div[class*='lg:col-span-9'] img[src*='/cdn-images/images/']").first
                if img_loc.count() == 0:
                    img_loc = page.locator("img[src*='/cdn-images/images/']").first

                img_url = ""
                if img_loc.count() > 0:
                    raw_src = img_loc.get_attribute("src")
                    img_url = BASE_URL + raw_src if not raw_src.startswith("http") else raw_src

                ext = img_url.split('.')[-1].split('?')[0] if img_url else 'webp'
                img_filename = f"{name.lower().replace(' ', '_')}.{ext}"

                if img_url:
                    download_image(img_url, os.path.join(image_dir, img_filename))

                item_info["image"] = f"/images/{category}/{img_filename}"

                items_data.append(item_info)
                print(f"Parsed: {name}")

            except Exception as e:
                print(f"Error scraping {url}: {e}")

        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(items_data, f, indent=2, ensure_ascii=False)
        print(f"✅ Successfully exported {category}.json")


def run_scraper():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        scrape_runners(page)
        scrape_db_categories(page)

        browser.close()
    print("\nALL PROCESSES COMPLETED.")


if __name__ == "__main__":
    run_scraper()