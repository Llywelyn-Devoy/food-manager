import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"

// If we don't create this we get an:
//  ```
//  Uncaught Error: No QueryClient set, use QueryClientProvider to set one
//  ````
// , error.
// See: <https://github.com/openapi-ts/openapi-typescript/issues/1947#issuecomment-2408593259>
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false
        }
    }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
