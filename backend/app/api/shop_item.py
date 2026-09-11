# from app.repositories import ShopItemRepo
from collections.abc import Iterable
from dataclasses import dataclass
from datetime import datetime
from typing import Annotated

from app.api.deps import AsyncSessionDep
from app.repositories.shop_item import ShopItemRepo
from app.schema import ShopItem
from fastapi import APIRouter, Body, Depends, Query

router = APIRouter(prefix="/items")


async def get_shop_item_repo(session: AsyncSessionDep) -> ShopItemRepo:
    return ShopItemRepo(session)


ShopItemRepoDep = Annotated[ShopItemRepo, Depends(get_shop_item_repo)]


@dataclass
class ShopItemDTO:
    id: int
    name: str
    quantity: int
    created_at: datetime

    @staticmethod
    def from_shop_item(si: ShopItem) -> "ShopItemDTO":
        #                               ^^^^^^^^^^^^^
        #                               Forward reference See: <https://stackoverflow.com/a/40371102>
        return ShopItemDTO(
            id=si.id,
            name=si.name,
            quantity=si.quantity,
            created_at=si.created_at,
        )


@router.get("/")
async def get_shop_items(repo: ShopItemRepoDep) -> Iterable[ShopItemDTO]:
    return map(ShopItemDTO.from_shop_item, await repo.get_all_shop_items())


@dataclass
class CreateShopItemDTO:
    name: Annotated[str, Query(min_length=1, max_length=30)]
    quantity: Annotated[int, Query(ge=1)]


@router.post("/create")
async def create_shop_items(
    repo: ShopItemRepoDep, item: CreateShopItemDTO
) -> ShopItemDTO:
    return ShopItemDTO.from_shop_item(
        await repo.create_shop_item(item.name, item.quantity)
    )
