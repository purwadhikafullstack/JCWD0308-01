export const initialOrder: IOrder = {
    id: "",
    userId: "",
    status: "CART",
    paymentProof: null,
    warehouseId: null,
    totalAmount: 0,
    paymentMethod: null,
    paymentStatus: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: []
};

export interface IOrder {
    id: string;
    userId: string;
    status: "CART" | "PENDING" | "COMPLETED" | "CANCELLED";
    paymentProof: string | null;
    warehouseId: string | null;
    totalAmount: number;
    paymentMethod: string | null;
    paymentStatus: "PENDING" | "PAID" | "FAILED";
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    items: IOrderItem[];
}

export interface IOrderItem {
    id: string;
    orderId: string;
    productVariantId: string;
    quantity: number;
    price: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    productVariant: {color: string, image: string, product: {name: string}}
}