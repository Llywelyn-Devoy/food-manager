# from app.repositories import ShopItemRepo
from collections.abc import Iterable
from dataclasses import dataclass
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.deps import AsyncSessionDep
from app.repositories.shop_list import ShopListRepo
from app.schema import ShopList

router = APIRouter(prefix="/lists")


async def get_shop_item_repo(session: AsyncSessionDep) -> ShopListRepo:
    return ShopListRepo(session)


ShopListRepoDep = Annotated[ShopListRepo, Depends(get_shop_item_repo)]


@dataclass
class ShopListDTO:
    id: int
    name: str
    active: bool
    created_at: datetime

    @staticmethod
    def from_shop_list(sl: ShopList) -> "ShopListDTO":
        return ShopListDTO(
            id=sl.id,
            name=sl.name,
            active=sl.active,
            created_at=sl.created_at,
        )


@router.get("/")
async def get_shop_lists(repo: ShopListRepoDep) -> Iterable[ShopListDTO]:
    return map(ShopListDTO.from_shop_list, await repo.get_all_shop_lists())


@router.post("/create")
async def create_shop_list(
    repo: ShopListRepoDep,
    # TODO: create pydantic model for these fields
    name: Annotated[str, Query(min_length=1, max_length=30)],
) -> ShopListDTO:
    return ShopListDTO.from_shop_list(await repo.create_shop_list(name))


@router.post("/{list_id}/add-item")
async def add_item(
    repo: ShopListRepoDep,
    list_id: int,
    item_id: int,
):
    return await repo.add_item(list_id, item_id)
