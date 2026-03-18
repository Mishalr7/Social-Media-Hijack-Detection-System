import requests
import math
import datetime

def haversine(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points on the earth."""
    if None in (lat1, lon1, lat2, lon2):
        return 0.0
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers
    return c * r

def get_location_from_ip(ip):
    # Using a free service for geolocation (ip-api.com)
    # Note: In production, consider a more robust/paid API or local GeoLite database.
    if ip == '127.0.0.1' or ip == 'localhost':
        return {"location": "Localhost", "lat": None, "lon": None, "isp": "Localhost ISP"}
        
    try:
        response = requests.get(f"http://ip-api.com/json/{ip}", timeout=3)
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'success':
                city = data.get('city')
                region = data.get('regionName')
                country = data.get('country')
                
                parts = [p for p in [city, region, country] if p and p != 'Unknown']
                location_str = ", ".join(parts) if parts else "Unknown"
                
                return {
                    "location": location_str,
                    "lat": data.get('lat'),
                    "lon": data.get('lon'),
                    "isp": data.get('isp', 'Unknown')
                }
    except Exception as e:
        print(f"Geolocation API error: {e}")
    return {"location": "Unknown", "lat": None, "lon": None, "isp": "Unknown"}

def calculate_risk_score(login_data, previous_logins):
    score = 0
    reasons = []

    # New Device (simplified check)
    known_devices = {log.get('device') for log in previous_logins if log.get('device')}
    if login_data.get('device') and login_data.get('device') not in known_devices and len(known_devices) > 0:
        score += 40
        reasons.append("New device")

    # New Location Area
    known_locations = {log.get('location') for log in previous_logins if log.get('location') and log.get('location') != 'Unknown'}
    
    if login_data.get('location') != 'Unknown':
        if login_data.get('location') not in known_locations and len(known_locations) > 0:
            score += 30
            reasons.append("New location area")

    # ISP Check (Network Consistency)
    known_isps = {log.get('isp') for log in previous_logins if log.get('isp') and log.get('isp') != 'Unknown'}
    current_isp = login_data.get('isp')
    if current_isp and current_isp != 'Unknown' and known_isps:
        if current_isp not in known_isps:
            score += 20
            reasons.append(f"Unfamiliar ISP ({current_isp})")

    # Impossible Travel Velocity
    if previous_logins:
        try:
            # Sort logins by timestamp to get the most recent one
            sorted_logins = sorted(
                [log for log in previous_logins if isinstance(log.get('timestamp'), datetime.datetime)],
                key=lambda x: x.get('timestamp'), 
                reverse=True
            )
            
            if sorted_logins:
                last_login = sorted_logins[0]
                last_time = last_login.get('timestamp')
                current_time = login_data.get('timestamp')
                
                if isinstance(current_time, datetime.datetime):
                    time_diff_hours = (current_time - last_time).total_seconds() / 3600.0
                    
                    if time_diff_hours > 0:
                        lat1, lon1 = last_login.get('lat'), last_login.get('lon')
                        lat2, lon2 = login_data.get('lat'), login_data.get('lon')
                        
                        if None not in (lat1, lon1, lat2, lon2):
                            distance_km = haversine(lat1, lon1, lat2, lon2)
                            velocity = distance_km / time_diff_hours
                            
                            # If travelling faster than ~800km/h (commercial flight) and distance > 100km
                            if velocity > 800 and distance_km > 100:
                                score += 50
                                reasons.append("Impossible travel detected")
        except Exception as e:
            print(f"Error calculating advanced heuristics: {e}")

    # Unusual time (Simplified heuristic: e.g. login between 2 AM and 5 AM local server time)
    current_hour = datetime.datetime.now().hour
    if 2 <= current_hour <= 5:
        score += 20
        reasons.append("Unusual login time")
        
    # Cap score at 100
    if score > 100:
        score = 100

    return score, reasons
