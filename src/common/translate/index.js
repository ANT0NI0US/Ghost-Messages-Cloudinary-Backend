import { enums } from "../../common/index.js";
import ar from "./ar.json" with { type: "json" };
import en from "./en.json" with { type: "json" };

const dictionaries = {
  [enums.LanguageEnum.AR]: ar,
  [enums.LanguageEnum.EN]: en,
};

export const translate = (lang, key) => {
  const dictionary = dictionaries[lang];
  const message = key
    .split(".")
    .reduce((node, part) => node?.[part], dictionary);
  return message ?? key;
};
