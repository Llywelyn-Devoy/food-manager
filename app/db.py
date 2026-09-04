from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class ShopItem(Base):
    __tablename__ = "shop_item"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    quantity: Mapped[int]
    created_at: Mapped[datetime] = mapped_column(default=func.now())


@asynccontextmanager
async def create_engine(url: str) -> AsyncGenerator[AsyncEngine]:
    # SEE: <https://stackoverflow.com/a/79990188>
    engine = create_async_engine(url=url, echo=True)
    try:
        yield engine
    finally:
        await engine.dispose()


async def init_database(engine: AsyncEngine):
    # SEE: <https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html>
    async with engine.begin() as conn:
        # NOTE: we choose not to destroy any tables we don't use
        await conn.run_sync(Base.metadata.create_all)
