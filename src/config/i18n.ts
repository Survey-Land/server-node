// src/config/i18n.ts
import i18n from 'i18n'
import path from 'path'

i18n.configure({
  locales: ['en', 'ar'],
  directory: path.join(__dirname, '..', 'locales'),
  defaultLocale: 'ar',
  queryParameter: 'lang',
  autoReload: true,
  syncFiles: true,
})

export default i18n
