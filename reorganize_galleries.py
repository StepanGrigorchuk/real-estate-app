import os
import shutil

# Путь к текущей директории с галереями
OLD_BASE_DIR = "public/galleries"

# Путь к новой директории
NEW_BASE_DIR = "public/galleries"

# Данные объектов (замените на ваши данные из properties)
# Пример структуры: {id: {developer: "СтройГрад", complex: "Лесная Река"}}
OBJECTS = {
  1: {"developer": "СтройГрад", "complex": "Лесная Река"},
  2: {"developer": "ЖилСтрой", "complex": "Зеленый Квартал"},
  # Добавьте остальные объекты до 30
}

# Количество изображений на объект
NUM_IMAGES_PER_OBJECT = 12

# Создание новой структуры
for obj_id, obj_data in OBJECTS.items():
    developer = obj_data["developer"]
    complex = obj_data["complex"]
    
    # Формирование названия объекта (developer-complex-id)
    object_name = f"{developer}-{complex}-{obj_id}".replace(" ", "")
    
    # Путь к старой папке
    old_folder = os.path.join(OLD_BASE_DIR, str(obj_id))
    
    # Путь к новой папке
    new_folder = os.path.join(NEW_BASE_DIR, developer, complex, object_name)
    
    # Создание новой папки, если не существует
    if not os.path.exists(new_folder):
        os.makedirs(new_folder)
    
    # Перемещение изображений
    for img_number in range(1, NUM_IMAGES_PER_OBJECT + 1):
        old_image_path = os.path.join(old_folder, f"{obj_id}-{img_number}.jpg")
        new_image_path = os.path.join(new_folder, f"{object_name}-{img_number}.jpg")
        
        if os.path.exists(old_image_path):
            shutil.move(old_image_path, new_image_path)
            print(f"Перемещено: {old_image_path} -> {new_image_path}")
        else:
            print(f"Изображение не найдено: {old_image_path}")

print("Реорганизация завершена!")