import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/store/cartStore";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function CartSheet() {
  const { items, total, removeItem, addItem } = useCartStore();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative group p-2">
            <ShoppingCart className="h-5 w-5 text-foreground/60 group-hover:text-foreground transition-colors" />
            {itemCount > 0 && (
            <span className="absolute -top-0 -right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center animate-in zoom-in">
                {itemCount}
            </span>
            )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        
        {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">Your cart is empty</p>
                <SheetTrigger asChild>
                    <Link to="/shop">
                        <Button variant="outline">Start Shopping</Button>
                    </Link>
                </SheetTrigger>
            </div>
        ) : (
            <>
                <div className="flex-1 overflow-y-auto py-6 -mx-6 px-6">
                    <div className="space-y-6">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="h-20 w-20 rounded-md overflow-hidden bg-muted shrink-0 border">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between gap-2">
                                        <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                                        <p className="font-semibold text-sm">${((item.price || 0) * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <div className="flex items-center gap-2 border rounded-md h-8">
                                            <button 
                                                onClick={() => removeItem(item.id)}
                                                className="px-2 hover:bg-muted h-full transition-colors"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-xs w-4 text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => addItem(item)}
                                                className="px-2 hover:bg-muted h-full transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => removeItem(item.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t">
                    <div className="flex justify-between text-base font-semibold">
                        <span>Total</span>
                        <span>${(total || 0).toFixed(2)}</span>
                    </div>
                    <SheetTrigger asChild>
                        <Link to="/checkout" className="w-full block">
                            <Button className="w-full gap-2" size="lg">
                                Checkout
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </SheetTrigger>
                     <SheetTrigger asChild>
                         <Link to="/cart" className="w-full block text-center">
                            <Button variant="outline" className="w-full">
                                View Cart
                            </Button>
                         </Link>
                     </SheetTrigger>
                </div>
            </>
        )}
      </SheetContent>
    </Sheet>
  );
}
