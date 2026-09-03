from fastapi import Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession, AsyncEngine
from typing import AsyncGenerator, Annotated
from contextlib import asynccontextmanager


@asynccontextmanager
async def make_session(engine: AsyncEngine) -> AsyncGenerator[AsyncSession]:
    """
    Creates a new AsyncSession context manager. Transaction is auto begin and commits must be explicit.

    See: <https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html#sqlalchemy.ext.asyncio.AsyncSession>
    See: <https://docs.sqlalchemy.org/en/20/orm/session_basics.html#framing-out-a-begin-commit-rollback-block>
    """
    async with AsyncSession(engine) as session:
        yield session

# NOTE: we don't apply the context manager decorator because fastapi manages this for us
# because this is used as a dependency
# @asynccontextmanager
async def session_dep(request: Request) -> AsyncGenerator[AsyncSession]:
    async with make_session(request.app.state.engine) as session:
        yield session

@asynccontextmanager
async def make_session_transact(engine: AsyncEngine) -> AsyncGenerator[AsyncSession]:
    """
    Creates a new AsyncSession context manager. Transaction is explicitly begun and commited on context exit.

    See: <https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html#sqlalchemy.ext.asyncio.AsyncSession.begin>
    See: <https://docs.sqlalchemy.org/en/20/orm/session_basics.html#framing-out-a-begin-commit-rollback-block>
    """
    async with AsyncSession(engine) as session, session.begin():
        yield session

AsyncSessionDep = Annotated[AsyncSession, Depends(session_dep)]

# NOTE: we don't apply the context manager decorator because fastapi manages this for us
# because this is used as a dependency
# @asynccontextmanager
async def session_transact_dep(request: Request) -> AsyncGenerator[AsyncSession]:
    async with make_session_transact(request.app.state.engine) as session:
        yield session

AsyncSessionTransactDep = Annotated[AsyncSession, Depends(session_transact_dep)]
