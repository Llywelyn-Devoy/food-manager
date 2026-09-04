from fastapi import APIRouter

from app.api.shop_item import router as shop_item_router

router = APIRouter()
# router.include_router(...)
router.include_router(shop_item_router)
