import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "./openapi_types";

// as per example: <https://openapi-ts.dev/openapi-react-query/#basic-usage>
const fetchClient = createFetchClient<paths>({ baseUrl: "http://localhost/" });
export const $api = createClient(fetchClient);
