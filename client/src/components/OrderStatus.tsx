import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore } from '@/store/useOrderStore';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Clock, CookingPot, Truck, Package, AlertCircle } from 'lucide-react';
import { Separator } from './ui/separator';
import { Orders } from '@/types/orderType';
import { Badge } from './ui/badge';

// Status configurations with appropriate colors and icons
const statusConfig = {
  pending: { color: 'bg-yellow-500', icon: Clock, text: 'Pending', description: 'Your order is being processed.' },
  confirmed: { color: 'bg-blue-500', icon: CheckCircle, text: 'Confirmed', description: 'Your order has been confirmed.' },
  preparing: { color: 'bg-orange-500', icon: CookingPot, text: 'Preparing', description: 'Your food is being prepared.' },
  outfordelivery: { color: 'bg-purple-500', icon: Truck, text: 'Out For Delivery', description: 'Your food is on the way!' },
  delivered: { color: 'bg-green-500', icon: Package, text: 'Delivered', description: 'Your order has been delivered.' },
  cancelled: { color: 'bg-red-500', icon: AlertCircle, text: 'Cancelled', description: 'Your order has been cancelled.' }
};

const OrderStatus = () => {
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const { getOrderDetails, orders, loading } = useOrderStore();
  const [latestOrder, setLatestOrder] = useState<Orders | null>(null);
  
  // Clear cart on successful payment and fetch latest order
  useEffect(() => {
    // Check if we have a pending checkout session
    const pendingCheckoutSession = localStorage.getItem('pendingCheckoutSession');
    
    if (pendingCheckoutSession) {
      // Clear the cart
      clearCart();
      
      // Remove the pending checkout session from localStorage
      localStorage.removeItem('pendingCheckoutSession');
    }
    
    // Refresh order details
    getOrderDetails();
  }, [clearCart, getOrderDetails]);
  
  // Set latest order when orders are loaded
  useEffect(() => {
    if (orders && orders.length > 0) {
      // Sort orders by date (newest first) and get the latest
      const sortedOrders = [...orders].sort((a, b) => {
        return new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime();
      });
      setLatestOrder(sortedOrders[0]);
    }
  }, [orders]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto my-12 px-4 flex justify-center">
        <div className="animate-spin mr-2"><Clock size={24} /></div>
        <p>Loading your order status...</p>
      </div>
    );
  }

  const currentStatus = latestOrder?.status?.toLowerCase() || 'confirmed';
  const statusInfo = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.confirmed;
  const StatusIcon = statusInfo.icon;

  // Calculate the progression step based on status
  const statuses = ['pending', 'confirmed', 'preparing', 'outfordelivery', 'delivered'];
  const currentStep = statuses.indexOf(currentStatus);
  const progressPercentage = currentStep >= 0 ? (currentStep / (statuses.length - 1)) * 100 : 20;

  return (
    <div className="max-w-xl mx-auto my-12 px-4">
      <Card className={`border-2 border-${currentStatus === 'cancelled' ? 'red-500' : currentStatus === 'delivered' ? 'green-500' : 'blue-500'}`}>
        <CardHeader className="flex flex-col items-center">
          <div className={`${statusInfo.color} text-white rounded-full p-4`}>
            <StatusIcon className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl text-center mt-4">
            {currentStatus === 'confirmed' ? 'Order Successful!' : `Order ${statusInfo.text}`}
          </CardTitle>
          <CardDescription className="text-center">
            Thank you for your order. {currentStatus === 'cancelled' ? 'Unfortunately, your order has been cancelled.' : 'Your payment has been processed successfully.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {currentStatus !== 'cancelled' && (
            <>
              <div className="mb-6 mt-2">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <Badge className={statusInfo.color}>{statusInfo.text}</Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block">{Math.round(progressPercentage)}%</span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div style={{ width: `${progressPercentage}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${statusInfo.color}`}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2 text-xs font-medium text-center mb-4">
                  {statuses.map((status, index) => {
                    const isActive = index <= currentStep;
                    const StatusStepIcon = statusConfig[status as keyof typeof statusConfig].icon;
                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${isActive ? statusConfig[status as keyof typeof statusConfig].color : 'bg-gray-200'}`}>
                          <StatusStepIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className={isActive ? 'text-gray-900' : 'text-gray-400'}>
                          {statusConfig[status as keyof typeof statusConfig].text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <Separator className="my-4" />
            </>
          )}

          <div className="text-center space-y-2">
            <p className="font-medium">{statusInfo.description}</p>
            {latestOrder && (
              <p className="text-sm text-gray-500">
                {currentStatus === 'cancelled' ? 'You can place a new order anytime.' : currentStatus === 'delivered' ? 'Thank you for ordering with us!' : 'You can track your order status in your account.'}
              </p>
            )}
          </div>

          {latestOrder && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <div className="text-sm">
                <p><span className="font-medium">Order ID:</span> #{latestOrder._id.substring(0, 8)}</p>
                {(latestOrder as any).restaurant && (
                  <p><span className="font-medium">Restaurant:</span> {(latestOrder as any).restaurant.restaurantName}</p>
                )}
                <p>
                  <span className="font-medium">Items:</span> {latestOrder.cartItems.reduce((total, item) => total + Number(item.quantity), 0)} items
                  {latestOrder.totalAmount > 0 && (
                    <span className="ml-2">(₹{(Number(latestOrder.totalAmount) / 100).toFixed(2)})</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button 
            className="bg-orange hover:bg-hoverOrange w-full" 
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/orders')}
          >
            View All Orders
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderStatus;
