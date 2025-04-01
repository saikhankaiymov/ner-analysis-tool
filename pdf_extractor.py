import pdfplumber
import os
import re


class PDFExtractor:
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.paragraphs = []
        self.extract_paragraphs()

    def extract_paragraphs(self):
        """Извлекает все абзацы из PDF-файла"""
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"

                # Разделяем текст на абзацы
                # Считаем абзацем текст между двумя пустыми строками или отступами
                paragraphs = re.split(r'\n\s*\n', text)
                self.paragraphs = [p.strip() for p in paragraphs if p.strip()]
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            self.paragraphs = []

    def get_paragraph(self, index):
        """Возвращает абзац по указанному индексу"""
        if 0 <= index < len(self.paragraphs):
            return self.paragraphs[index]
        return None

    def get_paragraphs_count(self):
        """Возвращает количество абзацев"""
        return len(self.paragraphs)

    def search_paragraphs(self, query):
        """Ищет абзацы, содержащие указанный запрос"""
        results = []
        for i, paragraph in enumerate(self.paragraphs):
            if query.lower() in paragraph.lower():
                results.append((i, paragraph))
        return results


# Функция для получения экземпляров PDFExtractor для обеих книг
def load_books(data_dir="data"):
    en_pdf_path = os.path.join(data_dir, "alice_en.pdf")
    ru_pdf_path = os.path.join(data_dir, "alice_ru.pdf")

    en_book = PDFExtractor(en_pdf_path) if os.path.exists(en_pdf_path) else None
    ru_book = PDFExtractor(ru_pdf_path) if os.path.exists(ru_pdf_path) else None

    return en_book, ru_book
