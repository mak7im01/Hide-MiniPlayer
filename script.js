(function () {
    // Получение настроек
    async function getSettings(name) {
        try {
            const response = await fetch(`http://localhost:2007/get_handle?name=${name}`);
            if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`);
      
            const { data } = await response.json();
            if (!data?.sections) {
                console.warn("Структура данных не соответствует ожидаемой");
                return null;
            }

            return transformJSON(data);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    // "Трансформирование" полученных настроек для более удобного использования
    function transformJSON(data) {
        const result = {};

        try {
            data.sections.forEach(section => {
                section.items.forEach(item => {
                    if (item.type === "text" && item.buttons) {
                        result[item.id] = {};
                        item.buttons.forEach(button => {
                            result[item.id][button.id] = {
                                value: button.text,
                                default: button.defaultParameter
                            };
                        });
                    } else {
                        result[item.id] = {
                            value: item.bool || item.input || item.selected || item.value || item.filePath,
                            default: item.defaultParameter
                        };
                    }
                });
            });
        } finally {
            return result;
        }
    }

    // Применение настроек
    function applySettings(settings) {
        // Создание "контейнера" для нашего CSS кода
        let styleElement = document.getElementById('hide-miniplayer-style');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'hide-miniplayer-style';
            document.head.appendChild(styleElement);
        }

        // Очищаем его для перезаписи в зависимости от настроек
        styleElement.textContent = '';

        // Если настройки не загружены, используем значение по умолчанию (скрыть)
        const shouldHide = settings ? settings.hideMiniPlayer?.value : true;

        // Применяем настройку, если она включена
        if (shouldHide === true) {
            styleElement.textContent += `
                button[aria-label="miniplayer"] {
                    display: none !important;
                }
            `;
        }
    }

    // Применяем настройки по умолчанию сразу при загрузке
    applySettings(null);

    // Обновляем настройки каждые 2 секунды
    setInterval(async () => {
        const settings = await getSettings("Hide MiniPlayer");
        applySettings(settings);
    }, 2000);
})();
