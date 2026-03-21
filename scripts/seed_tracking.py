from pymongo import MongoClient
from datetime import datetime, timedelta
import bson

MONGO_URI = "mongodb+srv://abhishek2005kamble_db_user:vtbptdiS24fS8AQQ@cluster0.gqqcyoz.mongodb.net/PetWellnessDB?appName=Cluster0"
ORDER_ID = "69acd6a42790bd747e1cffea"

def seed_tracking_data():
    try:
        client = MongoClient(MONGO_URI)
        db = client['PetWellnessDB']
        orders = db['orders']
        
        # Verify order exists
        order = orders.find_one({"_id": bson.ObjectId(ORDER_ID)})
        if not order:
            # Try searching as string if ObjectId fails (depends on how it was saved)
            order = orders.find_one({"_id": ORDER_ID})
        
        if not order:
            print(f"Order {ORDER_ID} not found.")
            return

        print(f"Found order: {order.get('_id')}. Seeding tracking data...")

        now = datetime.utcnow()
        tracking_history = [
            {
                "status": "Order Placed",
                "location": "Warehouse Hub A",
                "message": "Order has been processed and is ready for pickup.",
                "timestamp": now - timedelta(days=2)
            },
            {
                "status": "Shipped",
                "location": "Regional Sorting Facility",
                "message": "Package has been handed over to the courier.",
                "timestamp": now - timedelta(days=1)
            },
            {
                "status": "In Transit",
                "location": "Pune Logistics Hub",
                "message": "Package is on its way to your city.",
                "timestamp": now
            }
        ]

        result = orders.update_one(
            {"_id": order["_id"]},
            {"$set": {
                "trackingId": "PET-TRK-7890",
                "carrier": "PetCare Express",
                "trackingHistory": tracking_history,
                "status": "SHIPPED"
            }}
        )

        if result.modified_count > 0:
            print("Successfully seeded tracking data.")
        else:
            print("No changes made (data might already be there).")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    seed_tracking_data()
