// src/components/YandexProvider.jsx
"use client";
import { YMaps } from "react-yandex-maps";

const YandexProvider = ({ children }) => {
    return <YMaps>{children}</YMaps>;
};

export default YandexProvider;
