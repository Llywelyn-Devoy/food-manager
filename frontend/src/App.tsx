// import { useState } from "react";
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
// import { useEffect, useState } from "react";
import { formatDateNicely, parseDate } from "./date_utils";
import type { components } from "./openapi_types";
import { $api } from "./api";
import Loading from './Loading';
import { Suspense } from 'react';


type ShopListDTO = components["schemas"]["ShopListDTO"];
type ShopItemDTO = components["schemas"]["ShopItemDTO"];

function CreatedAt({ date }) {
  return (
    <span style={{ color: "offwhite", backgroundColor: "coral", padding: "2px 10px", borderRadius: "10px" }}>
      created: {formatDateNicely(parseDate(date))}
    </span>
  )
}

function ShoppingItems(props) {
  let list: ShopListDTO = props.list;
  const items: ShopItemDTO[] = $api.useSuspenseQuery(
    "get",
    "/lists/{list_id}/items",
    {
      params: {
        path: { list_id: list.id }
      }
    }
  ).data;

  return (
    <ol>{
      items.map(i =>
        <li key={i.id}>{i.name}</li>
      )
    }</ol>
  )
}

function ShoppingListAccordion(props) {
  let list: ShopListDTO = props.list;

  return (
    <div className="list-item">
      {/*TODO: move style into css file*/}
      <Accordion>
        <AccordionSummary>
          <span>
            <h3>{list.name}</h3>
            <ul className="inline-list">
              <li><CreatedAt date={list.created_at} /></li>
            </ul>
          </span>
        </AccordionSummary>
        <AccordionDetails>
          <Suspense fallback={ <Loading/> }>
            <ShoppingItems list={list}/>
          </Suspense>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

function ShoppingLists() {
  const { data } = $api.useSuspenseQuery(
    "get",
    "/lists/"
  )

  return (
    <ul className="list">
      {data.map(ls => {
        return <li key={ls.id}><ShoppingListAccordion list={ls} /></li>
      })}
    </ul>
  )
}

function App() {
  return (
    <Suspense fallback={ <Loading/> }>
      <ShoppingLists/>
    </Suspense>
  )
}

export default App
