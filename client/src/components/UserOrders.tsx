import { useEffect, useState } from 'react';
import { useOrderStore } from '@/store/useOrderStore';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { 
  ClockIcon, 
  CheckCircleIcon,
  TruckIcon,
  CookingPotIcon,
  TimerIcon
} from 'lucide-react';
import { Separator } from './ui/separator';

// Status badge configurations with appropriate colors
const statusConfig = {
  pending: { color: 'bg-yellow-500', icon: TimerIcon, text: 'Pending' },
  confirmed: { color: 'bg-blue-500', icon: CheckCircleIcon, text: 'Confirmed' },
  preparing: { color: 'bg-orange-500', icon: CookingPotIcon, text: 'Preparing' },
  outfordelivery: { color: 'bg-purple-500', icon: TruckIcon, text: 'Out For Delivery' },
  delivered: { color: 'bg-green-500', icon: CheckCircleIcon, text: 'Delivered' },
  cancelled: { color: 'bg-red-500', icon: TimerIcon, text: 'Cancelled' }
};

const UserOrders = () => {
  const { orders, loading, getOrderDetails } = useOrderStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getOrderDetails();
  }, [getOrderDetails]);

  // Function to toggle expanded state for an order
  const toggleExpand = (orderId: string) => {
    setExpanded(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to render the status badge with icon
  const renderStatusBadge = (status: string) => {
    const statusKey = status.toLowerCase() as keyof typeof statusConfig;
    const config = statusConfig[statusKey] || statusConfig.pending;
    const StatusIcon = config.icon;
    
    return (
      <Badge className={`${config.color} text-white px-4 py-1`}>
        <StatusIcon className="w-4 h-4 mr-1" />
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center p-8">Loading orders...</div>;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center p-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>No Orders Yet</CardTitle>
            <CardDescription>
              You haven't placed any orders yet. Browse restaurants to order delicious food!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
      
      <div className="space-y-5">
        {orders.map((order) => (
          <Card key={order._id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-900 p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-lg">
                    {(order as any).restaurant?.restaurantName || 'Restaurant'}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Order #{order._id.substring(0, 8)} • {formatDate((order as any).createdAt || new Date().toISOString())}
                  </CardDescription>
                </div>
                <div className="mt-2 sm:mt-0">
                  {renderStatusBadge(order.status)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    {order.cartItems.reduce((total, item) => total + Number(item.quantity), 0)} items • 
                    ₹{order.cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0).toFixed(2)}
                  </p>
                  <button 
                    onClick={() => toggleExpand(order._id)} 
                    className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none mt-1"
                  >
                    {expanded[order._id] ? 'Hide details' : 'View details'}
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {order.status === 'delivered' ? 'Delivered' : 'Est. delivery time: 30-45 min'}
                  </span>
                </div>
              </div>
              
              {expanded[order._id] && (
                <div className="mt-4">
                  <Separator className="mb-4" />
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm">Order Items</h4>
                      <ul className="mt-2 space-y-2">
                        {order.cartItems.map((item, index) => (
                          <li key={index} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm">Delivery Details</h4>
                      <div className="mt-1 text-sm">
                        <p>{order.deliveryDetails.name}</p>
                        <p>{order.deliveryDetails.address}, {order.deliveryDetails.city}</p>
                        <p>{order.deliveryDetails.email}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <h4 className="font-medium text-sm">Order Status Timeline</h4>
                      <div className="mt-2 relative">
                        <OrderStatusTimeline currentStatus={order.status} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Component to display order status timeline
const OrderStatusTimeline = ({ currentStatus }: { currentStatus: string }) => {
  // For cancelled orders, we show a different timeline entirely
  if (currentStatus.toLowerCase() === 'cancelled') {
    return (
      <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg border border-red-200">
        <TimerIcon className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-red-700 font-medium">Order Cancelled</p>
        <p className="text-sm text-red-600 mt-1">This order has been cancelled.</p>
      </div>
    );
  }
  
  const statuses = ['pending', 'confirmed', 'preparing', 'outfordelivery', 'delivered'];
  const currentIndex = statuses.indexOf(currentStatus.toLowerCase());
  
  return (
    <div className="relative">
      <div className="absolute top-2.5 left-0 w-full h-0.5 bg-gray-200"></div>
      <div className="flex justify-between relative">
        {statuses.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const StatusIcon = statusConfig[status as keyof typeof statusConfig].icon;
          
          return (
            <div key={status} className="flex flex-col items-center relative z-10">
              <div className={`w-5 h-5 rounded-full ${isCompleted ? statusConfig[status as keyof typeof statusConfig].color : 'bg-gray-200'} flex items-center justify-center`}>
                <StatusIcon className="w-3 h-3 text-white" />
              </div>
              <span className="mt-1 text-xs">
                {statusConfig[status as keyof typeof statusConfig].text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserOrders;
