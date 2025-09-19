import requests

BASE_URL = "http://127.0.0.1:8000"

EVENT_QUERY = "Cleanliness drive at Dadar beach on 25th September, organized by VESIT students"

def test_workflow():
    print("🔹 Step 1: Generate Description")
    desc_res = requests.post(f"{BASE_URL}/ai/description", params={"event_query": EVENT_QUERY})
    print(desc_res.json())

    print("\n🔹 Step 2: Generate Flyer")
    flyer_res = requests.post(f"{BASE_URL}/ai/flyer", params={"event_query": EVENT_QUERY})
    print(flyer_res.json())

if __name__ == "__main__":
    test_workflow()
