import { config } from '../consts';
import { cs } from './cs';
import { en } from './en';
import { zhCn } from './zhCn';

const ui = {
  en: en,
  'zh-cn': zhCn,
  cs: cs,
};

export function useTranslations(lang: string) {
  return function t(key: string) {
    return ui[lang][key] || ui[config.lang][key];
  };
}

export const t = useTranslations(config.lang);
