from fastapi import APIRouter

from app.api.shop_item import router as shop_item_router
from app.api.shop_list import router as shop_list_router

router = APIRouter()
# router.include_router(...)
router.include_router(shop_item_router)
router.include_router(shop_list_router)
