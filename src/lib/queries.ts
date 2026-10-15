import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMe } from "./api/auth";
import { getToken } from "./api/client";
import { listResource, type ResourceKey, type Row } from "./api/resources";
import type { LocationLists } from "./locations";

export const useMe = () =>
  useQuery({ queryKey: ["me"], queryFn: fetchMe, enabled: !!getToken(), retry: false, staleTime: 60_000 });

export const useResource = (k: ResourceKey, enabled = true) =>
  useQuery({ queryKey: ["res", k], queryFn: () => listResource(k), enabled, staleTime: 30_000 });

export function useLocations() {
  const q = {
    countries: useResource("countries"),
    states: useResource("states"),
    cities: useResource("cities"),
    neighborhoods: useResource("neighborhoods"),
    streets: useResource("streets"),
  };
  const isLoading = Object.values(q).some((x) => x.isLoading);
  const lists: LocationLists = {
    countries: q.countries.data ?? [],
    states: q.states.data ?? [],
    cities: q.cities.data ?? [],
    neighborhoods: q.neighborhoods.data ?? [],
    streets: q.streets.data ?? [],
  };
  return { lists, isLoading };
}

/** Clone lists so the resolver can append created rows without touching query cache. */
export const cloneLists = (l: LocationLists): LocationLists => ({
  countries: [...l.countries],
  states: [...l.states],
  cities: [...l.cities],
  neighborhoods: [...l.neighborhoods],
  streets: [...l.streets],
});

export function useInvalidate() {
  const qc = useQueryClient();
  return (...keys: ResourceKey[]) =>
    Promise.all(keys.map((k) => qc.invalidateQueries({ queryKey: ["res", k] })));
}

export const ownRows = (rows: Row[] | undefined, userId: unknown, admin: boolean) =>
  (rows ?? []).filter((r) => admin || r.user_id === undefined || String(r.user_id) === String(userId));
