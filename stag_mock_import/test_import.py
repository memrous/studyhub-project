import json
import os
import sys
import requests

# --- KONFIGURACE (injected by StagSyncJob via environment variables) ---
LARAVEL_API_URL  = os.environ.get("LARAVEL_API_URL",  "http://localhost/api")
BEARER_TOKEN     = os.environ.get("BEARER_TOKEN",     "")
STAG_USERNAME    = os.environ.get("STAG_USERNAME",    "")
STAG_PASSWORD    = os.environ.get("STAG_PASSWORD",    "")
STAG_STUDENT_ID  = os.environ.get("STAG_STUDENT_ID",  "")

def nacti_surova_data(soubor):
    """Načte JSON soubor s mockovanými daty ze STAGu."""
    if not os.path.exists(soubor):
        print(f"❌ Chyba: Soubor {soubor} nebyl nalezen!")
        return []
    with open(soubor, "r", encoding="utf-8") as f:
        data = json.load(f)
        return data.get("rozvrhovaAkce", [])

def transformuj_data_pro_laravel(surova_data):
    """Transformuje STAG data do formátu pro Laravel."""
    vysledek = []
    for akce in surova_data:
        katedra = akce.get("katedra", "???")
        kod_predmetu = akce.get("predmet", "???")
        plny_kod = f"{katedra}/{kod_predmetu}"
        
        ucitel_obj = akce.get("ucitel", {})
        jmeno_vyucujiciho = f"{ucitel_obj.get('jmeno', '')} {ucitel_obj.get('prijmeni', '')}".strip() or "Neznámý"

        typ_akce = akce.get("typAkceZkr", "Př")
        full_typ = "Lecture" if typ_akce == "Př" else "Tutorial"
        
        laravel_payload = {
            "subject": {
                "code": plny_kod,
                "name": f"Předmět {plny_kod}",
                "credits": 5,
                "lecturer": jmeno_vyucujiciho,
                "semester": "Winter",
                "completionType": "Credit",
                "isMandatory": True
            },
            "event": {
                "title": f"{full_typ} - {plny_kod}",
                "date": "2026-09-21",
                "startTime": akce.get("casOd", "00:00"),
                "endTime": akce.get("casDo", "00:00"),
                "type": full_typ,
                "status": "Not Started"
            }
        }
        vysledek.append(laravel_payload)
    return vysledek

def odesli_data_do_laravelu(bearer_token, data):
    """Odešle transformovaná data na chráněný endpoint."""
    url = f"{LARAVEL_API_URL}/stag/sync-schedule"
    headers = {
        "Authorization": f"Bearer {bearer_token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    print(f"📡 Odesílám {len(data)} záznamů na Laravel API...")
    try:
        response = requests.post(url, json=data, headers=headers, timeout=10)
        if response.status_code == 200:
            print(f"🎉 Odezva serveru: {response.json().get('message')}")
        else:
            print(f"❌ Chyba při synchronizaci (Status: {response.status_code}): {response.text}", file=sys.stderr)
            sys.exit(1)
    except requests.RequestException as e:
        print(f"❌ Chyba sítě při odesílání dat: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    # 1. Validate required env vars
    if not BEARER_TOKEN:
        print("❌ Chyba: BEARER_TOKEN není nastaven. Skript musí být spuštěn přes StagSyncJob.", file=sys.stderr)
        sys.exit(1)
    if not LARAVEL_API_URL:
        print("❌ Chyba: LARAVEL_API_URL není nastaven.", file=sys.stderr)
        sys.exit(1)

    # 2. Resolve mock data file relative to this script's location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    soubor_s_daty = os.path.join(script_dir, "mock_stag_data.json")

    # 3. Load and transform
    surove_akce = nacti_surova_data(soubor_s_daty)
    pripravena_data = transformuj_data_pro_laravel(surove_akce)

    if not pripravena_data:
        print("📭 Žádná data k odeslání.")
        sys.exit(0)

    # 4. Send — token already available, no login needed
    odesli_data_do_laravelu(BEARER_TOKEN, pripravena_data)