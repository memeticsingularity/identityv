import { ref } from 'vue'

const STORAGE_KEY = 'cryptic-notes-locale'
const fallbackLocale = 'zh'

export const locale = ref(localStorage.getItem(STORAGE_KEY) || fallbackLocale)

export function setLocale(value) {
  locale.value = value
  localStorage.setItem(STORAGE_KEY, value)
}

export function useI18n(messages) {
  function t(key) {
    const dict = messages[locale.value] || messages[fallbackLocale]
    return key.split('.').reduce((obj, k) => obj?.[k], dict) || key
  }

  return {
    locale,
    setLocale,
    t,
  }
}
