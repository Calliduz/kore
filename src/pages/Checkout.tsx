import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const checkoutSchema = z.object({
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City is required"),
    postalCode: z.string().min(4, "Postal code is required"),
    country: z.string().min(2, "Country is required"),
    cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
    expiry: z.string().regex(/^\d{2}\/\d{2}$/, "MM/YY format required"),
    cvc: z.string().regex(/^\d{3}$/, "CVC must be 3 digits"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
    const { items, total, clearCart } = useCartStore();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema)
    });

    useEffect(() => {
        if (items.length === 0) {
            navigate('/cart');
            toast.error("Your cart is empty");
        }
    }, [items, navigate]);

    const onSubmit = async (data: CheckoutFormData) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log("Order Data:", { ...data, items, total });
        clearCart();
        toast.success("Order placed successfully!");
        navigate('/account');
    };

    if (items.length === 0) return null;

    return (
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div>
                <h1 className="text-2xl font-bold mb-6">Checkout</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Shipping Address</h2>
                        <div>
                            <input {...register('address')} placeholder="Address" className="w-full p-2 border rounded" />
                            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <input {...register('city')} placeholder="City" className="w-full p-2 border rounded" />
                                {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                            </div>
                            <div>
                                <input {...register('postalCode')} placeholder="Postal Code" className="w-full p-2 border rounded" />
                                {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode.message}</p>}
                            </div>
                        </div>
                        <div>
                            <input {...register('country')} placeholder="Country" className="w-full p-2 border rounded" />
                            {errors.country && <p className="text-red-500 text-sm">{errors.country.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Payment Details</h2>
                         <div>
                            <input {...register('cardNumber')} placeholder="Card Number (0000000000000000)" className="w-full p-2 border rounded" />
                            {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber.message}</p>}
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <input {...register('expiry')} placeholder="MM/YY" className="w-full p-2 border rounded" />
                                {errors.expiry && <p className="text-red-500 text-sm">{errors.expiry.message}</p>}
                            </div>
                            <div>
                                <input {...register('cvc')} placeholder="CVC" className="w-full p-2 border rounded" />
                                {errors.cvc && <p className="text-red-500 text-sm">{errors.cvc.message}</p>}
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing Order...
                            </>
                        ) : (
                            `Pay $${total.toFixed(2)}`
                        )}
                    </Button>
                </form>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg h-fit">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4">
                    {items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.name} x {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t pt-4 flex justify-between font-bold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
