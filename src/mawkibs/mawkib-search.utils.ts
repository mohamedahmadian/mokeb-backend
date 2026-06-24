import { MawkibCity, MawkibCountry } from '@prisma/client';

const CITY_TERMS: Record<MawkibCity, string[]> = {
  Mashhad: ['mashhad', 'مشهد'],
  Qom: ['qom', 'قم'],
  Najaf: ['najaf', 'نجف'],
  Karbala: ['karbala', 'کربلا'],
};

const COUNTRY_TERMS: Record<MawkibCountry, string[]> = {
  Iran: ['iran', 'ایران'],
  Iraq: ['iraq', 'عراق'],
};

function matchesTerm(query: string, term: string) {
  const q = query.trim().toLowerCase();
  const t = term.trim().toLowerCase();
  if (!q || !t) return false;
  return t.includes(q) || q.includes(t);
}

export function matchMawkibCitiesFromQuery(query: string): MawkibCity[] {
  return (Object.entries(CITY_TERMS) as [MawkibCity, string[]][])
    .filter(([, terms]) => terms.some((term) => matchesTerm(query, term)))
    .map(([city]) => city);
}

export function matchMawkibCountriesFromQuery(query: string): MawkibCountry[] {
  return (Object.entries(COUNTRY_TERMS) as [MawkibCountry, string[]][])
    .filter(([, terms]) => terms.some((term) => matchesTerm(query, term)))
    .map(([country]) => country);
}
