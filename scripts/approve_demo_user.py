from pymongo import MongoClient
import sys

# Replace with your actual connection string if different
MONGO_URI = "mongodb+srv://abhishek2005kamble_db_user:vtbptdiS24fS8AQQ@cluster0.gqqcyoz.mongodb.net/PetWellnessDB?appName=Cluster0"

def approve_demo_user():
    try:
        client = MongoClient(MONGO_URI)
        db = client['PetWellnessDB']
        users = db['users']
        
        result = users.update_one(
            {"username": "demo_user"},
            {"$set": {"isEmailVerified": True, "isApproved": True}}
        )
        
        if result.matched_count > 0:
            print("Successfully verified and approved demo_user in MongoDB.")
        else:
            print("User demo_user not found.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    approve_demo_user()
