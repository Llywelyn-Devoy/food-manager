from collections.abc import Iterator

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schema import ShopItem


class ShopItemRepo:
    def __init__(self, session: AsyncSession):
        self._db = session

    async def get_all_shop_items(self) -> Iterator[ShopItem]:
        result = await self._db.scalars(select(ShopItem))
        return iter(result.all())

    async def create_shop_item(self, name: str, quantity: int) -> ShopItem:
        new_shop_item = ShopItem(name=name, quantity=quantity)
        self._db.add(new_shop_item)
        await self._db.commit()
        return new_shop_item
