import createClient from "openapi-fetch";
import type { paths, components } from "./openapi_types";

export const fetchClient = createClient<paths>({ baseUrl: "http://localhost/" });
export const $api = fetchClient;

export type ShopListDTO = components["schemas"]["ShopListDTO"];
export type ShopItemDTO = components["schemas"]["ShopItemDTO"];
