import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ScrapItem {
  id: string;
  category: 'paper' | 'plastic' | 'metal' | 'ewaste';
  weight: number;
  imageUrl?: string;
}

export interface ScrapData {
  items: ScrapItem[];
  location: string;
  estimatedPrice: number;
  confidenceScore: number;
  pickupDate: Date | null;
  pickupTime: string;
  pickupType: 'pickup' | 'dropoff';
  paymentMethod: 'upi' | 'cash';
  transactionId: string;
  executiveRating: number;
}

interface ScrapContextType {
  data: ScrapData;
  updateData: (updates: Partial<ScrapData>) => void;
  resetData: () => void;
  addItem: (item: Omit<ScrapItem, 'id'>) => void;
  removeItem: (id: string) => void;
}

const initialData: ScrapData = {
  items: [],
  location: '',
  estimatedPrice: 0,
  confidenceScore: 0,
  pickupDate: null,
  pickupTime: '',
  pickupType: 'pickup',
  paymentMethod: 'upi',
  transactionId: '',
  executiveRating: 0,
};

const ScrapContext = createContext<ScrapContextType | undefined>(undefined);

export const ScrapProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<ScrapData>(initialData);

  const updateData = (updates: Partial<ScrapData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const resetData = () => {
    setData(initialData);
  };

  const addItem = (item: Omit<ScrapItem, 'id'>) => {
    // Use crypto.randomUUID() for secure ID generation
    const newItem: ScrapItem = {
      ...item,
      id: crypto.randomUUID(),
    };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  };

  return (
    <ScrapContext.Provider value={{ data, updateData, resetData, addItem, removeItem }}>
      {children}
    </ScrapContext.Provider>
  );
};

export const useScrap = () => {
  const context = useContext(ScrapContext);
  if (!context) {
    throw new Error('useScrap must be used within a ScrapProvider');
  }
  return context;
};
