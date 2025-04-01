import spacy
import nltk
from transformers import pipeline
import re


# Метод 1: spaCy NER
def spacy_ner(text, language='en'):
    # Загрузка соответствующей модели в зависимости от языка
    if language == 'en':
        nlp = spacy.load('en_core_web_sm')
    else:  # Russian
        nlp = spacy.load('ru_core_news_sm')

    doc = nlp(text)
    entities = []

    for ent in doc.ents:
        entities.append({
            'text': ent.text,
            'start': ent.start_char,
            'end': ent.end_char,
            'type': ent.label_
        })

    return entities


# Метод 2: NLTK NER
def nltk_ner(text, language='en'):
    # Для упрощения используем NLTK с простыми правилами
    entities = []
    words = nltk.word_tokenize(text)

    # Распознавание имен (слова с заглавной буквы не в начале предложения)
    for i, word in enumerate(words):
        if word[0].isupper() and i > 0 and words[i - 1] not in ['.', '!', '?']:
            start = text.find(word)
            if start != -1:
                entities.append({
                    'text': word,
                    'start': start,
                    'end': start + len(word),
                    'type': 'PERSON'
                })

    return entities


# Метод 3: Transformer-based NER
def transformer_ner(text, language='en'):
    # Выбор модели в зависимости от языка
    if language == 'en':
        ner_pipeline = pipeline("ner", model="dslim/bert-base-NER")
    else:
        # Для русского используем многоязычную модель
        ner_pipeline = pipeline("ner", model="DeepPavlov/bert-base-multilingual-cased-ner")

    results = ner_pipeline(text)
    entities = []

    # Объединение последовательных токенов одной сущности
    current_entity = None

    for result in results:
        entity_type = result['entity']
        if current_entity and current_entity['type'] == entity_type and result['start'] <= current_entity['end'] + 1:
            current_entity['end'] = result['end']
            current_entity['text'] = text[current_entity['start']:current_entity['end']]
        else:
            if current_entity:
                entities.append(current_entity)

            current_entity = {
                'text': text[result['start']:result['end']],
                'start': result['start'],
                'end': result['end'],
                'type': entity_type
            }

    if current_entity:
        entities.append(current_entity)

    return entities


# Метод 4: Rule-based NER
def rule_based_ner(text, language='en'):
    entities = []

    # Шаблоны персонажей из "Алисы в стране чудес"
    character_patterns = {
        'en': ['Alice', 'White Rabbit', 'Queen', 'King', 'Cheshire Cat'],
        'ru': ['Алиса', 'Белый Кролик', 'Королева', 'Король', 'Чеширский Кот']
    }

    # Шаблоны локаций
    location_patterns = {
        'en': ['Wonderland', 'Garden', 'Hall', 'Rabbit-hole'],
        'ru': ['Страна Чудес', 'Сад', 'Зал', 'Кроличья нора']
    }

    # Поиск персонажей
    for pattern in character_patterns[language]:
        start = 0
        while True:
            start = text.lower().find(pattern.lower(), start)
            if start == -1:
                break

            entities.append({
                'text': text[start:start + len(pattern)],
                'start': start,
                'end': start + len(pattern),
                'type': 'CHARACTER'
            })
            start += len(pattern)

    # Поиск локаций
    for pattern in location_patterns[language]:
        start = 0
        while True:
            start = text.lower().find(pattern.lower(), start)
            if start == -1:
                break

            entities.append({
                'text': text[start:start + len(pattern)],
                'start': start,
                'end': start + len(pattern),
                'type': 'LOCATION'
            })
            start += len(pattern)

    return entities
