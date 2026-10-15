import { api, listAll, unwrapOne } from "./client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = any;

export type FieldType = "text" | "number" | "email" | "boolean" | "html" | "image" | "ref";
export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  ref?: ResourceKey;
}

export type ResourceKey =
  | "users"
  | "properties"
  | "products"
  | "countries"
  | "states"
  | "cities"
  | "neighborhoods"
  | "streets";

export interface ResourceDef {
  key: ResourceKey;
  label: string;
  path: string;
  fields: FieldDef[];
  canUpdate?: boolean;
}

export const PROPERTY_FIELDS: FieldDef[] = [
  { key: "name", label: "Nome da loja", type: "text", required: true, help: "Nome que aparece no mapa e nas listas." },
  { key: "n_property", label: "Número do imóvel", type: "text", required: true, help: "Número do endereço na rua. Também serve para identificar a loja na importação." },
  { key: "complement", label: "Complemento", type: "text", help: "Sala, bloco, andar ou ponto de referência." },
  { key: "main_image", label: "Imagem principal", type: "image", help: "Endereço (URL) da foto principal da loja." },
  { key: "cover_image", label: "Imagem de capa", type: "image", help: "Endereço (URL) da imagem larga usada no topo." },
  { key: "content_html", label: "Descrição", type: "html", help: "Texto de apresentação da loja. Aceita HTML simples." },
  { key: "additional_info", label: "Informações adicionais", type: "text", help: "Horários, formas de pagamento ou outras observações." },
  { key: "contact1_email", label: "E-mail principal", type: "email", help: "E-mail de contato da loja." },
  { key: "contact2_email", label: "E-mail secundário", type: "email", required: true, help: "Um segundo e-mail de contato (obrigatório pela API)." },
  { key: "number1", label: "Telefone 1", type: "text", required: true, help: "Telefone principal, com DDD." },
  { key: "number2", label: "Telefone 2", type: "text", help: "Telefone alternativo." },
  { key: "number3", label: "Telefone 3", type: "text", help: "Outro telefone, se houver." },
];

export const PRODUCT_FIELDS: FieldDef[] = [
  { key: "name", label: "Nome do produto", type: "text", required: true, help: "Como o produto aparece para o público." },
  { key: "tipo", label: "Tipo", type: "text", help: "Categoria do produto, por exemplo: alimento, serviço, roupa." },
  { key: "price", label: "Preço", type: "number", help: "Valor em reais. Use ponto para centavos, por exemplo 19.90." },
  { key: "img_main", label: "Imagem principal", type: "image", help: "Endereço (URL) da foto do produto." },
  { key: "img_cover", label: "Imagem de capa", type: "image", help: "Endereço (URL) de uma imagem larga do produto." },
  { key: "html", label: "Descrição", type: "html", help: "Detalhes do produto. Aceita HTML simples." },
  { key: "disabled", label: "Ocultar produto", type: "boolean", help: "Marque para esconder o produto do mapa sem excluí-lo." },
];

export const RESOURCES: Record<ResourceKey, ResourceDef> = {
  users: {
    key: "users",
    label: "Usuários",
    path: "api/auth/user",
    canUpdate: false,
    fields: [
      { key: "name", label: "Nome", type: "text", required: true },
      { key: "email", label: "E-mail", type: "email", required: true },
      { key: "password", label: "Senha", type: "text" },
      { key: "tipo_nome", label: "Tipo", type: "text" },
    ],
  },
  properties: {
    key: "properties",
    label: "Propriedades",
    path: "api/auth/properties",
    fields: [
      ...PROPERTY_FIELDS,
      { key: "street_id", label: "Rua", type: "ref", ref: "streets", required: true },
      { key: "user_id", label: "Usuário", type: "ref", ref: "users" },
    ],
  },
  products: {
    key: "products",
    label: "Produtos",
    path: "api/auth/products",
    fields: [
      ...PRODUCT_FIELDS,
      { key: "property_id", label: "Propriedade", type: "ref", ref: "properties", required: true },
      { key: "user_id", label: "Usuário", type: "ref", ref: "users" },
    ],
  },
  countries: {
    key: "countries",
    label: "Países",
    path: "api/auth/location/countries",
    fields: [{ key: "name", label: "Nome", type: "text", required: true }],
  },
  states: {
    key: "states",
    label: "Estados",
    path: "api/auth/location/states",
    fields: [
      { key: "name", label: "Nome", type: "text", required: true },
      { key: "abbreviation", label: "Sigla", type: "text" },
      { key: "country_id", label: "País", type: "ref", ref: "countries", required: true },
    ],
  },
  cities: {
    key: "cities",
    label: "Cidades",
    path: "api/auth/location/cities",
    fields: [
      { key: "name", label: "Nome", type: "text", required: true },
      { key: "state_id", label: "Estado", type: "ref", ref: "states", required: true },
    ],
  },
  neighborhoods: {
    key: "neighborhoods",
    label: "Bairros",
    path: "api/auth/location/neighborhoods",
    fields: [
      { key: "name", label: "Nome", type: "text", required: true },
      { key: "city_id", label: "Cidade", type: "ref", ref: "cities", required: true },
    ],
  },
  streets: {
    key: "streets",
    label: "Ruas",
    path: "api/auth/location/streets",
    fields: [
      { key: "name", label: "Nome", type: "text", required: true },
      { key: "neighborhood_id", label: "Bairro", type: "ref", ref: "neighborhoods", required: true },
    ],
  },
};

export const listResource = (k: ResourceKey) => listAll(RESOURCES[k].path);
export const createResource = async (k: ResourceKey, body: Row) =>
  unwrapOne(await api("POST", RESOURCES[k].path, body));
export const updateResource = async (k: ResourceKey, id: Row["id"], body: Row) =>
  unwrapOne(await api("PUT", `${RESOURCES[k].path}/${id}`, body));
export const deleteResource = (k: ResourceKey, id: Row["id"]) =>
  api("DELETE", `${RESOURCES[k].path}/${id}`);

/** Adds quantity to stock (the API sums instead of overwriting). */
export const addStock = (productId: Row["id"], quantity: number) =>
  api("PUT", `api/auth/products/${productId}/stocks/${productId}`, { quantity });

/** Strip read-only columns before sending to the API. */
export function cleanBody(row: Row): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(row)) {
    if (["id", "created_at", "updated_at", "email_verified_at"].includes(k)) continue;
    if (v !== null && typeof v === "object") continue;
    out[k] = v;
  }
  return out;
}
