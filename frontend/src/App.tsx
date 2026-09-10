// import { useState } from "react";
// import { useEffect, useState } from "react";
import { formatDateNicely, parseDate } from "./date_utils";
import { fetchItems, fetchList, fetchLists } from "./api";
import type { ShopListDTO } from "./api";
import Loading from './Loading';
import ErrorBanner from './ErrorBanner';
// import { Suspense } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider
} from '@tanstack/react-router';


const rootRoute = createRootRoute({
  component: () => {
    return (
      <>
        <Outlet/>
      </>
    )
  },
  notFoundComponent: () => <ErrorBanner title="Not found"/>
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  loader: () => fetchLists(),
  errorComponent: () => <ErrorBanner title={"Failed to load shop lists."} />,
  pendingComponent: Loading,
  component: () => {
    return (
      <>
      <h1>Food Manager 🛒</h1>
      <ShoppingLists/>
    </>
    )
  }
});

const listRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'list/$listId',
  // errorComponent: () => <ErrorBanner title={"Failed to load shopping list."} />,
  notFoundComponent: () => <ErrorBanner title={"List not found."} />,
  loader: async ({ params: { listId } }) => {
    let listIdNum: number = parseInt(listId);
    return {
      list: await fetchList(listIdNum),
      items: await fetchItems(listIdNum)
    }
  },
  pendingComponent: Loading,
  component: ShoppingItems,
})

function CreatedAt({ strDate }: {strDate: string}) {
  return (
    <span style={{ color: "offwhite", backgroundColor: "coral", padding: "2px 10px", borderRadius: "10px" }}>
      created: {formatDateNicely(parseDate(strDate))}
    </span>
  )
}

function ShoppingItems() {
  const data  = listRoute.useLoaderData();
  const { list, items } = data;

  return (
    <>
      <h1>{list.name}</h1>
      <ol>{
        items.map(i =>
          <li key={i.id}>{i.name}</li>
        )
      }</ol>
    </>
  )
}

function ShoppingList({ list }: { list: ShopListDTO }) {
  return (
    <Link className="list-item" to="/list/$listId" params={{ listId: `${list.id}` }}>
          <h2>{list.name}</h2>
          <ul className="inline-list">
            <li><CreatedAt strDate={list.created_at} /></li>
          </ul>
    </Link>
  )
}

function ShoppingLists() {
  const lists: ShopListDTO[] = indexRoute.useLoaderData();
  return (
    <ul className="list">
      {lists.map(ls => {
        return <li key={ls.id}><ShoppingList list={ls} /></li>
      })}
    </ul>
  )
}

const routeTree = rootRoute.addChildren([indexRoute, listRoute])

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  defaultStaleTime: 5000,
  scrollRestoration: true,
});

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
