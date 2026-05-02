import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'zh', name: '中文' },
  { code: 'ar', name: 'العربية' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  useEffect(() => {
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
  }, [i18n.language])

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      class="px-3 py-1.5 rounded-lg border border-border-default bg-bg-1 text-text-0 text-[13px] outline-none focus:border-green"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  )
}
