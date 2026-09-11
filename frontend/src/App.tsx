// import { useState } from "react";
// import { useEffect, useState } from "react";
import { formatDateNicely, parseDate } from "./date_utils";
import { fetchAllItems, fetchItems, fetchList, fetchLists } from "./api";
import type { ShopListDTO } from "./api";
import Loading from './Loading';
// import { Suspense } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider
} from '@tanstack/react-router';
import { Alert } from "@mui/material";
import AddItemInput from "./AddItemInput";


const rootRoute = createRootRoute({
  component: () => {
    return (
      <>
        <Outlet/>
      </>
    )
  },
  notFoundComponent: () => <Alert severity="info">Not Found</Alert>
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  loader: () => fetchLists(),
  errorComponent: () => <Alert severity="error">Failed to load shop lists.</Alert>,
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
  errorComponent: () => <Alert severity="error">Failed to load shopping list.</Alert>,
  notFoundComponent: () => <Alert severity="info">List not found.</Alert>,
  loader: async ({ params: { listId } }) => {
    let listIdNum: number = parseInt(listId);
    return {
      list: await fetchList(listIdNum),
      listItems: await fetchItems(listIdNum),
      allItems: await fetchAllItems(),
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
  const { list, listItems, allItems } = data;

  return (
    <>
      <h1>{list.name}</h1>
      <AddItemInput allItems={allItems}/>
      <ol>{
        listItems.map(i =>
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

  const active = lists.filter(l => l.active);
  const inactive = lists.filter(l => !l.active);
  const renderList = (lists: ShopListDTO[]) => {
    return lists.map(ls => {
      return <li key={ls.id}><ShoppingList list={ls} /></li>
    })
  };

  return (
    <>
      <ul className="list">
        { renderList(active) }
      </ul>
      <details>
        <summary>Old lists:</summary>
        <ul className="list">
          { renderList(inactive) }
        </ul>
      </details>
    </>
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
