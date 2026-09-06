from datetime import datetime

from sqlalchemy import Column, ForeignKey, Table, func
from sqlalchemy.ext.associationproxy import AssociationProxy, association_proxy
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

# TODO: change name of this table


class ShopItemInstance(Base):
    __tablename__ = "shop_item_instance"

    shop_item_id: Mapped[int] = mapped_column(
        ForeignKey("shop_item.id"), primary_key=True
    )
    shop_list_id: Mapped[int] = mapped_column(
        ForeignKey("shop_list.id"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(default=func.now())

    # item: Mapped["ShopItem"] = relationship(lazy="joined")


class ShopItem(Base):
    __tablename__ = "shop_item"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    quantity: Mapped[int]
    created_at: Mapped[datetime] = mapped_column(default=func.now())

    lists: Mapped[list["ShopList"]] = relationship(
        secondary="shop_item_instance", back_populates="items"
    )


class ShopList(Base):
    __tablename__ = "shop_list"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    active: Mapped[bool] = mapped_column(default=True)

    # item_instances: Mapped[list[ShopItemInstance]] = relationship(
    #     cascade="all, delete-orphan", backref="shop_list"
    # )

    items: Mapped[list[ShopItem]] = relationship(
        secondary="shop_item_instance", back_populates="lists"
    )
