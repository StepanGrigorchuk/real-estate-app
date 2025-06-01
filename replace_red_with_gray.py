import os
from PIL import Image

# Путь к основной директории
BASE_DIR = "public/developers"

# Целевой цвет (серый: RGB(128, 128, 128))
GRAY_COLOR = (128, 128, 128)

# Перебираем все папки и изображения
for developer in os.listdir(BASE_DIR):
    developer_path = os.path.join(BASE_DIR, developer)
    if not os.path.isdir(developer_path):
        continue

    for complex in os.listdir(developer_path):
        complex_path = os.path.join(developer_path, complex)
        if not os.path.isdir(complex_path):
            continue

        for obj_id in os.listdir(complex_path):
            obj_path = os.path.join(complex_path, obj_id)
            if not os.path.isdir(obj_path):
                continue

            images_path = os.path.join(obj_path, "images")
            if not os.path.isdir(images_path):
                continue

            # Перебираем все изображения в папке images
            for img_name in os.listdir(images_path):
                img_path = os.path.join(images_path, img_name)
                if not img_name.endswith('.jpg'):
                    continue

                try:
                    # Открываем изображение
                    image = Image.open(img_path).convert('RGB')
                    print(f"Обрабатываем изображение: {img_path}")

                    # Получаем размеры изображения
                    width, height = image.size
                    # Создаём новое серое изображение с теми же размерами
                    new_image = Image.new('RGB', (width, height), GRAY_COLOR)
                    # Сохраняем его на место старого
                    new_image.save(img_path, 'JPEG', quality=95)
                    print(f"Изображение {img_path} заменено на серое")

                    image.close()
                except Exception as e:
                    print(f"Ошибка при обработке {img_path}: {e}")

print("Замена всех изображений на серые завершена!")