# from app.repositories import ShopItemRepo
from datetime import datetime
from dataclasses import dataclass
from typing import AsyncGenerator, Iterable
from fastapi import APIRouter, Request
from app.repositories.shop_item import ShopItemRepo
from app.db import ShopItem

router = APIRouter(prefix="/items")

# async def get_shop_items_repo() -> AsyncGenerator[ShopItemRepo]:
#     return

@dataclass
class ShopItemDTO():
    id: int
    name: str
    quantity: int
    created_at: datetime

    @staticmethod
    def from_shop_item(si: ShopItem) -> ShopItemDTO:
        return ShopItemDTO(
            id=si.id,
            name=si.name,
            quantity=si.quantity,
            created_at=si.created_at,
        )

@router.get("/")
async def get_shop_items(req: Request) -> Iterable[ShopItemDTO]:
    async with req.app.state.make_session() as session:
        return map(
            ShopItemDTO.from_shop_item,
            await ShopItemRepo(session).get_all_shop_items()
        )
