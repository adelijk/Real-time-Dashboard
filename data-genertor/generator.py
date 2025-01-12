import time
import json
import random
from kafka import KafkaProducer
from datetime import datetime

# Define the Kafka broker IP address
KAFKA_IP = '172.18.0.5'  

# Initialize KafkaProducer with the broker IP address
producer = KafkaProducer(bootstrap_servers=f'{KAFKA_IP}:9092')

def generate_transaction():
    transaction = {
        "transaction_id": f"T{random.randint(10000, 99999)}",
        "timestamp": datetime.utcnow().isoformat(),
        "customer_id": f"C{random.randint(100, 999)}",
        "customer_name": random.choice(["Mario Cox", "John Levy", "Robert Johnson", "Jennifer Morgan"]),
        "product_id": random.choice(["P001", "P002", "P005"]),
        "product_name": random.choice(["Smartwatch", "Smartphone X", "Laptop Pro"]),
        "category": random.choice(["Accessories", "Electronics"]),
        "quantity": random.randint(1, 5),
        "price_per_unit": random.uniform(100, 1500),
        "total_price": 0,
        "payment_method": random.choice(["Credit Card", "Debit Card"]),
        "location": random.choice(["Lake Erinborough, Lithuania", "East Richardside, Ukraine", "North Jennifer, New Caledonia", "South Jacobview, Pakistan"])
    }
    transaction["total_price"] = transaction["quantity"] * transaction["price_per_unit"]
    return transaction

while True:
    transaction = generate_transaction()
    producer.send('transactions', json.dumps(transaction).encode('utf-8'))
    print(f"Produced transaction: {transaction['transaction_id']}")
    time.sleep(5)
