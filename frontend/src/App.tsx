// import { useState } from "react";
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
// import { useEffect, useState } from "react";
import { formatDateNicely, parseDate } from "./date_utils";
import type { components } from "./openapi_types";
import { $api } from "./api";
import Loading from './Loading';
import { useEffect, useState } from 'react';


type ShopListDTO = components["schemas"]["ShopListDTO"];
// type ShopItemDTO = components["schemas"]["ShopItemDTO"];

function ShopList(props) {
  console.log("hit");

  let list: ShopListDTO = props.list;
  const { data, error, isLoading } = $api.useQuery(
    "get",
    "/lists/{list_id}/items",
    {
      params: {
        path: { list_id: list.id }
      }
    }
  )

  if (error) {
    console.error(error)
    return null;
  }

  const isLoaded = !isLoading && !!data;

  return (
    <div className="list-item">
      {/*TODO: move style into css file*/}
      <Accordion>
        <AccordionSummary>
          <div style={{display: 'inline'}}>
            <h3>{list.name}</h3>
            <span>created: {formatDateNicely(parseDate(list.created_at))}</span>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <Loading isLoaded={isLoaded}>
            <ol> {isLoaded && data.map(i => <li>{i.name}</li>)} </ol>
          </Loading>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

function App() {
  const { data, error, isLoading } = $api.useQuery(
    "get",
    "/lists/"
  )

  if (error) {
    console.error(error); return;
  }

  const isLoaded = !isLoading && !!data;

  return (
      <Loading isLoaded={isLoaded} showForAtleast={1000}>
        <ul className="list">
           {isLoaded && data.map(ls => { return <li><ShopList list={ls}/></li> })}
        </ul>
      </Loading>
  )
}

export default App
