from collections.abc import Iterable

import sqlalchemy.exc as sqlalchemy_exceptions
from app.repositories.exceptions import ObjectNotFound
from app.schema import ShopItem, ShopList
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession


class ShopListRepo:
    def __init__(self, session: AsyncSession):
        self._db = session

    async def get_all_shop_lists(self) -> Iterable[ShopList]:
        result = await self._db.scalars(select(ShopList))
        return iter(result.all())

    async def create_shop_list(self, name: str) -> ShopList:
        new_shop_list = ShopList(name=name)
        self._db.add(new_shop_list)
        await self._db.commit()
        return new_shop_list

    async def add_item(self, list_id: int, item_id: int):
        """
        Adds `the item_id` to the `list_id`, if either `list_id` or `item_id` is
        not found an `ObjectNotFound` error is raised.
        If `item_id` is already part of the `list_id`, nothing happens.
        """
        # NOTE: we use `get_one` instead of `get` since, `get_one` throws on not
        # found rather than returning `None`
        try:
            list: ShopList | None = await self._db.get_one(ShopList, list_id)
            item: ShopItem | None = await self._db.get_one(ShopItem, item_id)

            items = await list.awaitable_attrs.items
            if item in items:
                return

            # async doesn't play nice with lazy loading of attributes
            items.append(item)
            await self._db.commit()
        except sqlalchemy_exceptions.NoResultFound as e:
            raise ObjectNotFound from e

    async def get_items(self, list_id: int) -> Iterable[ShopItem]:
        """
        Fetches the list with `list_id` items, raises `ObjectNotFound` if list
        is not found.
        """
        try:
            list = await self._db.get_one(ShopList, list_id)
            return iter(await list.awaitable_attrs.items)
        except sqlalchemy_exceptions.NoResultFound as e:
            raise ObjectNotFound from e

    async def deactivate(self, list_id: int):
        try:
            list = await self._db.get_one(ShopList, list_id)
            if not list.active:
                return
            list.active = False
            await self._db.commit()
        except sqlalchemy_exceptions.NoResultFound as e:
            raise ObjectNotFound from e
