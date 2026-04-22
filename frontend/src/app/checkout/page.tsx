'use client';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { clearCart } from '@/store/cartSlice';
import { useSession } from 'next-auth/react';
import { createOrder } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [deliveryCoords, setDeliveryCoords] = useState<{lat: number, lng: number} | null>(null);

  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setDeliveryCoords({ lat: latitude, lng: longitude });
          setError('');
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data.display_name) {
              setAddress(data.display_name);
            }
          } catch (err) {
            console.error('Reverse geocoding failed:', err);
          }
        },
        () => setError('GPS Location is required.')
      );
    } else {
      setError('Geolocation not supported by browser.');
    }
  };

  const tax = totalAmount * 0.05;
  const grandTotal = totalAmount + tax;


  //older before fixing razorpay ------>>>>>>
  // const handleRazorpayPayment = async () => {
  //   if (!address.trim()) {
  //     setError('Please enter a delivery address.');
  //     return;
  //   }
    
  //   setError('');
  //   setProcessing(true);

  //   const coords = deliveryCoords || { lat: 0, lng: 0 };

  //   const placeOrderDirectly = async () => {
  //     try {
  //       const userId = (session?.user as any)?.id;
        
  //       // Final guard: Ensure userId is a valid MongoDB ObjectId (24 chars hex)
  //       const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId || '');
        
  //       if (!isValidObjectId) {
  //         console.error("Invalid User ID detected:", userId);
  //         setError('Your session has expired or is invalid. Please Logout and Login again to continue.');
  //         setProcessing(false);
  //         return;
  //       }

  //       await createOrder({
  //         userId: userId,
  //         products: items.map(item => ({
  //           productId: item.id,
  //           quantity: item.quantity,
  //           price: item.price,
  //         })),
  //         totalAmount: grandTotal,
  //         deliveryAddress: address,
  //         deliveryCoords: coords,
  //         paymentMethod: paymentMethod === 'cod' ? 'COD' : 'Online',
  //         status: 'Placed'
  //       } as any);
  //       dispatch(clearCart());
  //       router.push('/orders');
  //     } catch (err) {
  //       console.error('Order error:', err);
  //       setError('Failed to place order. Please try again.');
  //       setProcessing(false);
  //     }
  //   };

  //   if (paymentMethod === 'cod') {
  //     await placeOrderDirectly();
  //     return;
  //   }

  //   try {
  //     const options = {
  //       key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_test_DUMMY',
  //       amount: Math.round(grandTotal * 100),
  //       currency: 'INR',
  //       name: 'FreshCurator',
  //       description: 'Organic Groceries Order',
  //       image: '/favicon.ico',
  //       method: {
  //         netbanking: true,
  //         card: true,
  //         upi: true,
  //         wallet: true,
  //       },
  //       handler: async (response: { razorpay_order_id?: string; razorpay_payment_id?: string }) => {
  //         try {
  //           await createOrder({
  //             userId: (session?.user as any)?.id,
  //             products: items.map(item => ({
  //               productId: item.id,
  //               quantity: item.quantity,
  //               price: item.price,
  //             })),
  //             totalAmount: grandTotal,
  //             deliveryAddress: address,
  //             deliveryCoords: coords,
  //             paymentMethod: 'Online',
  //             razorpayOrderId: response.razorpay_order_id,
  //             razorpayPaymentId: response.razorpay_payment_id,
  //             status: 'Placed',
  //           } as any);
  //           dispatch(clearCart());
  //           router.push('/orders');
  //         } catch (err) {
  //           console.error('Order save error:', err);
  //           setError('Payment successful but failed to save order. Contact support.');
  //           setProcessing(false);
  //         }
  //       },
  //       prefill: {
  //         name: session?.user?.name || 'Customer',
  //         email: session?.user?.email || '',
  //         contact: (session?.user as any)?.phone || '9000000000',
  //       },
  //       theme: { color: '#006a30' },
  //       modal: {
  //         ondismiss: () => setProcessing(false),
  //       },
  //     };

  //     const rzp = new (window as any).Razorpay(options);
  //     rzp.open();
  //   } catch {
  //     setError('Failed to initialize payment. Please try again.');
  //     setProcessing(false);
  //   }
  // };

  //newer------------>>>>>>>>>>>>.
  const handleRazorpayPayment = async () => {
    if (!address.trim()) {
      setError('Please enter a delivery address.');
      return;
    }
    
    setError('');
    setProcessing(true);

    const coords = deliveryCoords || { lat: 0, lng: 0 };
    const userId = (session?.user as any)?.id;

    // 1. Backend Order Creation (Now generates the real Razorpay Order ID)
    let orderResponse;
    try {
      orderResponse = await createOrder({
        userId: userId,
        products: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: grandTotal,
        deliveryAddress: address,
        deliveryCoords: coords,
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'Online',
      } as any);
    } catch (err) {
      console.error('Order creation failed:', err);
      setError('Failed to initiate order. Please try again.');
      setProcessing(false);
      return;
    }

    // 2. Handle Cash on Delivery (Ends here)
    if (paymentMethod === 'cod') {
      dispatch(clearCart());
      router.push('/orders');
      return;
    }

    // 3. Handle Online Payment (Razorpay)
    try {
      // const options = {
      //   key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use your actual key
      //   amount: Math.round(grandTotal * 100), // In paise
      //   currency: 'INR', // Force INR to fix the international error
      //   name: 'FreshCurator',
      //   description: 'Organic Groceries Order',
      //   order_id: orderResponse.razorpayOrderId, // CRITICAL: Use ID from your backend
      //   handler: async (response: any) => {
      //     // Here you would normally call a verifyPayment API
      //     dispatch(clearCart());
      //     router.push('/orders');
      //   },
      //   prefill: {
      //     name: session?.user?.name || 'Customer',
      //     email: session?.user?.email || '',
      //     contact: (session?.user as any)?.phone || '9000000000',
      //   },
      //   theme: { color: '#006a30' },
      //   modal: {
      //     ondismiss: () => setProcessing(false),
      //   },
      // };

      const options = {
  // --- Kept your original configuration exactly ---
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_test_DUMMY',
  amount: Math.round(grandTotal * 100),
  currency: 'INR',
  name: 'FreshCurator',
  description: 'Organic Groceries Order',
  image: '/favicon.ico',
  order_id: orderResponse.razorpayOrderId, // Now using the real ID from your backend
  method: {
    netbanking: true,
    card: true,
    upi: true,
    wallet: true,
  },

  // --- Updated Handler (Preserves functionality + adds verification) ---
  handler: async (response: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string }) => {
    try {
      // 1. Verify the payment signature on the backend
      // This ensures the order moves from 'Pending' to 'Placed' in your database
      await api.post('/api/orders/verify-payment', {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      // 2. Your original success logic
      dispatch(clearCart());
      router.push('/orders');
    } catch (err) {
      console.error('Order verification error:', err);
      setError('Payment was successful, but we couldn\'t verify the order. Please contact support.');
      setProcessing(false);
    }
  },

  // --- Kept your prefill and theme exactly the same ---
  prefill: {
    name: session?.user?.name || 'Customer',
    email: session?.user?.email || '',
    contact: (session?.user as any)?.phone || '9000000000',
  },
  theme: { color: '#006a30' },
  modal: {
    ondismiss: () => setProcessing(false),
  },
};

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay init error:', err);
      setError('Failed to open payment gateway.');
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="pt-24 pb-24 max-w-2xl mx-auto px-6 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">receipt_long</span>
        <h1 className="text-2xl font-bold font-headline mb-3">Nothing to check out</h1>
        <p className="text-on-surface-variant mb-8">Your basket is empty. Add some fresh items first!</p>
        <Link href="/" className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold font-headline hover:scale-[1.02] transition-transform">
          Shop Now
        </Link>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-24 max-w-5xl mx-auto px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight">Checkout</h1>
        <p className="text-on-surface-variant font-body mt-1">Review your order and complete payment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Address + Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
            <h2 className="text-xl font-bold font-headline mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              Delivery Address
            </h2>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Enter your full delivery address (Street, City, PIN code)..."
              rows={3}
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none border border-outline-variant/10"
            />
            
            <div className="mt-4">
               <button type="button" onClick={captureLocation} className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold text-sm ${deliveryCoords ? 'bg-green-500/10 text-green-700 border-green-500/30' : 'bg-surface-container-low border-outline-variant/20 hover:bg-primary hover:text-on-primary'}`}>
                 <span className="material-symbols-outlined">{deliveryCoords ? 'my_location' : 'share_location'}</span>
                 {deliveryCoords ? 'Location Captured Successfully ✓' : 'Capture Exact GPS Location (Required)'}
               </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </p>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
            <h2 className="text-xl font-bold font-headline mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">shopping_basket</span>
              Order Items
            </h2>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-outline-variant/10 last:border-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container-low flex-shrink-0">
                    <img
                      src={item.imageUrl || `https://placehold.co/100x100/e8f5e9/2e7d32?text=${encodeURIComponent(item.name)}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-headline font-bold text-on-surface text-sm">{item.name}</p>
                    <p className="text-xs text-on-surface-variant">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-extrabold font-headline text-on-surface">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Payment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10 sticky top-24">
            <h2 className="text-xl font-bold font-headline mb-5 pb-4 border-b border-outline-variant/10">
              Payment Summary
            </h2>
            <div className="space-y-3 mb-5 font-body text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Delivery</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">GST (5%)</span>
                <span className="font-semibold">₹{tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between font-extrabold font-headline text-xl pt-4 border-t border-outline-variant/10 mb-6">
              <span>Grand Total</span>
              <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-5 pb-5 border-b border-outline-variant/10">
              <h3 className="font-headline font-bold mb-3 text-sm">Payment Method</h3>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:bg-surface-container-low'}`}>
                  <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="w-4 h-4 text-primary focus:ring-primary" />
                  <span className="font-body text-sm font-medium">Pay Online (Razorpay)</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:bg-surface-container-low'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-primary focus:ring-primary" />
                  <span className="font-body text-sm font-medium">Cash on Delivery (COD)</span>
                </label>
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-2 mb-5 text-xs text-on-surface-variant font-label">
              <span className="material-symbols-outlined text-green-600 text-base">security</span>
              Secured by Razorpay · 256-bit SSL
            </div>

            <button
              onClick={handleRazorpayPayment}
              disabled={processing || !deliveryCoords}
              className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold font-headline py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {processing ? (
                <><span className="material-symbols-outlined animate-spin">progress_activity</span> Processing...</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{paymentMethod === 'cod' ? 'local_shipping' : 'payments'}</span> {paymentMethod === 'cod' ? 'Place Order' : 'Pay with Razorpay'}</>
              )}
            </button>

            <Link href="/cart" className="block text-center mt-4 text-sm text-on-surface-variant hover:text-on-surface transition-colors font-body">
              ← Back to Basket
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
