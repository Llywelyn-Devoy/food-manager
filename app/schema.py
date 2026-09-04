from datetime import datetime

from sqlalchemy import Column, ForeignKey, Table, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

# TODO: change name of this table
association_table = Table(
    "association_table",
    Base.metadata,
    Column("shop_item_id", ForeignKey("shop_item.id"), primary_key=True),
    Column("shop_list_id", ForeignKey("shop_list.id"), primary_key=True),
)


class ShopItem(Base):
    __tablename__ = "shop_item"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    quantity: Mapped[int]
    created_at: Mapped[datetime] = mapped_column(default=func.now())

    shop_lists: Mapped[list["ShopList"]] = relationship(
        secondary=association_table, back_populates="shop_items"
    )


class ShopList(Base):
    __tablename__ = "shop_list"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    active: Mapped[bool] = mapped_column(default=True)

    shop_items: Mapped[list[ShopItem]] = relationship(
        secondary=association_table, back_populates="shop_lists"
    )
