import csv
import random
import uuid
import json
import re

# Транслитерация для developer/complex/id и файлов
translit_map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y',
    'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    '_': '_', ' ': '_', '-': '_',
}
def translit(s):
    s = s.lower()
    return ''.join(translit_map.get(c, c) for c in s if c.isalnum() or c in ['_', ' '])

def normalize(s):
    s = translit(s)
    s = re.sub(r'[^a-z0-9_]', '', s)
    s = re.sub(r'_+', '_', s)
    return s.strip('_')

# Define possible values
developers = ["ЛСР", "Стройград", "Голубая_Волна", "Южный_берег", "Крымская_ривьера"]
complexes = ["Райский_Уголок", "Горизонт", "Оазис", "Солнечный_Берег", "Морская_Звезда"]
rooms = ["1-комнатная", "2-комнатная", "3-комнатная", "4-комнатная"]
cities = ["Ялта", "Алушта", "Саки", "Бирдидонск"]
delivery = ["сдан"] + [str(year) for year in range(2025, 2036)]
property_types = ["Апартаменты", "Квартира"]
views = ["На море прямой", "На море боковой", "На горы", "Во двор"]
finishes = ["Чистовая", "Подчистовая", "Без отделки", "С мебелью и техникой"]
payment_methods = ["Ипотека", "Рассрочка", "Наличные"]

# Generate 100 properties
properties = []
for n in range(1, 101):
    developer = random.choice(developers)
    complex_name = random.choice(complexes)
    developer_norm = normalize(developer)
    complex_norm = normalize(complex_name)
    identifier = f"{developer_norm}_{complex_norm}_{n}"
    price = random.randint(4000000, 25000000)
    room = random.choice(rooms)
    city = random.choice(cities)
    delivery_date = random.choice(delivery)
    area = random.randint(25, 180)
    distance_to_sea = f"{random.randint(5, 30)} минут пешком"
    property_type = random.choice(property_types)
    view = random.choice(views)
    finish = random.choice(finishes)
    floor = random.randint(1, 18)
    payment = random.choice(payment_methods)
    title = f"{developer} {complex_name} {room}"
    images = []
    # Формируем tags как словарь
    tags = {
        "price": price,
        "rooms": room,
        "city": city,
        "delivery": delivery_date,
        "area": area,
        "sea-distance": distance_to_sea,
        "type": property_type,
        "view": view,
        "finishing": finish,
        "floor": floor,
        "payment": payment
    }
    # Сохраняем tags как JSON-строку для csv
    properties.append([
        identifier, title, developer_norm, complex_norm, json.dumps(images, ensure_ascii=False), json.dumps(tags, ensure_ascii=False)
    ])

# Write to CSV с нужными полями для MongoDB
headers = [
    "id", "title", "developer", "complex", "images", "tags"
]

with open("real_estate_russian.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(properties)

print("CSV file 'real_estate_russian.csv' generated successfully.")