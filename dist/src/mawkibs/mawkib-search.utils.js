"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchMawkibCitiesFromQuery = matchMawkibCitiesFromQuery;
exports.matchMawkibCountriesFromQuery = matchMawkibCountriesFromQuery;
const CITY_TERMS = {
    Mashhad: ['mashhad', 'مشهد'],
    Qom: ['qom', 'قم'],
    Najaf: ['najaf', 'نجف'],
    Karbala: ['karbala', 'کربلا'],
};
const COUNTRY_TERMS = {
    Iran: ['iran', 'ایران'],
    Iraq: ['iraq', 'عراق'],
};
function matchesTerm(query, term) {
    const q = query.trim().toLowerCase();
    const t = term.trim().toLowerCase();
    if (!q || !t)
        return false;
    return t.includes(q) || q.includes(t);
}
function matchMawkibCitiesFromQuery(query) {
    return Object.entries(CITY_TERMS)
        .filter(([, terms]) => terms.some((term) => matchesTerm(query, term)))
        .map(([city]) => city);
}
function matchMawkibCountriesFromQuery(query) {
    return Object.entries(COUNTRY_TERMS)
        .filter(([, terms]) => terms.some((term) => matchesTerm(query, term)))
        .map(([country]) => country);
}
//# sourceMappingURL=mawkib-search.utils.js.map