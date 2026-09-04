from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


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
        # NOTE: we choose not to drop any tables we don't use and only create
        # tables if absent
        await conn.run_sync(Base.metadata.create_all)
