import { HttpStatusCodes400 } from "./status_codes";
import createClient, { type Middleware } from "openapi-fetch";
import createFetchClient from "openapi-fetch";
import createQueryClient from "openapi-react-query";

import type { paths, components } from "./openapi_types";
import { notFound } from "@tanstack/react-router";

const baseUrl = "http://localhost/";
export const $apif = createClient<paths>({ baseUrl: baseUrl });

// as per example: <https://openapi-ts.dev/openapi-react-query/#basic-usage>
const fetchClient = createFetchClient<paths>({ baseUrl: baseUrl })
export const $apiq = createQueryClient(fetchClient);

export type ShopListDTO = components["schemas"]["ShopListDTO"];
export type ShopItemDTO = components["schemas"]["ShopItemDTO"];
export type CreateShopItemDTO = components["schemas"]["CreateShopItemDTO"];

const middleware: Middleware = {
  // async onRequest({ request, options }) {
  // },
  async onResponse({ response }) {
    const { status } = response;
    if (status === HttpStatusCodes400.NOT_FOUND)
      // ensure tanstack hears about the not found resource
      throw notFound();
    if (status === HttpStatusCodes400.UNPROCESSABLE_ENTITY)
      throw notFound();
    return response
  },

  // NOTE: onError only called when status code IS NOT 2xx, 4xx or 5xx. 4xx and 5xx
  // are considered "successful reponses with bad status codes", see
  // <https://openapi-ts.dev/openapi-fetch/middleware-auth#error-handling>
  // async onError({ error }) {
  //   // wrap errors thrown by fetch
  //   // TODO: better handling here
  //   // return new Error("Oops, fetch failed", { cause: error });
  // },
};

$apif.use(middleware);
fetchClient.use(middleware);


// const dataUndefinedError = () => { throw new Error("openapi-fetch: data was undefined"); }

// TODO: name it better?
async function wrapper<T, E>(response: Promise<Partial<{ data: T | undefined, error: E }>>): Promise<T> {
  const { data, error } = await response;
  if (error) {
    throw error;
  }

  if (data === undefined) {
    throw new Error("openapi-fetch: data was undefined");
  } else {
    return data;
  }
}

export async function fetchLists(): Promise<ShopListDTO[]> {
  return await wrapper($apif.GET("/lists/"));
}

export async function fetchList(listId: number): Promise<ShopListDTO> {
   return await wrapper($apif.GET("/lists/{list_id}/", {
    params: {
      path: { list_id: listId }
    }
  }));
}

export async function fetchAllItems(): Promise<ShopItemDTO[]> {
  return await wrapper($apif.GET("/items/"));
}

export async function fetchItems(listId: number): Promise<ShopItemDTO[]> {
  return await wrapper($apif.GET("/lists/{list_id}/items", {
    params: {
      path: { list_id: listId }
    }
  }));
}

export function usePostNewItem(scope: string) {
  return $apiq.useMutation("post", "/items/create", {
      scope: {
        id: scope,
      }
    });
}

export function useAddItemToList(scope: string) {
  return $apiq.useMutation("put", "/lists/{list_id}/add-item", {
    scope: {
      id: scope,
    }
  });
}

export function useRemoveItemFromList() {
  return $apiq.useMutation("put", "/lists/{list_id}/remove-item");
}
