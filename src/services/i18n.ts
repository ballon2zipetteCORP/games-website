import {createI18n} from "vue-i18n";

function getMessages() {
    const locales = import.meta.glob("../locales/*.json", {eager: true});
    const messages: any = {};
    for(const [k, v] of Object.entries(locales)) {
        const name = k.replace(/..\/locales\/|.json/g, "");
        messages[name] = v;
    }
    return messages;
}

export default createI18n({
    messages: getMessages(),
    globalInjection: true,
    locale: navigator.language.substring(0, 2) || import.meta.env.VITE_FALLBACK_LANG,
    fallbackLocale: import.meta.env.VITE_FALLBACK_LANG,
    numberFormats: {
        'fr': {
            currency: {
                style: 'currency', currency: 'EUR', notation: 'standard'
            },
            decimal: {
                style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2
            },
            percent: {
                style: 'percent', useGrouping: false
            }
        },
    }
});