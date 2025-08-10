# Руководство по миграции на иерархическую архитектуру

## Обзор изменений

Проект переведён с плоской структуры данных на иерархическую:
- **Было**: все данные в одной коллекции `properties`
- **Стало**: три коллекции `developers`, `complexes`, `properties`

## Шаги миграции

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Создание файла .env

В папке `backend/` создайте файл `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/real-estate-app
PORT=3001
NODE_ENV=development
```

### 3. Запуск миграции

```bash
cd backend
npm run migrate
```

Скрипт автоматически:
- Создаст коллекции `developers` и `complexes`
- Перенесёт данные из старых полей `developer` и `complex`
- Обновит связи между объектами
- Удалит устаревшие поля

### 4. Проверка результатов

После миграции в базе должно быть:
- Коллекция `developers` с застройщиками
- Коллекция `complexes` с жилыми комплексами  
- Коллекция `properties` с обновлёнными связями

### 5. Запуск сервера

```bash
cd backend
npm start
```

## Структура данных после миграции

### Developers
```javascript
{
  _id: ObjectId,
  name: "Название застройщика",
  slug: "developer_slug",
  description: "Описание",
  status: "active",
  lastSeenAt: Date,
  updatedBy: "migration"
}
```

### Complexes
```javascript
{
  _id: ObjectId,
  name: "Название комплекса",
  slug: "complex_slug",
  developerId: ObjectId, // ссылка на Developer
  developerSlug: "developer_slug",
  city: "Город",
  totalFloors: 25,
  seaDistance: "500м",
  deliveryDate: "2024 Q4",
  status: "active"
}
```

### Properties
```javascript
{
  _id: ObjectId,
  title: "Название объекта",
  developerId: ObjectId, // ссылка на Developer
  developerSlug: "developer_slug",
  complexId: ObjectId,   // ссылка на Complex
  complexSlug: "complex_slug",
  tags: {
    price: 5000000,
    area: 75.5,
    rooms: "2",
    floor: 15,
    finishing: "Чистовая",
    view: "Море"
  },
  status: "active"
}
```

## Возможные проблемы

### Ошибка подключения к MongoDB
- Убедитесь, что MongoDB запущен
- Проверьте строку подключения в `.env`

### Ошибки валидации
- Проверьте, что все обязательные поля заполнены
- Убедитесь в корректности типов данных

### Дублирование данных
- Скрипт использует upsert для предотвращения дублей
- Проверьте уникальность slug'ов

## Откат изменений

В случае проблем можно откатиться:

```bash
# Остановить сервер
# Удалить новые коллекции
# Восстановить из бэкапа
```

## Тестирование

После миграции проверьте:

1. **API endpoints**:
   - `GET /api/developers` - список застройщиков
   - `GET /api/complexes` - список комплексов
   - `GET /api/properties` - список объектов

2. **Связи данных**:
   - Объекты правильно связаны с комплексами
   - Комплексы правильно связаны с застройщиками

3. **Фильтрация**:
   - Фильтры работают корректно
   - Агрегация статистики работает быстро

## Поддержка

При возникновении проблем:
1. Проверьте логи миграции
2. Убедитесь в корректности данных
3. Проверьте индексы MongoDB
