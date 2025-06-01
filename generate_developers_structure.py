import os
import random
from PIL import Image

# Путь к основной директории
BASE_DIR = "public/developers"

# Список застройщиков и их ЖК (должен совпадать с data.json)
DEVELOPERS = {
    "СтройГрад": ["ЛеснаяРека", "ОзерныйБерег", "Речной"],
    "ЖилСтрой": ["ЗеленыйКвартал", "Северный", "Центральный"],
    "Новострой": ["Солнечный", "Южный", "Восточный"],
}

# Количество объектов на ЖК (должно совпадать с data.json)
OBJECTS_PER_COMPLEX = range(1, 6)  # Для 30 объектов (3 застройщика × 3 ЖК × 5 объектов)

# Цвет изображений (красный: RGB(255, 0, 0))
IMAGE_COLOR = (255, 0, 0)

# Создание основной директории, если она не существует
if not os.path.exists(BASE_DIR):
    os.makedirs(BASE_DIR)

# Создание структуры и генерация изображений
for developer, complexes in DEVELOPERS.items():
    for complex in complexes:
        for obj_number in OBJECTS_PER_COMPLEX:
            # Формирование уникального ID
            obj_id = f"{developer}-{complex}-{obj_number}"
            
            # Путь к папке объекта
            object_path = os.path.join(BASE_DIR, developer, complex, obj_id, "images")
            if not os.path.exists(object_path):
                os.makedirs(object_path)
            
            # Случайное количество изображений (от 4 до 12)
            num_images = random.randint(4, 12)
            
            # Создание изображений
            for img_number in range(1, num_images + 1):
                # Случайное разрешение
                width = random.randint(600, 1200)
                height = random.randint(600, 1600)
                
                # Формирование имени файла
                image_name = f"{obj_id}-{img_number}.jpg"
                image_path = os.path.join(object_path, image_name)
                
                # Создание изображения
                image = Image.new('RGB', (width, height), IMAGE_COLOR)
                image.save(image_path, 'JPEG', quality=95)
                print(f"Создано изображение: {image_path} (размер: {width}x{height})")
                # Проверка размера файла
                file_size = os.path.getsize(image_path)
                print(f"Размер файла: {file_size} байт")

print("Создание структуры и изображений завершено!")