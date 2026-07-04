(function () {
    const ADDON_NAME = 'Hide MiniPlayer';

    // Хелпер для извлечения значения из объекта настроек
    function unwrapSetting(entry, fallback) {
        if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
            if (typeof entry.value !== 'undefined') return entry.value;
            if (typeof entry.default !== 'undefined') return entry.default;
        }
        return typeof entry !== 'undefined' ? entry : fallback;
    }

    // Применение настроек — создаём/обновляем <style> тег
    function applySettings(settings) {
        let styleElement = document.getElementById('hide-miniplayer-style');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'hide-miniplayer-style';
            document.head.appendChild(styleElement);
        }

        const shouldHide = settings
            ? Boolean(unwrapSetting(settings['hideMiniPlayer'], true))
            : true;

        styleElement.textContent = shouldHide
            ? `button[aria-label="miniplayer"] { display: none !important; }`
            : '';
    }

    // Применяем настройки по умолчанию сразу при загрузке
    applySettings(null);

    // Подключаемся к новому API настроек
    const settingsStore = window.pulsesyncApi?.getSettings(ADDON_NAME) ?? {
        getCurrent: () => ({}),
        onChange: () => () => {},
    };

    // Читаем текущие настройки и подписываемся на изменения
    applySettings(settingsStore.getCurrent());

    settingsStore.onChange(function (nextSettings) {
        applySettings(nextSettings);
    });
})();
