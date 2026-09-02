from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData
from sqlalchemy import select
import app.settings as settings
from contextlib import contextmanager, asynccontextmanager
from typing import AsyncGenerator
from sqlalchemy import Column, Integer, String, ForeignKey, Table

class Base(DeclarativeBase):
    pass

t1 = Table("t1", Base.metadata, Column("name", String(50), primary_key=True))

@asynccontextmanager
async def init_engine(url: str) -> AsyncGenerator[AsyncEngine]:
    # SEE: <https://stackoverflow.com/a/79990188>
    engine = create_async_engine(url=url)
    try:
        yield engine
    finally:
        await engine.dispose()


async def init_database(engine: AsyncEngine):
    # SEE: <https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html>
    async with engine.begin() as conn:
        # NOTE: we choose not to destroy any tables we don't use
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(
            t1.insert(), [{"name": "some name 1"}, {"name": "some name 2"}]
        )
        await conn.commit()

    async with engine.connect() as conn:
        # select a Result, which will be delivered with buffered
        # results
        result = await conn.execute(select(t1).where(t1.c.name == "some name 1"))

        print(result.fetchall())
