# from app.repositories import ShopItemRepo
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from datetime import datetime
from dataclasses import dataclass
from typing import AsyncGenerator, Iterable, Annotated
from fastapi import APIRouter, Request, Depends
from app.repositories.shop_item import ShopItemRepo
from app.db import ShopItem
from app.api.deps import AsyncSessionDep

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
    def from_shop_item(si: ShopItem) -> ShopItemDTO:
        return ShopItemDTO(
            id=si.id,
            name=si.name,
            quantity=si.quantity,
            created_at=si.created_at,
        )

@router.get("/")
async def get_shop_items(repo: ShopItemRepoDep) -> Iterable[ShopItemDTO]:
    return map(
        ShopItemDTO.from_shop_item,
        await repo.get_all_shop_items()
    )
