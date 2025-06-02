import os
import csv
import random
import shutil
from collections import defaultdict

CSV_PATH = "real_estate_russian.csv"
BASE_DIR = os.path.join("public", "developers")
SOURCE_IMAGES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "public", "real_images"))

# Очищаем папку developers перед генерацией
if os.path.exists(BASE_DIR):
    shutil.rmtree(BASE_DIR)

# Получаем список всех исходных изображений
all_images = [f for f in os.listdir(SOURCE_IMAGES_DIR) if os.path.isfile(os.path.join(SOURCE_IMAGES_DIR, f))]
if not all_images:
    raise Exception("No images found in public/real_images")

# Считаем объекты по каждому комплексу
complex_objects = defaultdict(list)

with open(CSV_PATH, newline='', encoding="utf-8") as csvfile:
    reader = list(csv.DictReader(csvfile))
    for row in reader:
        developer = row["developer"]
        complex_ = row["complex"]
        complex_key = (developer, complex_)
        complex_objects[complex_key].append(row)

# Для каждого комплекса — уникальные папки с уникальным n
for (developer, complex_), objects in complex_objects.items():
    images_pool = all_images[:]
    random.shuffle(images_pool)
    img_idx = 0
    for n, row in enumerate(objects, 1):
        folder_name = f"{developer}_{complex_}_{n}"
        path = os.path.join(BASE_DIR, developer, complex_, folder_name)
        os.makedirs(path, exist_ok=True)
        num_images = random.randint(3, 15)
        chosen_images = images_pool[img_idx:img_idx+num_images]
        # Если не хватает картинок — перемешать и начать заново
        if len(chosen_images) < num_images:
            random.shuffle(images_pool)
            img_idx = 0
            chosen_images = images_pool[img_idx:img_idx+num_images]
        for idx, img_name in enumerate(chosen_images, 1):
            src = os.path.join(SOURCE_IMAGES_DIR, img_name)
            dst = os.path.join(path, f"{idx}.jpg")
            shutil.copyfile(src, dst)
        img_idx += num_images

print("Image folder structure and images generated successfully.")
