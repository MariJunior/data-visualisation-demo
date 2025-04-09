# 📊 Data Visualization Demo

## 🌟 Введение

**Data Visualization Demo** — это интерактивный проект, демонстрирующий возможности визуализации данных с использованием библиотеки Chart.js в среде React/Next.js. Проект создан с целью исследования и демонстрации широких возможностей Chart.js для работы с различными типами данных и форматами их представления.

## 🎯 Цели проекта

- ✨ Продемонстрировать гибкость и мощь библиотеки Chart.js для визуализации данных
- 📈 Показать различные способы загрузки и обработки данных (JSON, Excel/CSV)
- 🖱️ Предоставить интерактивный интерфейс для настройки параметров визуализации
- 🏗️ Создать основу для быстрой интеграции визуализации данных в другие проекты

## 🛠️ Технологический стек

![Next.js](https://img.shields.io/badge/-Next.js-000000?logo=next.js) ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)  
![Ant Design](https://img.shields.io/badge/-Ant%20Design-0170FE?logo=ant-design&logoColor=white) ![Chart.js](https://img.shields.io/badge/-Chart.js-FF6384?logo=chart.js&logoColor=white)  
![Excel](https://img.shields.io/badge/-Excel/CSV-217346?logo=microsoft-excel&logoColor=white) ![Vercel](https://img.shields.io/badge/-Vercel-000000?logo=vercel&logoColor=white)

| Категория         | Стек                                                                      |
|------------------|---------------------------------------------------------------------------|
| 🖥️ Frontend      | [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/) |
| 🧩 UI             | [Ant Design](https://ant.design/)                                         |
| 📊 Визуализация  | [Chart.js](https://www.chartjs.org/), [chartjs-plugin-zoom](https://www.chartjs.org/chartjs-plugin-zoom/) |
| 📄 Данные         | [ExcelJS](https://github.com/exceljs/exceljs) для работы с Excel/CSV      |
| ☁️ Хостинг        | [Vercel](https://vercel.com/)                                              |

## 🏛️ Архитектура проекта

Проект построен на основе компонентного подхода и состоит из двух основных блоков:

1. **📥 Компонент загрузки данных (DataUploader)** — отвечает за загрузку, парсинг и подготовку данных из различных источников
2. **📊 Компонент визуализации (ChartJSComponent)** — отвечает за отображение данных в виде различных типов графиков с широкими возможностями настройки

Взаимодействие между компонентами осуществляется через передачу данных от DataUploader к ChartJSComponent, что обеспечивает гибкость и модульность решения.

## 📥 Компонент загрузки данных (DataUploader/index.tsx)

### 🎯 Назначение

Компонент DataUploader предоставляет пользователю несколько способов загрузки данных для последующей визуализации:

1. ✏️ Ввод JSON-данных в текстовое поле
2. 📄 Загрузка JSON-файла
3. 📊 Загрузку Excel/CSV файла

### 💡 Основные возможности

- 🔍 Парсинг JSON-данных — анализ структуры JSON и автоматическое определение путей к данным
- 🗃️ Обработка Excel/CSV — извлечение данных из таблиц, работа с несколькими листами
- ✅ Валидация данных — проверка соответствия формату Chart.js
- 🖱️ Интерактивный выбор данных — возможность выбрать конкретные пути в JSON или колонки в Excel для визуализации

### 🧩 Структура компонента

Компонент использует вкладки (Tabs) для переключения между различными способами загрузки данных:

1. **📝 JSON text** — вкладка для ввода JSON-данных в текстовое поле
2. **📂 JSON file** — вкладка для загрузки JSON-файла
3. **📊 Excel/CSV** — вкладка для загрузки Excel или CSV файла

Каждая вкладка представлена отдельным компонентом:

- `JsonTextTab` — для работы с текстовым JSON
- `JsonFileTab` — для загрузки JSON-файлов
- `ExcelFileTab` — для работы с Excel/CSV файлами

### 🎣 Кастомные хуки

Компонент использует несколько кастомных хуков для управления данными:

- `useJsonData` — обработка JSON-данных, извлечение путей, валидация
- `useExcelData` — работа с Excel/CSV файлами, извлечение данных из листов и колонок
- `useFileUpload` — управление процессом загрузки файлов, валидация размера

### 🔄 Процесс обработки данных

1. **📥 Загрузка данных** — через текстовое поле или файл
2. **🔍 Парсинг** — преобразование данных в структурированный формат
3. **📊 Анализ структуры** — определение доступных путей (для JSON) или колонок (для Excel)
4. **🖱️ Выбор данных** — пользователь выбирает, какие именно данные визуализировать
5. **🔄 Преобразование** — данные преобразуются в формат, совместимый с Chart.js
6. **➡️ Передача** — подготовленные данные передаются в компонент визуализации

## 📊 Компонент визуализации (ChartJSComponent/index.tsx)

### 🎯 Назначение

Компонент ChartJSComponent отвечает за визуализацию данных с использованием библиотеки Chart.js. Он предоставляет широкие возможности настройки внешнего вида и поведения графиков.

### 💡 Основные возможности

- 📈 Поддержка различных типов графиков — линейные, столбчатые, круговые, радарные и др.
- 🎨 Настройка внешнего вида — цветовые схемы, толщина линий, отображение легенды
- 🎬 Анимация — различные типы анимаций с настраиваемыми параметрами
- 🖱️ Интерактивность — масштабирование, панорамирование, всплывающие подсказки
- 📱 Адаптивность — автоматическое изменение размера графика при изменении размера контейнера

### 🧩 Структура компонента

Компонент состоит из нескольких частей:

1. **🖼️ ChartCanvas** — непосредственно холст для отрисовки графика
2. **🏷️ ChartHeader** — заголовок с информацией о типе графика
3. **🎛️ ChartControls** — панель управления настройками графика

### 🎛️ Управление состоянием

Для управления состоянием используется `useReducer` с набором действий, определенных в `chartReducer`:

- 🔄 Изменение типа графика
- 📊 Изменение набора данных
- 🎨 Настройка внешнего вида (цвета, толщина линий, отображение легенды)
- 🎬 Управление анимацией
- ✏️ Настройка заголовков и подзаголовков

### � Кастомные хуки

- `useChartInstance` — управление экземпляром графика Chart.js
- `useChartAnimation` — настройка и управление анимацией графика
- `useIsDarkMode` — определение текущей темы (светлая/темная)

### 📊 Типы графиков

Компонент поддерживает следующие типы графиков:

| Тип | Иконка | Описание |
|------|--------|----------|
| `LINE` | 📈 | Линейный график |
| `BAR` | 📊 | Столбчатая диаграмма |
| `PIE` | 🥧 | Круговая диаграмма |
| `DOUGHNUT` | 🍩 | Кольцевая диаграмма |
| `RADAR` | 📡 | Радарная диаграмма |
| `POLAR_AREA` | 🧭 | Полярная диаграмма |
| `SCATTER` | 🎯 | Точечная диаграмма |
| `BUBBLE` | 🫧 | Пузырьковая диаграмма |
| `AREA` | 🗺️ | Область |
| `COMBO` | 🧩 | Комбинированный график |

### 🔄 Совместимость типов графиков с данными

Компонент автоматически определяет, какие типы графиков совместимы с текущим набором данных:

- 📈 `SALES`, `USERS`, `REVENUE` — совместимы с `LINE` и `BAR`
- 🎯 `PERFORMANCE` — совместимы с `RADAR` и `POLAR_AREA`
- 👥 `DEMOGRAPHICS` — совместимы с `PIE` и `DOUGHNUT`
- ↔️ `COMPARISON` — совместимы с `BAR`
- ⏳ `TIME_DATA` — совместимы с `LINE`

При загрузке пользовательских данных доступны все типы графиков.

---

## 🔮 Планы на будущее

- 🧮 Группировка и фильтрация данных
- 💾 Экспорт графиков в PNG, SVG, PDF
- 🌐 i18n
- Подключение дополнительных плагинов (drag-and-drop, word-cloud, boxplot, venn)
