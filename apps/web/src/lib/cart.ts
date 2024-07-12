import { ShippingCost } from "@/constants";
import { DateRange } from "react-day-picker";

export async function getCartItems(userId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}order/cart_item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId })
    });
    const result = await response.json()
    return result
}

export async function checkCart(cartId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}order/cart?c=${cartId}`, {
        method: 'GET'
    });
    const result = await response.json()
    return result
}

export async function addToCart(userId: string, variantId: string, color: string, size: string, quantity: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}order/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, variantId, color, size, quantity })
    });
    const data = await response.json()
    return data
}

export async function checkStock(orderId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}order/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
    });
    const data = await response.json()
    return data
}

export async function updateCartItemQuantity(itemId: string, newQuantity: number, userId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}order/updateCartItem`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, newQuantity, userId }),
    });

    if (!response.ok) {
        throw new Error('Failed to update cart item');
    }

    return response.json();
}

export async function deleteCartItem(itemId: string, userId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}order/deleteCartItem`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, userId }),
    });

    if (!response.ok) {
        throw new Error('Failed to delete cart item');
    }

    return response.json();
}

export async function getOrderById(orderId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}order/orderDetail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
    });
    const result = await response.json()
    return result
}

export const getProvinces = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}address/getProvinces`, {
        method: 'GET',
        next: {revalidate: 10}
    });
    const result = await response.json()
    return result
};

export const getCities = async (provinceId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}address/getCities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provinceId })
    });
    const data = await response.json();
    return data;
};

export const addAddressUser = async (selectedCity: string, address: string, userId: string, labelAddress: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}address/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ selectedCity, address, userId, labelAddress })
    });
    const data = await response.json();
    return data;
}

export const getAddressList = async (userId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}address/addressList`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId })
    });
    const data = await response.json();
    return data;
}

export const fetchWarehouse = async (address: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}address/getClossestWarehouse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address })
    });
    const data = await response.json();
    return data;
}

export const fetchShippingCost = async (warehouseId: string, userAddress: string, shipping: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}address/getShippingCost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warehouseId: warehouseId, userAddress: userAddress, shipping: shipping })
    });
    const data = await response.json();
    return data;
}

export const checkoutOrder = async (orderId: string, shippingCost: number, subTotal: number, warehouseId: string, userAddress: string, shipping: string, selectedShipping: ShippingCost | undefined) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}order/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId, shippingCost: shippingCost, subTotal: subTotal, warehouseId, userAddress, shipping, selectedShipping })
    });
    const data = await response.json();
    return data;
}

export const getAllOrder = async (adminId: string | null, userId: string | null, searchQuery: string | null, limitQuery: string | null, currentQuery: string | null, warehouseQuery: string | null, date:DateRange) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}order/warehouseOrder?q=${encodeURIComponent(searchQuery || '')}&limit=${encodeURIComponent(limitQuery || '10')}&page=${encodeURIComponent(currentQuery || '1')}&w=${encodeURIComponent(warehouseQuery || '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: adminId, userId: userId, date })
    });
    const data = await response.json();
    return data;
}
