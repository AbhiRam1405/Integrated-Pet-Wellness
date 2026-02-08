import requests
import time
import re
import os

BASE_URL = "http://localhost:8080"

def register():
    print("Step 1: Registering user...")
    payload = {
        "username": "demo_user",
        "email": "demo@example.com",
        "password": "demo1234",
        "firstName": "Demo",
        "lastName": "User",
        "phoneNumber": "1234567890",
        "address": "Demo Address"
    }
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def verify_email():
    print("\nStep 2: Checking logs for verification token...")
    # In a real scenario we'd read the log file.
    # Since I'm an agent, I'll ask the system for the last 50 lines of the server log.
    # But for this script, I'll assume the user will provide it or I'll look for it.
    # Wait, I can't easily "read" the background terminal output from inside this script.
    # So I'll just print instructions.
    print("Please check the server console for a log line like: 'Verification token: {UUID}'")
    print("Once found, the verification URL is: http://localhost:8080/api/auth/verify-email?token={UUID}")

def login():
    print("\nStep 3: Logging in...")
    payload = {
        "emailOrUsername": "demo_user",
        "password": "demo1234"
    }
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            token = response.json().get("token")
            print(f"JWT Token received: {token[:50]}...")
            return token
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    # Skipping registration as demo_user is already in DB
    token = login()
    if token:
        print("\nStep 4: Accessing protected profile...")
        headers = {"Authorization": f"Bearer {token}"}
        try:
            profile_response = requests.get(f"{BASE_URL}/api/users/profile", headers=headers)
            print(f"Status: {profile_response.status_code}")
            print(f"Profile Data: {profile_response.text}")
        except Exception as e:
            print(f"Error accessing profile: {e}")
