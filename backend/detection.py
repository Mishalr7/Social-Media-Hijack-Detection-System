import requests

def get_location_from_ip(ip):
    # Using a free service for geolocation (ip-api.com)
    # Note: In production, consider a more robust/paid API or local GeoLite database.
    if ip == '127.0.0.1' or ip == 'localhost':
        return {"country": "Localhost"}
        
    try:
        response = requests.get(f"http://ip-api.com/json/{ip}", timeout=3)
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'success':
                return {
                    "country": data.get('country', 'Unknown'),
                    "city": data.get('city', 'Unknown')
                }
    except Exception as e:
        print(f"Geolocation API error: {e}")
    return {"country": "Unknown", "city": "Unknown"}

def calculate_risk_score(login_data, previous_logins):
    score = 0
    reasons = []

    # New Device (simplified check)
    # If no previous login with this device string
    known_devices = {log.get('device') for log in previous_logins if log.get('device')}
    if login_data.get('device') and login_data.get('device') not in known_devices and len(known_devices) > 0:
        score += 40
        reasons.append("New device")

    # New Country
    known_countries = {log.get('country') for log in previous_logins if log.get('country') and log.get('country') != 'Unknown'}
    
    if login_data.get('country') != 'Unknown':
        if login_data.get('country') not in known_countries and len(known_countries) > 0:
            score += 40
            reasons.append("New country")

    # Unusual time (Simplified heuristic: e.g. login between 2 AM and 5 AM local time, but we just use server time here for simplicity)
    # A complete implementation would compare the time deviation from the user's usual login hours.
    import datetime
    current_hour = datetime.datetime.now().hour
    if 2 <= current_hour <= 5:
        score += 20
        reasons.append("Unusual login time")
        
    # Cap score at 100
    if score > 100:
        score = 100

    return score, reasons
