import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { type Order } from "@/types";
import { Printer, Download } from "lucide-react";

interface ReceiptProps {
  order: Order;
  userName?: string;
}

export default function Receipt({ order, userName }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the receipt");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - Order #${order._id.slice(-8).toUpperCase()}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
              color: #1a1a1a;
            }
            .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
            .logo { font-size: 28px; font-weight: bold; letter-spacing: -1px; margin-bottom: 5px; }
            .order-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .section { margin-bottom: 25px; }
            .section-title { font-weight: 600; font-size: 14px; color: #666; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
            .items { border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
            .item { display: flex; justify-content: space-between; padding: 12px 15px; border-bottom: 1px solid #eee; }
            .item:last-child { border-bottom: none; }
            .item-name { font-weight: 500; }
            .item-details { color: #666; font-size: 13px; }
            .totals { background: #f9f9f9; padding: 15px; border-radius: 8px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-row.final { font-weight: bold; font-size: 18px; padding-top: 10px; margin-top: 10px; border-top: 2px solid #ddd; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; color: #666; font-size: 13px; }
            .status { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; }
            .status.paid { background: #dcfce7; color: #16a34a; }
            .status.unpaid { background: #fef3c7; color: #d97706; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const orderNumber = order._id.slice(-8).toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const subtotal = order.totalPrice - order.taxPrice - order.shippingPrice;

  return (
    <div className="space-y-4">
      {/* Print/Download buttons */}
      <div className="flex gap-2 no-print">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print Receipt
        </Button>
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Download className="h-4 w-4" />
          Save as PDF
        </Button>
      </div>

      {/* Receipt content */}
      <div ref={receiptRef} className="bg-card p-6 rounded-lg border">
        {/* Header */}
        <div className="header text-center mb-6 pb-4 border-b">
          <div className="logo text-2xl font-bold tracking-tight">KORE</div>
          <p className="text-sm text-muted-foreground">Premium Fashion Store</p>
        </div>

        {/* Order Info */}
        <div className="order-info flex justify-between mb-4 text-sm">
          <div>
            <p className="text-muted-foreground">Order Number</p>
            <p className="font-mono font-medium">#{orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium">{orderDate}</p>
          </div>
        </div>

        {/* Payment Status */}
        <div className="mb-4">
          <span
            className={`status inline-block px-2 py-1 rounded text-xs font-medium ${
              order.isPaid
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}
          >
            {order.isPaid
              ? `Paid on ${new Date(order.paidAt!).toLocaleDateString()}`
              : "Awaiting Payment"}
          </span>
        </div>

        {/* Customer Info */}
        <div className="section mb-4">
          <h3 className="section-title text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Ship To
          </h3>
          <p className="font-medium">{userName || "Customer"}</p>
          <p className="text-sm text-muted-foreground">
            {order.shippingAddress?.address}
            <br />
            {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
            <br />
            {order.shippingAddress?.country}
          </p>
        </div>

        {/* Items */}
        <div className="section mb-4">
          <h3 className="section-title text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Items Ordered
          </h3>
          <div className="items border rounded-lg overflow-hidden">
            {order.orderItems?.map((item, index) => (
              <div
                key={index}
                className="item flex justify-between p-3 border-b last:border-0"
              >
                <div>
                  <p className="item-name font-medium">{item.name}</p>
                  <p className="item-details text-sm text-muted-foreground">
                    Qty: {item.qty} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <p className="font-medium">
                  ${(item.qty * item.price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="totals bg-muted/30 p-4 rounded-lg">
          <div className="total-row flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="total-row flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>${order.taxPrice.toFixed(2)}</span>
          </div>
          <div className="total-row flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {order.shippingPrice === 0
                ? "FREE"
                : `$${order.shippingPrice.toFixed(2)}`}
            </span>
          </div>
          <div className="total-row final flex justify-between text-lg font-bold pt-3 mt-3 border-t">
            <span>Total</span>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="footer text-center mt-6 pt-4 border-t text-sm text-muted-foreground">
          <p>Thank you for shopping with KORE!</p>
          <p className="mt-1">Questions? Contact support@kore.store</p>
        </div>
      </div>
    </div>
  );
}
