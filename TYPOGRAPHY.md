# Typography System Documentation

## Overview
Комплексная система типографики для проекта недвижимости с адаптивными размерами шрифтов и консистентным стилем.

## Font Sizes

### Base Scale (Responsive)
- `--font-size-xs`: 12-13.6px (clamp(0.75rem, 0.7rem + 0.2vw, 0.85rem))
- `--font-size-sm`: 14-16px (clamp(0.875rem, 0.8rem + 0.3vw, 1rem))
- `--font-size-base`: 16-20px (clamp(1rem, 0.95rem + 0.5vw, 1.25rem))
- `--font-size-lg`: 18-24px (clamp(1.125rem, 1rem + 0.8vw, 1.5rem))
- `--font-size-xl`: 20-32px (clamp(1.25rem, 1.1rem + 1vw, 2rem))
- `--font-size-2xl`: 24-40px (clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem))
- `--font-size-3xl`: 30-48px (clamp(1.875rem, 1.5rem + 2vw, 3rem))
- `--font-size-4xl`: 36-56px (clamp(2.25rem, 1.8rem + 2.5vw, 3.5rem))
- `--font-size-5xl`: 42-64px (clamp(2.625rem, 2rem + 3vw, 4rem))

### Specialized Sizes
- `--font-size-micro`: 10-11.2px - для мелких элементов
- `--font-size-caption`: 12.8-14.4px - для подписей и сносок
- `--font-size-button`: 14.4-17.6px - для текста в кнопках
- `--font-size-tag`: 13.6-16px - для тегов и меток
- `--font-size-price`: 19.2-28.8px - для отображения цен
- `--font-size-hero`: 32-51.2px - для главных заголовков

## Font Weights
- `--font-weight-light`: 300
- `--font-weight-normal`: 400 (default)
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700
- `--font-weight-extrabold`: 800

## Line Heights
- `--line-height-tight`: 1.1 - для заголовков
- `--line-height-snug`: 1.25 - для подзаголовков
- `--line-height-normal`: 1.5 - для основного текста
- `--line-height-relaxed`: 1.625 - для улучшенной читаемости
- `--line-height-loose`: 2 - для особых случаев

## CSS Classes

### Headings
```css
.heading-1, h1    /* Hero headlines */
.heading-2, h2    /* Section headers */
.heading-3, h3    /* Subsection headers */
.heading-4, h4    /* Component headers */
.heading-5, h5    /* Small headers */
.heading-6, h6    /* Micro headers */
```

### Text Styles
```css
.text-hero        /* Main hero text */
.text-lead        /* Lead paragraphs */
.text-body, p     /* Regular body text */
.text-small       /* Small text */
.text-caption     /* Captions and footnotes */
.text-micro       /* Very small text */
```

### Specialized Classes
```css
.text-button      /* Button text styling */
.text-tag         /* Tag and label styling */
.text-price       /* Price display styling */
```

### Utility Classes
```css
/* Font sizes */
.text-xs, .text-sm, .text-base, .text-lg, .text-xl, .text-2xl, .text-3xl, .text-4xl, .text-5xl

/* Font weights */
.font-light, .font-normal, .font-medium, .font-semibold, .font-bold, .font-extrabold

/* Line heights */
.leading-tight, .leading-snug, .leading-normal, .leading-relaxed, .leading-loose
```

## Usage Examples

### Headlines
```jsx
<h1 className="text-hero">Найдите дом своей мечты</h1>
<h2 className="heading-2">Раздел каталога</h2>
<h3 className="heading-3">Подраздел</h3>
```

### Body Text
```jsx
<p className="text-lead">Вводный текст с увеличенным размером</p>
<p className="text-body">Обычный текст параграфа</p>
<span className="text-small">Мелкий текст</span>
<div className="text-caption">Подпись под изображением</div>
```

### Specialized Elements
```jsx
<button className="text-button">Кнопка</button>
<span className="text-tag">Тег</span>
<div className="text-price">1 500 000 ₽</div>
```

### Manual Styling
```jsx
<p className="text-lg font-medium leading-snug">
  Текст с кастомными настройками
</p>
```

## Component Migration Guide

### Before (Hardcoded)
```jsx
<h1 style={{ fontSize: 'clamp(1.25rem, 6vw + 0.8rem, 2.1rem)' }}>
  Заголовок
</h1>
<p style={{ fontSize: 'clamp(1.05rem, 4vw + 0.7rem, 1.15rem)' }}>
  Текст
</p>
```

### After (Systematic)
```jsx
<h1 className="text-hero">Заголовок</h1>
<p className="text-lead">Текст</p>
```

## Benefits

1. **Consistency**: Единообразный внешний вид во всем приложении
2. **Maintainability**: Легко изменить размеры глобально
3. **Responsiveness**: Автоматическая адаптация к размеру экрана
4. **Performance**: CSS переменные быстрее inline стилей
5. **Accessibility**: Правильная иерархия заголовков
6. **Developer Experience**: Понятные имена классов

## Color Integration

Система типографики интегрируется с цветовой палитрой:
- `--gray-800`: основной цвет текста
- `--gray-700`: цвет заголовков
- `--gray-600`: цвет вторичного текста
- `--gray-500`: цвет неактивных элементов
- `--primary`: акцентный цвет для цен и ссылок

## Notes

- Все размеры используют `clamp()` для плавной адаптивности
- Система поддерживает экраны от 320px до 1440px
- Font-family: 'Inter', 'Segoe UI', Arial, sans-serif
- Базовый размер шрифта: 16-20px в зависимости от экрана
