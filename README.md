
---

## Инструмент анализа именованных сущностей (NER)

Веб-приложение для анализа именованных сущностей (NER) в текстах из книги "Алиса в стране чудес" на английском и русском языках с использованием четырех различных методов.
![image](https://github.com/user-attachments/assets/ec26c483-e4b5-46ea-90dd-e55335c42cee)

### Функциональные возможности
![image](https://github.com/user-attachments/assets/079b7311-0994-4989-857d-1d83bdc824cb)


- Анализ текстовых абзацев с помощью четырех методов NER:
    - spaCy NER
    - NLTK NER
    - NER на основе трансформеров
    - NER на основе правил
![image](https://github.com/user-attachments/assets/d2aa0966-ff5e-4b6d-9bc6-dec7f34bc07e)
- Извлечение текста из PDF-файлов и просмотр абзацев
- Поиск текста внутри PDF-документов
  
![image](https://github.com/user-attachments/assets/1bce6dee-3511-448d-afee-51ad05cdf7ca)
- Сравнение различных методов NER "бок о бок"
- Поддержка английского и русского языков
- Визуализация найденных сущностей в тексте


### Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/ner-analysis-tool.git
cd ner-analysis-tool
```

2. Создайте виртуальное окружение и активируйте его:
```bash
python -m venv .venv
# В Windows
.venv\Scripts\activate
# В macOS/Linux
source .venv/bin/activate
```

3. Установите необходимые зависимости:
```bash
pip install -r requirements.txt
```

4. Загрузите требуемые языковые модели:
```bash
python -m spacy download en_core_web_sm
python -m spacy download ru_core_news_sm
python -m nltk.downloader punkt
```

5. Установите PyTorch для работы с моделями-трансформерами:
```bash
pip install torch
pip install transformers[torch]
```


### Использование

1. Поместите PDF-файлы в директорию `data`:
    - Английская версия: `data/alice_en.pdf`
    - Русская версия: `data/alice_ru.pdf`
2. Запустите Flask-приложение:
```bash
python app.py
```

3. Откройте веб-браузер и перейдите по адресу:
```
http://127.0.0.1:5000/
```

4. Используйте интерфейс для:
    - Просмотра абзацев из PDF-файлов
    - Поиска конкретного текста
    - Анализа абзацев с помощью различных методов NER
    - Сравнения результатов между методами

### Структура проекта

- `app.py`: Основное Flask-приложение
- `ner_methods.py`: Реализация методов NER
- `pdf_extractor.py`: Функциональность обработки PDF
- `static/`: Статические ресурсы (CSS, JS, изображения)
- `templates/`: HTML-шаблоны
- `data/`: Директория для PDF-файлов


### Используемые технологии

- Python 3.12
- Flask
- spaCy
- NLTK
- Transformers (Hugging Face)
- pdfplumber
- Bootstrap 4
- jQuery

