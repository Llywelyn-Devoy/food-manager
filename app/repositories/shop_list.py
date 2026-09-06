from collections.abc import Iterator

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schema import ShopItem, ShopItemInstance, ShopList


class ShopListRepo:
    def __init__(self, session: AsyncSession):
        self._db = session

    async def get_all_shop_lists(self) -> Iterator[ShopList]:
        result = await self._db.scalars(select(ShopList))
        return iter(result.all())

    async def create_shop_list(self, name: str) -> ShopList:
        new_shop_list = ShopList(name=name)
        self._db.add(new_shop_list)
        await self._db.commit()
        return new_shop_list

    async def add_item(self, list_id: int, item_id: int) -> bool:
        list: ShopList | None = await self._db.scalar(
            select(ShopList).where(ShopList.id == list_id)
        )

        item: ShopItem | None = await self._db.scalar(
            select(ShopItem).where(ShopItem.id == item_id)
        )

        if not list or not item:
            return False

        # async doesn't play nice with lazy loading of attributes
        (await list.awaitable_attrs.items).append(item)

        await self._db.commit()

        return True
