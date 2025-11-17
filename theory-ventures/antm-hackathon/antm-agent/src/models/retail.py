"""Pydantic models for retail schema matching hackathon data structure."""

from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class Store(BaseModel):
    """Store model matching store.parquet schema."""

    store_sk: int = Field(..., description="Store surrogate key")
    store_id: Optional[str] = Field(None, description="Store identifier")
    store_name: Optional[str] = Field(None, description="Store name")
    # Add other fields as needed based on actual schema


class Item(BaseModel):
    """Item model matching item.parquet schema."""

    item_sk: int = Field(..., description="Item surrogate key")
    item_id: Optional[str] = Field(None, description="Item identifier")
    item_name: Optional[str] = Field(None, description="Item name")
    category: Optional[str] = Field(None, description="Product category")
    # Add other fields as needed based on actual schema


class Warehouse(BaseModel):
    """Warehouse model matching warehouse.parquet schema."""

    warehouse_sk: int = Field(..., description="Warehouse surrogate key")
    warehouse_id: Optional[str] = Field(None, description="Warehouse identifier")
    warehouse_name: Optional[str] = Field(None, description="Warehouse name")
    # Add other fields as needed based on actual schema


class Customer(BaseModel):
    """Customer model matching customer.parquet schema."""

    customer_sk: int = Field(..., description="Customer surrogate key")
    customer_id: Optional[str] = Field(None, description="Customer identifier")
    first_name: Optional[str] = Field(None, description="First name")
    last_name: Optional[str] = Field(None, description="Last name")
    # Add other fields as needed based on actual schema


class Sale(BaseModel):
    """Sale model matching store_sales/catalog_sales/web_sales schema."""

    sale_sk: Optional[int] = Field(None, description="Sale surrogate key")
    item_sk: Optional[int] = Field(None, description="Item surrogate key")
    store_sk: Optional[int] = Field(None, description="Store surrogate key")
    customer_sk: Optional[int] = Field(None, description="Customer surrogate key")
    sale_date: Optional[date] = Field(None, description="Sale date")
    quantity: Optional[int] = Field(None, description="Quantity sold")
    net_paid: Optional[float] = Field(None, description="Net amount paid")
    net_profit: Optional[float] = Field(None, description="Net profit")
    # Add other fields as needed based on actual schema


class Inventory(BaseModel):
    """Inventory model matching inventory.parquet schema."""

    inventory_sk: Optional[int] = Field(None, description="Inventory surrogate key")
    item_sk: Optional[int] = Field(None, description="Item surrogate key")
    warehouse_sk: Optional[int] = Field(None, description="Warehouse surrogate key")
    quantity_on_hand: Optional[int] = Field(None, description="Quantity on hand")
    # Add other fields as needed based on actual schema


class StoreReturn(BaseModel):
    """Store return model matching store_returns.parquet schema."""

    return_sk: Optional[int] = Field(None, description="Return surrogate key")
    item_sk: Optional[int] = Field(None, description="Item surrogate key")
    store_sk: Optional[int] = Field(None, description="Store surrogate key")
    customer_sk: Optional[int] = Field(None, description="Customer surrogate key")
    return_date: Optional[date] = Field(None, description="Return date")
    return_quantity: Optional[int] = Field(None, description="Return quantity")
    return_amount: Optional[float] = Field(None, description="Return amount")
    # Add other fields as needed based on actual schema

