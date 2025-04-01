from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from ner_methods import spacy_ner, nltk_ner, transformer_ner, rule_based_ner
from pdf_extractor import load_books

app = Flask(__name__)

# Загружаем книги при старте приложения
en_book, ru_book = load_books()


@app.route('/')
def index():
    en_paragraphs_count = en_book.get_paragraphs_count() if en_book else 0
    ru_paragraphs_count = ru_book.get_paragraphs_count() if ru_book else 0

    return render_template('index.html',
                           en_paragraphs_count=en_paragraphs_count,
                           ru_paragraphs_count=ru_paragraphs_count)


@app.route('/get_paragraph', methods=['GET'])
def get_paragraph():
    language = request.args.get('language', 'en')
    index = int(request.args.get('index', 0))

    book = en_book if language == 'en' else ru_book
    if not book:
        return jsonify({'error': f'Book in {language} not found', 'paragraph': ''})

    paragraph = book.get_paragraph(index)
    if paragraph is None:
        return jsonify({'error': 'Paragraph index out of range', 'paragraph': ''})

    return jsonify({'paragraph': paragraph})


@app.route('/search_paragraphs', methods=['GET'])
def search_paragraphs():
    language = request.args.get('language', 'en')
    query = request.args.get('query', '')

    book = en_book if language == 'en' else ru_book
    if not book:
        return jsonify({'error': f'Book in {language} not found', 'results': []})

    results = book.search_paragraphs(query)
    return jsonify({'results': [{'index': idx, 'text': text} for idx, text in results]})


@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data.get('text', '')
    language = data.get('language', 'en')
    method = data.get('method', 'spacy')

    try:
        if method == 'spacy':
            entities = spacy_ner(text, language)
        elif method == 'nltk':
            entities = nltk_ner(text, language)
        elif method == 'transformer':
            entities = transformer_ner(text, language)
        elif method == 'rule_based':
            entities = rule_based_ner(text, language)
        else:
            return jsonify({'error': 'Invalid method'})

        return jsonify({'entities': entities})
    except Exception as e:
        return jsonify({'error': str(e), 'entities': []})


@app.route('/pdf/<language>')
def serve_pdf(language):
    filename = "alice_en.pdf" if language == "en" else "alice_ru.pdf"
    return send_from_directory('data', filename)


if __name__ == '__main__':
    # Создаем директорию для PDF-файлов, если она не существует
    os.makedirs('data', exist_ok=True)
    app.run(debug=True)
