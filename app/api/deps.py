from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession


@asynccontextmanager
async def make_session(engine: AsyncEngine) -> AsyncGenerator[AsyncSession]:
    """
    Creates a new AsyncSession context manager. Transaction is auto begin and commits must be explicit.

    See: <https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html#sqlalchemy.ext.asyncio.AsyncSession>
    See: <https://docs.sqlalchemy.org/en/20/orm/session_basics.html#framing-out-a-begin-commit-rollback-block>
    """
    async with AsyncSession(
        engine,
        # See: <https://docs.sqlalchemy.org/en/20/orm/session_api.html#sqlalchemy.orm.Session.params.expire_on_commit>
        # Disabling this prevents re-fetching the object from the DB after
        # commit.
        # NOTE: This change appears to prevent a crash after committing, I am
        # not sure of the exact cause but I think the combination of the ORM
        # re-fetching the object from the DB + the async context is to blame.
        expire_on_commit=False,
    ) as session:
        yield session


# NOTE: we don't apply the context manager decorator because fastapi manages this for us
# because this is used as a dependency
# @asynccontextmanager
async def session_dep(request: Request) -> AsyncGenerator[AsyncSession]:
    async with make_session(request.app.state.engine) as session:
        yield session


AsyncSessionDep = Annotated[AsyncSession, Depends(session_dep)]
