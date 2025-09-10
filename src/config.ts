export const { VITE_HOSHIFY_ICON, VITE_ENV } = import.meta.env;

export const VITE_SERVER_URL = VITE_ENV === "development" ? import.meta.env.VITE_SERVER_URL_DEV : import.meta.env.VITE_SERVER_URL;
