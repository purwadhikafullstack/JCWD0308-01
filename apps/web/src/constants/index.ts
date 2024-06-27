export const initialOrder: IOrder = {
    id: "",
    userId: "",
    status: "CART",
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
    status: "CART" | "PENDING" | "COMPLETED" | "CANCELLED"| "PROCESSED"| 'SHIPPED'
    warehouseId: string | null;
    totalAmount: number;
    paymentMethod: string | null;
    paymentStatus: "PENDING" | "PAID" | "FAILED";
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    items?: IOrderItem[];
}

export interface IOrderItem {
    id: string;
    orderId: string;
    productVariantId: string;
    size: string
    quantity: number;
    price: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    productVariant: {color: string, image: string, product: {name: string}}
}

export interface IImageFieldProps {
  currentThumbnail?: string
  currentAdditional?: IEditAdditional[]
  setCurrentAdditional?:React.Dispatch<React.SetStateAction<IEditAdditional[]>>
  thumbnail?: File;
  setThumbnail?: (value: File | undefined) => void;
  invalidMainImage?: boolean;
  setInvalidMainImage?: (value: boolean) => void;
  additionalImage?: File[];
  setAdditionalImage?: (value: File[]) => void;
}

  export interface IColorVariant {
    code: string; 
    name: string;
    variantImageURL: string
  }
  
  export interface IProductDataSet {
    name:string,
    description:string, 
    price: number, 
    oneSize: Boolean, 
    colorVariant: IColorVariant[], 
    additionalURL: string[], 
    thumbnailURL: string, 
    categoryData: ICategory
  }

  interface IProductImage {
    id: string;
    productID: string;
    image: string;
  }
  
  export interface IProductVariant {
    id: string;
    productID: string;
    color: string;
    HEX: string;
    image: string;
    warehouseProduct: any[];
    totalStock: number;
  }
  
  export interface ICategory {
    id?: string;
    slug?: string
    gender: string;
    type: string;
    category: string;
  }
  
  export interface IProduct {
    id: string;
    name: string;
    slug: string;
    stockUpdatedAt: Date
    description: string;
    thumbnailURL: string; 
    price: number;
    oneSize: boolean;
    categoryID: string;
    createdAt: string;
    images: IProductImage[];
    variants: IProductVariant[];
    category: ICategory;
    totalStock: number;
    sales: number
  }

  export interface IProductList {
    productList: IProduct[]
  }

  export interface IEditColor {
    id?: string
    code: string
    name: string
    image?: File
    imageURL?: string
    isDeleted: boolean
    isEdited: boolean
    isNew: boolean
  }

  export interface IEditAdditional {
    id?: string
    productID: string
    image?: string
    imageFile?: File
    isDeleted: boolean
    isNew: boolean
  }

  export interface IWarehouse {
    id?:string,
    warehouseName?:string,
    city?:string,
    coordinate?:string,
    address?:string,
    createdAt?:Date,
    adminID?:string,
  }




  
export interface Province {
    province_id: string;
    province: string;
}

export interface City {
    city_id: string;
    city_name: string;
    type?: string
}

export interface Address {
    id: string;
    coordinate: string;
    mainAddress: boolean;
}

export interface Warehouse {
    id: string;
    warehouseName: string;
    city: string;
    coordinate: string;
    address: string;
    city_id: string;
    province_id: string;
    province: string;
    type: string;
    city_name: string;
    postal_code: string;
    createdAt: string;
    adminID: string;
}

export interface ShippingCostResponse {
    code: string;
    name: string;
    costs: ShippingCost[];
}

export interface ShippingCost {
    service: string;
    description: string;
    cost: ShippingDetail[];
}

export interface ShippingDetail {
    value: number;
    etd: string;
    note: string;
}

export interface Province {
    province_id: string;
    province: string;
}

export interface City {
    city_id: string;
    city_name: string;
    type?: string
}

export interface Address {
    id: string;
    coordinate: string;
    mainAddress: boolean;
}

export interface Warehouse {
    id: string;
    warehouseName: string;
    city: string;
    coordinate: string;
    address: string;
    city_id: string;
    province_id: string;
    province: string;
    type: string;
    city_name: string;
    postal_code: string;
    createdAt: string;
    adminID: string;
}

export interface ShippingCostResponse {
    code: string;
    name: string;
    costs: ShippingCost[];
}

export interface ShippingCost {
    service: string;
    description: string;
    cost: ShippingDetail[];
}

export interface ShippingDetail {
    value: number;
    etd: string;
    note: string;
}