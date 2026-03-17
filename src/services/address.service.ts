// src/services/address.service.ts
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../config/api";

export type BankCode = "TECHCOMBANK" | "VIETINBANK" | "MB_BANK";

export interface Address {
  id: string | number;
  nameContact: string;
  phoneContact: string;
  addressLine: string;
  accountNumber?: string;
  bankCode?: BankCode | string;
  // UI aliases
  fullName?: string;
  phone?: string;
  province?: string;
  district?: string;
  ward?: string;
  detail?: string;
  isDefault?: boolean;
}

export type AddressPayload = {
  nameContact: string;
  phoneContact: string;
  addressLine: string;
  accountNumber?: string;
  bankCode?: BankCode;
};

function normalise(a: any): Address {
  return {
    ...a,
    fullName: a.nameContact,
    phone: a.phoneContact,
    detail: a.addressLine,
    province: "",
    district: "",
    ward: "",
  };
}

export const addressService = {
  getMyAddresses: async (): Promise<Address[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.ADDRESS_MY);
      if (response.data?.code === 1000) {
        const result = response.data.result;
        const arr = Array.isArray(result) ? result : result ? [result] : [];
        return arr.map(normalise);
      }
      return [];
    } catch (error) {
      console.error("Error fetching addresses:", error);
      return [];
    }
  },

  addAddress: async (data: AddressPayload): Promise<Address | null> => {
    try {
      const response = await api.post(API_ENDPOINTS.ADDRESS, data);
      if (response.data?.code === 1000) return normalise(response.data.result);
      return null;
    } catch (error) {
      console.error("Error adding address:", error);
      throw error;
    }
  },

  updateAddress: async (
    id: string | number,
    data: Partial<AddressPayload>,
  ): Promise<Address | null> => {
    try {
      const response = await api.put(API_ENDPOINTS.ADDRESS_BY_ID(id), data);
      if (response.data?.code === 1000) return normalise(response.data.result);
      return null;
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  },

  deleteAddress: async (id: string | number): Promise<boolean> => {
    try {
      const response = await api.delete(API_ENDPOINTS.ADDRESS_BY_ID(id));
      return response.data?.code === 1000;
    } catch (error) {
      console.error("Error deleting address:", error);
      return false;
    }
  },
};
