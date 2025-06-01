import os
from PIL import Image

# Путь к основной директории (замените на свой путь)
BASE_DIR = "public/galleries"

# Количество подпапок (от 1 до 30)
NUM_FOLDERS = 30

# Количество изображений в каждой папке
NUM_IMAGES_PER_FOLDER = 12

# Разрешение изображений
IMAGE_WIDTH = 1200
IMAGE_HEIGHT = 1600

# Цвет изображения (серый: RGB(128, 128, 128))
GRAY_COLOR = (128, 128, 128)

# Создание основной директории, если она не существует
if not os.path.exists(BASE_DIR):
    os.makedirs(BASE_DIR)

# Создание подпапок и изображений
for folder_id in range(1, NUM_FOLDERS + 1):
    # Создание подпапки (например, public/galleries/1)
    folder_path = os.path.join(BASE_DIR, str(folder_id))
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    
    # Создание изображений в текущей подпапке
    for img_number in range(1, NUM_IMAGES_PER_FOLDER + 1):
        # Формирование имени файла (например, 1-1.jpg)
        image_name = f"{folder_id}-{img_number}.jpg"
        image_path = os.path.join(folder_path, image_name)
        
        # Создание серого изображения
        image = Image.new('RGB', (IMAGE_WIDTH, IMAGE_HEIGHT), GRAY_COLOR)
        image.save(image_path, 'JPEG')
        print(f"Создано изображение: {image_path}")

print("Создание галерей завершено!")