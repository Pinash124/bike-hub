import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartView } from '../components/buyer/Cart/ShoppingCart';
import type { CartItem } from '../contexts/CartContext';

export default function CartPage() {
    const navigate = useNavigate();

    const handleCheckout = (selectedItems: CartItem[]) => {
        if (selectedItems.length === 0) return;

        // Convert CartItems to listingIds expected by Checkout
        const listingIds = selectedItems.map(item => item.productId);

        navigate('/buyer/checkout', { state: { listingIds } });
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <div className="max-w-[1200px] mx-auto px-4">
                <ShoppingCartView onCheckout={handleCheckout} />
            </div>
        </div>
    );
}
