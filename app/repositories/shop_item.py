from collections.abc import Iterator

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import ShopItem


class ShopItemRepo:
    def __init__(self, session: AsyncSession):
        self._db = session

    async def get_all_shop_items(self) -> Iterator[ShopItem]:
        result = await self._db.scalars(select(ShopItem))
        return iter(result.all())
