$(document).ready(function() {
    // Анализ английского текста
    $('#analyze-english').click(function() {
        analyzeText('en');
    });

    // Анализ русского текста
    $('#analyze-russian').click(function() {
        analyzeText('ru');
    });

    // Сравнение методов для английского текста
    $('#compare-all-english').click(function() {
        compareAllMethods('en');
    });

    // Сравнение методов для русского текста
    $('#compare-all-russian').click(function() {
        compareAllMethods('ru');
    });

    // Обработчики для работы с PDF (английский)
    $('#en-load-paragraph').click(function() {
        loadParagraph('en');
    });

    $('#en-search-btn').click(function() {
        searchParagraphs('en');
    });

    $('#en-use-for-analysis').click(function() {
        useForAnalysis('en');
    });

    // Обработчики для работы с PDF (русский)
    $('#ru-load-paragraph').click(function() {
        loadParagraph('ru');
    });

    $('#ru-search-btn').click(function() {
        searchParagraphs('ru');
    });

    $('#ru-use-for-analysis').click(function() {
        useForAnalysis('ru');
    });

    function analyzeText(language) {
        const text = language === 'en' ? $('#english-text').val() : $('#russian-text').val();
        const method = language === 'en' ? $('#english-method').val() : $('#russian-method').val();

        // Индикатор загрузки
        const resultsSelector = language === 'en' ? '#english-results' : '#russian-results';
        $(resultsSelector).html('<div class="text-center"><div class="spinner-border" role="status"></div><p>Analyzing...</p></div>');

        $.ajax({
            url: '/analyze',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                text: text,
                language: language,
                method: method
            }),
            success: function(response) {
                displayResults(text, response.entities, language);
            },
            error: function(error) {
                console.error('Error:', error);
                $(resultsSelector).html('<div class="alert alert-danger">An error occurred during analysis</div>');
            }
        });
    }

    function displayResults(text, entities, language) {
        // Сортировка сущностей по позиции
        entities.sort((a, b) => a.start - b.start);

        let result = '';
        let lastIndex = 0;

        // Формирование текста с выделенными сущностями
        for (const entity of entities) {
            // Добавление текста до сущности
            result += text.substring(lastIndex, entity.start);

            // Добавление сущности с выделением
            result += `<span class="entity ${entity.type}" title="${entity.type}">
                       ${text.substring(entity.start, entity.end)}</span>`;

            lastIndex = entity.end;
        }

        // Добавление оставшегося текста
        result += text.substring(lastIndex);

        const resultsSelector = language === 'en' ? '#english-results' : '#russian-results';
        $(resultsSelector).html(result);

        // Список найденных сущностей
        let entityList = '';
        if (entities.length > 0) {
            for (const entity of entities) {
                entityList += `<li><strong>${entity.text}</strong> - ${entity.type}</li>`;
            }
        } else {
            entityList = '<li>No entities found</li>';
        }

        const entityListSelector = language === 'en' ? '#english-entity-list' : '#russian-entity-list';
        $(entityListSelector).html(entityList);
    }

    function compareAllMethods(language) {
        const text = language === 'en' ? $('#english-text').val() : $('#russian-text').val();
        const methods = ['spacy', 'nltk', 'transformer', 'rule_based'];
        const resultContainer = language === 'en' ? '#english-comparison' : '#russian-comparison';

        $(resultContainer).html('<div class="text-center"><div class="spinner-border" role="status"></div><p>Analyzing with all methods...</p></div>');

        // Сохраняем промисы для всех анализов
        const analysisPromises = methods.map(method => {
            return $.ajax({
                url: '/analyze',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    text: text,
                    language: language,
                    method: method
                })
            });
        });

        // Когда все анализы завершены
        Promise.all(analysisPromises)
            .then(responses => {
                let comparisonHTML = '<div class="table-responsive"><table class="table table-bordered mt-3">';
                comparisonHTML += '<thead><tr><th>Method</th><th>Highlighted Text</th><th>Entities Found</th></tr></thead><tbody>';

                methods.forEach((method, index) => {
                    const methodName = methods[index].charAt(0).toUpperCase() + methods[index].slice(1) + ' NER';
                    const response = responses[index];

                    // Генерация текста с выделением
                    let highlightedText = generateHighlightedText(text, response.entities);

                    // Генерация списка сущностей
                    let entityList = '<ul class="list-unstyled">';
                    if (response.entities.length > 0) {
                        response.entities.forEach(entity => {
                            entityList += `<li><span class="badge badge-${getEntityColor(entity.type)}">${entity.type}</span> ${entity.text}</li>`;
                        });
                    } else {
                        entityList += '<li>No entities found</li>';
                    }
                    entityList += '</ul>';

                    comparisonHTML += `<tr>
                        <td>${methodName}</td>
                        <td>${highlightedText}</td>
                        <td>${entityList}</td>
                    </tr>`;
                });

                comparisonHTML += '</tbody></table></div>';
                $(resultContainer).html(comparisonHTML);
            })
            .catch(error => {
                console.error('Error in comparison:', error);
                $(resultContainer).html('<div class="alert alert-danger">An error occurred during comparison</div>');
            });
    }

    function generateHighlightedText(text, entities) {
        if (!entities || entities.length === 0) {
            return text;
        }

        // Сортировка сущностей по позиции
        entities.sort((a, b) => a.start - b.start);

        let result = '';
        let lastIndex = 0;

        // Формирование текста с выделенными сущностями
        for (const entity of entities) {
            // Добавление текста до сущности
            result += text.substring(lastIndex, entity.start);

            // Добавление сущности с выделением
            result += `<span class="entity ${entity.type}" title="${entity.type}">
                       ${text.substring(entity.start, entity.end)}</span>`;

            lastIndex = entity.end;
        }

        // Добавление оставшегося текста
        result += text.substring(lastIndex);

        return result;
    }

    function getEntityColor(entityType) {
        const colorMap = {
            'PERSON': 'primary',
            'LOCATION': 'success',
            'ORGANIZATION': 'info',
            'CHARACTER': 'warning',
            'DATE': 'secondary',
            'MISC': 'dark'
        };

        return colorMap[entityType] || 'secondary';
    }

    // Функции для работы с PDF

    function loadParagraph(language) {
        const paragraphNum = language === 'en' ?
                            $('#en-paragraph-number').val() :
                            $('#ru-paragraph-number').val();

        $.ajax({
            url: '/get_paragraph',
            method: 'GET',
            data: {
                language: language,
                index: paragraphNum
            },
            success: function(response) {
                if (response.error) {
                    showParagraphError(language, response.error);
                } else {
                    showParagraph(language, response.paragraph);
                }
            },
            error: function(error) {
                console.error('Error:', error);
                showParagraphError(language, 'Failed to load paragraph');
            }
        });
    }

    function searchParagraphs(language) {
        const query = language === 'en' ?
                     $('#en-search-query').val() :
                     $('#ru-search-query').val();

        if (!query) {
            return;
        }

        const resultsContainer = language === 'en' ?
                                '#en-search-results' :
                                '#ru-search-results';

        $(resultsContainer).html('<div class="text-center"><div class="spinner-border" role="status"></div><p>Searching...</p></div>');

        $.ajax({
            url: '/search_paragraphs',
            method: 'GET',
            data: {
                language: language,
                query: query
            },
            success: function(response) {
                if (response.error) {
                    $(resultsContainer).html(`<div class="alert alert-danger">${response.error}</div>`);
                } else if (response.results.length === 0) {
                    $(resultsContainer).html(`<div class="alert alert-info">No results found</div>`);
                } else {
                    let html = '';
                    response.results.forEach(result => {
                        const previewText = result.text.length > 150 ?
                                          result.text.substring(0, 150) + '...' :
                                          result.text;

                        html += `<a href="#" class="list-group-item list-group-item-action paragraph-result" 
                                  data-language="${language}" data-index="${result.index}">
                                 <strong>Paragraph ${result.index}</strong>: ${previewText}
                               </a>`;
                    });

                    $(resultsContainer).html(html);

                    // Добавляем обработчики для результатов поиска
                    $('.paragraph-result').click(function(e) {
                        e.preventDefault();
                        const lng = $(this).data('language');
                        const idx = $(this).data('index');

                        // Обновляем номер абзаца
                        if (lng === 'en') {
                            $('#en-paragraph-number').val(idx);
                        } else {
                            $('#ru-paragraph-number').val(idx);
                        }

                        // Загружаем абзац
                        loadParagraph(lng);
                    });
                }
            },
            error: function(error) {
                console.error('Error:', error);
                $(resultsContainer).html('<div class="alert alert-danger">Search failed</div>');
            }
        });
    }

    function showParagraph(language, text) {
        const previewContainer = language === 'en' ?
                                '#en-paragraph-preview' :
                                '#ru-paragraph-preview';

        $(previewContainer).text(text);
    }

    function showParagraphError(language, errorMessage) {
        const previewContainer = language === 'en' ?
                                '#en-paragraph-preview' :
                                '#ru-paragraph-preview';

        $(previewContainer).html(`<div class="alert alert-danger">${errorMessage}</div>`);
    }

    function useForAnalysis(language) {
        const previewContainer = language === 'en' ?
                                '#en-paragraph-preview' :
                                '#ru-paragraph-preview';

        const textareaSelector = language === 'en' ?
                               '#english-text' :
                               '#russian-text';

        const text = $(previewContainer).text();
        $(textareaSelector).val(text);

        // Переключаемся на вкладку анализа
        $('#analysis-tab').tab('show');

        // Переключаемся на соответствующий язык
        if (language === 'en') {
            $('#english-tab').tab('show');
        } else {
            $('#russian-tab').tab('show');
        }
    }
});
