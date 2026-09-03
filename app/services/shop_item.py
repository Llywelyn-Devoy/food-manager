from sqlalchemy.ext.asyncio import AsyncSession


class ShopItemService:
    def __init__(self, session: AsyncSession):
       self._db = session
