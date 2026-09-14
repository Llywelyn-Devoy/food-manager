// import { useState } from "react";
// import { useEffect, useState } from "react";
import { formatDateNicely, parseDate } from "./date_utils";
import { fetchAllItems, fetchItems, fetchList, fetchLists, useAddItemToList, usePostNewItem, useRemoveItemFromList } from "./api";
import type { ShopItemDTO, ShopListDTO } from "./api";
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
import { Accordion, AccordionDetails, AccordionSummary, Alert, Button, Stack, TextField } from "@mui/material";
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { useId, useState } from "react";


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
  pendingComponent: () => <Loading size={'big'} />,
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
  pendingComponent: () => <Loading size={'big'} />,
  component: ShoppingItems,
})

function CreatedAt({ strDate }: {strDate: string}) {
  return (
    <span style={{ color: "offwhite", backgroundColor: "coral", padding: "2px 10px", borderRadius: "10px" }}>
      created: {formatDateNicely(parseDate(strDate))}
    </span>
  )
}

function RemovableListItem({ item, disabled = false, deleteItemCallback }: { item: ShopItemDTO, disabled?: boolean, deleteItemCallback: (item: ShopItemDTO) => void }) {
  return (
    <li key={item.id} style={{
      border: 'var(--border)',
      borderRadius: 'var(--radius)',
      marginBottom: '5px',
      paddingLeft: '10px',
      maxWidth: '80ch',
      filter: disabled ?  'grayscale(80%)' : ''
    }}>
      <Stack direction={'row'} style={{
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {item.name}
        <Button disabled={disabled} onClick={() => deleteItemCallback(item)}>
          <DeleteIcon style={{color: 'red'}} />
        </Button>
      </Stack>
    </li>
  );
}

function ShoppingItems() {
  const data  = listRoute.useLoaderData();
  const { list, listItems } = data;

  const mutScope = useId();
  const newItemMutation = usePostNewItem(mutScope);
  const addItemMutation = useAddItemToList(mutScope);
  const removeItemMutation = useRemoveItemFromList();
  const isAdding = newItemMutation.isPending || addItemMutation.isPending;
  const isPendingOperation = isAdding || removeItemMutation.isPending;

  // NOTE: we set the initial value of `value` to empty string to make the
  // `Textfeild` a controlled component
  const [value, setValue] = useState<string>('');
  const [items, setItems] = useState(listItems);

  // TODO: work out how to get notified if a request failed so we can bubble up
  // to the user. Right now, tanstack query is handling it for us and silently
  // sending the request when connection is re-established.
  const onAddItem = () => {
    let itemName = value.trim();
    if (itemName.length <= 0)
      return;
    newItemMutation.mutate({
      body: { name: itemName, quantity: 1 }
    }, {
      onError: () => {
        throw new Error(`Unable to create new item with name: ${itemName}`);
      },
      onSuccess: (newItem, _, __, ___) => {
        addItemMutation.mutate({
          params: {
            path: {
              list_id: list.id,
            },
            query: {
              item_id: newItem.id,
            }
          }
        }, {
          onError: () => {
            throw new Error(`Unable to add item ${newItem.id} to list ${list.id}.`);
          },
          onSuccess: () => {
            setItems(() => [...items, newItem]);
            setValue('');
          }
        });
      }
    });
  };

  return (
    <Stack spacing={2}>
      <Stack direction={'row'} spacing={2} style={{alignItems: 'center'}}>
        <Link to={'/'} style={{
          width: '50px',
          height: '50px',
          borderRadius: 'var(--radius)',
          border: 'var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ArrowBackIcon />
        </Link>
        <h1 style={{ textDecoration: (list.active ? '' : 'line-through') }}>{list.name}</h1>
      </Stack>
      <Stack direction={'row'}>
        <TextField
          disabled={!list.active}
          variant="outlined"
          label="Add a new or existing item"

          // See: <https://stackoverflow.com/a/67578169>
          // I don't love this solution, but it's temporary, take from that what
          // you will :).
          onKeyDown={(event) => {
            if (event.key == 'Enter') {
              onAddItem();
            }
            event.defaultPrevented
          }}

          // Because this is a controlled component we are required to specify
          // the on change function
          onChange={(event) => setValue(event.target.value)}
          value={value}
        />
        <Button disabled={!list.active || isPendingOperation} style={{marginLeft: "10px", paddingTop: "0px", paddingBottom: "0px"}} onClick={onAddItem} variant="outlined">
          {isAdding ? <Loading/> : <p>Add item</p>}
        </Button>
      </Stack>
      <ol>{
        items.map(i =>
          <RemovableListItem item={i} disabled={!list.active || isPendingOperation} deleteItemCallback={(item) => {
            removeItemMutation.mutate({
              params: {
                path: {
                  list_id: list.id
                },
                query: {
                  item_id: item.id,
                }
              }
            }, {
              // TODO: better error handling
              onError: () => { console.log("Failed to remove item") },
              onSuccess: () => {
                setItems(items.filter(i => i.id !== item.id))
              }
            });
          } } />
        )
      }</ol>
    </Stack>
  )
}

function ShoppingList({ list }: { list: ShopListDTO }) {
  return (
    <Link className="list-item" to="/list/$listId" params={{ listId: `${list.id}` }}>
      <h2 style={{ textDecoration: (list.active ? '' : 'line-through') }}>{list.name}</h2>
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
      <Accordion>
        <AccordionSummary>Old lists:</AccordionSummary>
        <AccordionDetails>
          <ul className="list">
            { renderList(inactive) }
          </ul>
        </AccordionDetails>
      </Accordion>
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
