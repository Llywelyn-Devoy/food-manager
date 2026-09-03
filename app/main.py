from sqlalchemy.ext.asyncio import async_sessionmaker
from contextlib import asynccontextmanager
from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api.main import router as api_router
# from app.core.config import settings
import app.settings as settings
from app.db import create_engine, init_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with create_engine(settings.SQLITE_DATABASE_URL) as engine:
        print("Starting...")

        await init_database(engine)
        app.state.engine = engine

        # SEE: <https://docs.sqlalchemy.org/en/20/orm/session_basics.html#using-a-sessionmaker>
        AsyncSession = async_sessionmaker(engine)
        app.state.make_session = lambda: AsyncSession()
        app.state.make_session_transaction = lambda: AsyncSession.begin()

        yield

        print("Shutting down...")


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

# TODO: add these origins to the app settings
# NOTE: I'm not sure why the below origins aren't working so for how we'll just
# use wildcard
# origins = ["http://localhost:8080", "http://localhost:8080/", "http://localhost:80/"]
# origins = ["*"]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     # NOTE: can't allow creds with wildcard origins
#     allow_credentials=False,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(GZipMiddleware, minimum_size=512, compresslevel=9)


app.include_router(api_router)


@app.get("/")
def hello_world():
    return "hello world"
