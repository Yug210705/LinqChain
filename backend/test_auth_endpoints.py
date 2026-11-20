import httpx

base_url = "http://127.0.0.1:8000"

print("1. Testing login endpoint...")
r_login = httpx.post(f"{base_url}/api/auth/login", json={"email": "operator@resilienceos.com", "password": "operator123"})
print("Login status:", r_login.status_code)
if r_login.status_code == 200:
    token = r_login.json()["access_token"]
    print("Got access token:", token[:30] + "...")

    print("\n2. Testing /api/scenarios with real JWT...")
    r_scenarios = httpx.get(f"{base_url}/api/scenarios", headers={"Authorization": f"Bearer {token}"})
    print("Scenarios status:", r_scenarios.status_code)
    if r_scenarios.status_code == 200:
        data = r_scenarios.json()
        print(f"Scenarios returned: {len(data.get('items', []))} items, total active: {data.get('total_active')}")

    print("\n3. Testing /api/recovery/plans with real JWT...")
    r_plans = httpx.get(f"{base_url}/api/recovery/plans", headers={"Authorization": f"Bearer {token}"})
    print("Recovery plans status:", r_plans.status_code)
    if r_plans.status_code == 200:
        data = r_plans.json()
        print(f"Recovery plans returned: {len(data.get('items', []))} items, total active: {data.get('total_active')}")

    print("\n4. Testing /api/scenarios with guest-operator-token...")
    r_guest = httpx.get(f"{base_url}/api/scenarios", headers={"Authorization": "Bearer guest-operator-token"})
    print("Guest scenarios status:", r_guest.status_code)
    if r_guest.status_code == 200:
        data = r_guest.json()
        print(f"Guest Scenarios returned: {len(data.get('items', []))} items!")
