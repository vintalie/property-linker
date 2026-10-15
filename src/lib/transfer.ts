import Papa from "papaparse";
import { PRODUCT_FIELDS, PROPERTY_FIELDS, type Row } from "./api/resources";
import { describeStreet, type AddressNames, type LocationLists } from "./locations";

/**
 * Exchange format: no foreign-key ids. Properties carry the full address by name;
 * products reference their property by `propriedade` (n_property, falling back to name).
 */
export const ADDRESS_COLS = ["pais", "estado", "cidade", "bairro", "rua"] as const;
const PROP_COLS = ["id", ...PROPERTY_FIELDS.map((f) => f.key), ...ADDRESS_COLS];
const PROD_COLS = ["id", ...PRODUCT_FIELDS.map((f) => f.key), "propriedade"];
export const CSV_COLS = Array.from(new Set(["registro", ...PROP_COLS, ...PROD_COLS]));

export interface TransferData {
  propriedades: Row[];
  produtos: Row[];
}

export function buildExport(props: Row[], products: Row[], lists: LocationLists): TransferData {
  const propRef = (id: unknown) => {
    const p = props.find((x) => String(x.id) === String(id));
    return p ? String(p.n_property || p.name) : "";
  };
  return {
    propriedades: props.map((p) => {
      const a = describeStreet(p.street_id, lists);
      const o: Row = { id: p.id };
      PROPERTY_FIELDS.forEach((f) => (o[f.key] = p[f.key] ?? ""));
      o.pais = a?.country ?? "";
      o.estado = a?.state ?? "";
      o.cidade = a?.city ?? "";
      o.bairro = a?.neighborhood ?? "";
      o.rua = a?.street ?? "";
      return o;
    }),
    produtos: products.map((p) => {
      const o: Row = { id: p.id };
      PRODUCT_FIELDS.forEach((f) => (o[f.key] = p[f.key] ?? ""));
      o.propriedade = propRef(p.property_id);
      return o;
    }),
  };
}

export function toCsv(d: TransferData) {
  const rows = [
    ...d.propriedades.map((r) => ({ registro: "propriedade", ...r })),
    ...d.produtos.map((r) => ({ registro: "produto", ...r })),
  ];
  return Papa.unparse(rows, { columns: CSV_COLS });
}

export function parseFile(text: string, filename: string): TransferData {
  if (filename.toLowerCase().endsWith(".json")) {
    const j = JSON.parse(text);
    return { propriedades: j.propriedades ?? [], produtos: j.produtos ?? [] };
  }
  const { data } = Papa.parse<Row>(text, { header: true, skipEmptyLines: true });
  const clean = (r: Row) => {
    const o: Row = {};
    for (const [k, v] of Object.entries(r)) if (k !== "registro" && v !== "") o[k] = v;
    return o;
  };
  return {
    propriedades: data.filter((r) => String(r.registro).toLowerCase().startsWith("propried")).map(clean),
    produtos: data.filter((r) => String(r.registro).toLowerCase().startsWith("produto")).map(clean),
  };
}

export type Op =
  | { kind: "property"; action: "create" | "update"; id?: Row["id"]; body: Row; address: AddressNames; ref: string }
  | { kind: "product"; action: "create" | "update"; id?: Row["id"]; body: Row; propertyRef: string };

export interface Plan {
  ops: Op[];
  errors: string[];
}

const pick = (r: Row, keys: string[]) => {
  const o: Row = {};
  keys.forEach((k) => {
    if (r[k] !== undefined && r[k] !== "") o[k] = r[k];
  });
  return o;
};

const toBool = (v: unknown) => ["1", "true", "sim", "yes"].includes(String(v).toLowerCase());

/** Decide create vs update for every row; properties always come before products. */
export function planImport(data: TransferData, existingProps: Row[], existingProducts: Row[]): Plan {
  const errors: string[] = [];
  const ops: Op[] = [];
  const knownRefs = new Set<string>();
  existingProps.forEach((p) => {
    if (p.n_property) knownRefs.add(String(p.n_property));
    if (p.name) knownRefs.add(String(p.name));
  });

  data.propriedades.forEach((r, i) => {
    const line = `Propriedade ${i + 1}`;
    const exists = r.id && existingProps.some((p) => String(p.id) === String(r.id));
    if (r.id && !exists) {
      errors.push(`${line}: id ${r.id} não existe; deixe o id vazio para criar.`);
      return;
    }
    if (!r.name || !r.n_property) {
      errors.push(`${line}: nome e número do imóvel são obrigatórios.`);
      return;
    }
    const missing = ADDRESS_COLS.filter((c) => !String(r[c] ?? "").trim());
    if (missing.length) {
      errors.push(`${line}: endereço incompleto (${missing.join(", ")}).`);
      return;
    }
    const ref = String(r.n_property);
    knownRefs.add(ref);
    knownRefs.add(String(r.name));
    ops.push({
      kind: "property",
      action: exists ? "update" : "create",
      id: exists ? r.id : undefined,
      body: pick(r, PROPERTY_FIELDS.map((f) => f.key)),
      address: { country: r.pais, state: r.estado, city: r.cidade, neighborhood: r.bairro, street: r.rua },
      ref,
    });
  });

  data.produtos.forEach((r, i) => {
    const line = `Produto ${i + 1}`;
    const exists = r.id && existingProducts.some((p) => String(p.id) === String(r.id));
    if (r.id && !exists) {
      errors.push(`${line}: id ${r.id} não existe; deixe o id vazio para criar.`);
      return;
    }
    if (!r.name) {
      errors.push(`${line}: nome é obrigatório.`);
      return;
    }
    const propertyRef = String(r.propriedade ?? "").trim();
    if (!propertyRef || !knownRefs.has(propertyRef)) {
      errors.push(`${line}: propriedade "${propertyRef}" não encontrada.`);
      return;
    }
    const body = pick(r, PRODUCT_FIELDS.map((f) => f.key));
    if ("disabled" in body) body.disabled = typeof body.disabled === "boolean" ? body.disabled : toBool(body.disabled);
    if ("price" in body) body.price = Number(body.price);
    ops.push({ kind: "product", action: exists ? "update" : "create", id: exists ? r.id : undefined, body, propertyRef });
  });

  return { ops, errors };
}

/** Find a property id by its reference (n_property first, then name). */
export function findPropertyId(ref: string, props: Row[]) {
  return (
    props.find((p) => String(p.n_property) === ref)?.id ?? props.find((p) => String(p.name) === ref)?.id
  );
}
