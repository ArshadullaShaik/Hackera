(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/language-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LanguageProvider",
    ()=>LanguageProvider,
    "LanguageSelector",
    ()=>LanguageSelector,
    "Translate",
    ()=>Translate,
    "useLanguage",
    ()=>useLanguage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
"use client";
;
const translations = {
    en: {
        explore: "Explore",
        community: "Community",
        help: "Help",
        signIn: "Sign in",
        joinNow: "Join now",
        terms: "Terms",
        privacy: "Privacy",
        region: "Region",
        language: "Language",
        selectLanguage: "Select language",
        heroTitle: "The Hackathon Index.",
        heroDescription: "We scrape the web to find the best hackathons, so you don't have to. Every event, every prize, one dashboard.",
        globalHackathon: "Global Hackathon",
        hackathons: "hackathons",
        hackathonsIndexed: "hackathons indexed",
        liveAggregatedFeed: "Live aggregated feed",
        searchPlaceholder: "Search aggregated events, themes, or tech...",
        locationAll: "Location: all",
        online: "Online",
        inPerson: "In-person",
        hybrid: "Hybrid",
        platformAll: "Platform: all",
        filter: "Filter",
        search: "Search",
        location: "Location",
        platform: "Platform",
        noHackathonsFound: "No hackathons found",
        noHackathonsHint: "Try clearing your search query or selecting a different location or platform filter.",
        upcoming: "Upcoming",
        cashAndPrizes: "Cash & prizes",
        fallbackDescription: "Join this exciting hackathon challenge and build innovative solutions.",
        viewHackathon: "View hackathon page",
        loadMore: "Load more ({shown} of {total} shown)",
        copyright: "© 2026 HACKERA. All rights reserved."
    },
    es: {
        explore: "Explorar",
        community: "Comunidad",
        help: "Ayuda",
        signIn: "Iniciar sesión",
        joinNow: "Únete ahora",
        terms: "Términos",
        privacy: "Privacidad",
        region: "Región",
        language: "Idioma",
        selectLanguage: "Seleccionar idioma",
        heroTitle: "El índice de hackatones.",
        heroDescription: "Rastreamos la web para encontrar los mejores hackatones, para que tú no tengas que hacerlo. Cada evento, cada premio, en un solo panel.",
        globalHackathon: "Hackatón global",
        hackathons: "hackatones",
        hackathonsIndexed: "hackatones indexados",
        liveAggregatedFeed: "Feed agregado en vivo",
        searchPlaceholder: "Busca eventos, temas o tecnología...",
        locationAll: "Ubicación: todas",
        online: "En línea",
        inPerson: "Presencial",
        hybrid: "Híbrido",
        platformAll: "Plataforma: todas",
        filter: "Filtrar",
        search: "Búsqueda",
        location: "Ubicación",
        platform: "Plataforma",
        noHackathonsFound: "No se encontraron hackatones",
        noHackathonsHint: "Intenta borrar tu búsqueda o elegir otra ubicación o plataforma.",
        upcoming: "Próximamente",
        cashAndPrizes: "Efectivo y premios",
        fallbackDescription: "Únete a este emocionante hackatón y crea soluciones innovadoras.",
        viewHackathon: "Ver página del hackatón",
        loadMore: "Cargar más ({shown} de {total} mostrados)",
        copyright: "© 2026 HACKERA. Todos los derechos reservados."
    }
};
const LanguageContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function LanguageProvider({ children }) {
    _s();
    const [locale, setLocale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("en");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LanguageProvider.useEffect": ()=>{
            const savedLocale = window.localStorage.getItem("hackera-language");
            if (savedLocale === "en" || savedLocale === "es") setLocale(savedLocale);
        }
    }["LanguageProvider.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LanguageProvider.useEffect": ()=>{
            document.documentElement.lang = locale;
            window.localStorage.setItem("hackera-language", locale);
        }
    }["LanguageProvider.useEffect"], [
        locale
    ]);
    const t = (key, values = {})=>Object.entries(values).reduce((text, [name, value])=>text.replace(`{${name}}`, String(value)), translations[locale][key]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LanguageContext.Provider, {
        value: {
            locale,
            setLocale,
            t
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/app/language-provider.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
_s(LanguageProvider, "N3Ovu1Ve5v64K/AyhCP2w9sX/CI=");
_c = LanguageProvider;
function useLanguage() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(LanguageContext);
    if (!context) throw new Error("useLanguage must be used within LanguageProvider");
    return context;
}
_s1(useLanguage, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
function Translate({ id }) {
    _s2();
    const { t } = useLanguage();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: t(id)
    }, void 0, false);
}
_s2(Translate, "ot2YhC7pP10gRrIouBKIa40vomw=", false, function() {
    return [
        useLanguage
    ];
});
_c1 = Translate;
function LanguageSelector() {
    _s3();
    const { locale, setLocale, t } = useLanguage();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: "language-selector",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "sr-only",
                children: t("selectLanguage")
            }, void 0, false, {
                fileName: "[project]/src/app/language-provider.tsx",
                lineNumber: 133,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                value: locale,
                onChange: (event)=>setLocale(event.target.value),
                "aria-label": t("selectLanguage"),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "en",
                        children: "English"
                    }, void 0, false, {
                        fileName: "[project]/src/app/language-provider.tsx",
                        lineNumber: 139,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "es",
                        children: "Español"
                    }, void 0, false, {
                        fileName: "[project]/src/app/language-provider.tsx",
                        lineNumber: 140,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/language-provider.tsx",
                lineNumber: 134,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/language-provider.tsx",
        lineNumber: 132,
        columnNumber: 5
    }, this);
}
_s3(LanguageSelector, "QuDHc5OP5OCt9T+RsBN8EaINh4Y=", false, function() {
    return [
        useLanguage
    ];
});
_c2 = LanguageSelector;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "LanguageProvider");
__turbopack_context__.k.register(_c1, "Translate");
__turbopack_context__.k.register(_c2, "LanguageSelector");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_language-provider_tsx_126gb4w._.js.map