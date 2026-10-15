import type { Row } from "./api/resources";

export interface LocationLists {
  countries: Row[];
  states: Row[];
  cities: Row[];
  neighborhoods: Row[];
  streets: Row[];
}

export interface AddressNames {
  country: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
}

export interface LocationApi {
  create(kind: keyof LocationLists, body: Row): Promise<Row>;
}

const norm = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const findBy = (rows: Row[], name: string, parentKey?: string, parentId?: unknown) =>
  rows.find(
    (r) =>
      norm(r.name) === norm(name) &&
      (!parentKey || String(r[parentKey]) === String(parentId)),
  );

/**
 * Finds each address level by name under its parent and creates missing ones.
 * Mutates `lists` so later calls reuse newly created records. Returns street id.
 */
export async function resolveAddress(
  names: AddressNames,
  lists: LocationLists,
  apiImpl: LocationApi,
): Promise<Row["id"]> {
  for (const [k, v] of Object.entries(names)) {
    if (!String(v ?? "").trim()) throw new Error(`Campo de endereço vazio: ${k}`);
  }
  const ensure = async (
    kind: keyof LocationLists,
    name: string,
    parentKey?: string,
    parentId?: unknown,
    extra: Row = {},
  ) => {
    const found = findBy(lists[kind], name, parentKey, parentId);
    if (found) return found;
    const body: Row = { name: name.trim(), ...extra };
    if (parentKey) body[parentKey] = parentId;
    const created = await apiImpl.create(kind, body);
    const row = { ...body, ...created };
    lists[kind].push(row);
    return row;
  };
  const country = await ensure("countries", names.country);
  const abbr = names.state.trim().length <= 3 ? names.state.trim().toUpperCase() : names.state.trim().slice(0, 2).toUpperCase();
  const state =
    findBy(lists.states, names.state, "country_id", country.id) ??
    lists.states.find(
      (s) => String(s.country_id) === String(country.id) && norm(s.abbreviation) === norm(names.state),
    ) ??
    (await ensure("states", names.state, "country_id", country.id, { abbreviation: abbr }));
  const city = await ensure("cities", names.city, "state_id", state.id);
  const nb = await ensure("neighborhoods", names.neighborhood, "city_id", city.id);
  const street = await ensure("streets", names.street, "neighborhood_id", nb.id);
  return street.id;
}

/** Reverse: street id -> full address names. */
export function describeStreet(streetId: unknown, lists: LocationLists): AddressNames | null {
  const st = lists.streets.find((s) => String(s.id) === String(streetId));
  if (!st) return null;
  const nb = lists.neighborhoods.find((n) => String(n.id) === String(st.neighborhood_id));
  const city = lists.cities.find((c) => String(c.id) === String(nb?.city_id));
  const state = lists.states.find((s) => String(s.id) === String(city?.state_id));
  const country = lists.countries.find((c) => String(c.id) === String(state?.country_id));
  return {
    street: st.name ?? "",
    neighborhood: nb?.name ?? "",
    city: city?.name ?? "",
    state: state?.name ?? "",
    country: country?.name ?? "",
  };
}

export function formatAddress(a: AddressNames | null, number?: string) {
  if (!a) return "Endereço não encontrado";
  return [a.street && `${a.street}${number ? `, ${number}` : ""}`, a.neighborhood, a.city, a.state]
    .filter(Boolean)
    .join(" - ");
}
