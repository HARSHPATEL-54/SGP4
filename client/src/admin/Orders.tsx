import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderStore } from "@/store/useOrderStore";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Check, Clock, ChefHat, Truck, Package, X } from "lucide-react";

const Orders = () => {
  const { allOrders, getAllOrders, updateOrderStatus, loading } =
    useOrderStore();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  // Status icon mapping
  const statusIcons = {
    pending: <Clock className="h-5 w-5 text-yellow-500" />,
    confirmed: <Check className="h-5 w-5 text-blue-500" />,
    preparing: <ChefHat className="h-5 w-5 text-orange-500" />,
    outfordelivery: <Truck className="h-5 w-5 text-purple-500" />,
    delivered: <Package className="h-5 w-5 text-green-500" />,
    cancelled: <X className="h-5 w-5 text-red-500" />
  };
  
  // Status color mapping
  const statusColors = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-blue-500',
    preparing: 'bg-orange-500',
    outfordelivery: 'bg-purple-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500'
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setIsUpdating(prev => ({ ...prev, [id]: true }));
      await updateOrderStatus(id, status);
      // Auto-refresh the orders after a short delay
      setTimeout(() => {
        getAllOrders();
        setIsUpdating(prev => ({ ...prev, [id]: false }));
      }, 500);
    } catch (error) {
      console.error('Error updating order status:', error);
      setIsUpdating(prev => ({ ...prev, [id]: false }));
    }
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

  // Toggle order details expansion
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  useEffect(() => {
    // Add console logs to debug order fetching
    console.log('Fetching all orders...');
    getAllOrders();
    
    // Check if orders are already in state
    const currentOrders = useOrderStore.getState().allOrders;
    console.log('Current orders in state:', currentOrders);
  }, []);
  
  // Force refresh orders when component is visible on screen
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('Refreshing all orders...');
        getAllOrders();
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange" />
        <span className="ml-2">Loading orders...</span>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-10">
        Orders Management
      </h1>

      {allOrders.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have any orders yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {allOrders.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-900 p-4 flex flex-col sm:flex-row justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-xl">
                      Order #{order._id.substring(0, 8)}
                    </CardTitle>
                    <Badge className={statusColors[order.status.toLowerCase() as keyof typeof statusColors] || 'bg-gray-500'}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate((order as any).createdAt || new Date().toISOString())}
                  </p>
                </div>

                <div className="mt-4 sm:mt-0">
                  <div className="flex items-center space-x-2">
                    {statusIcons[order.status.toLowerCase() as keyof typeof statusIcons]}
                    <Select
                      onValueChange={(newStatus) => handleStatusChange(order._id, newStatus)}
                      defaultValue={order.status}
                      disabled={isUpdating[order._id]}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="preparing">Preparing</SelectItem>
                          <SelectItem value="outfordelivery">Out For Delivery</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {isUpdating[order._id] && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Customer: {order.deliveryDetails.name}</h3>
                    <p className="text-sm text-gray-600">
                      {order.deliveryDetails.email}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => toggleOrderDetails(order._id)}
                    className="text-xs"
                  >
                    {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                  </Button>
                </div>

                {expandedOrder === order._id && (
                  <div className="mt-4">
                    <Separator className="my-4" />
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Order Items</h4>
                        <div className="space-y-2">
                          {order.cartItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span>₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
                            </div>
                          ))}
                          <Separator className="my-2" />
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>
  ₹{order.cartItems
    .reduce((acc, item) => acc + Number(item.price) * Number(item.quantity), 0)
    .toFixed(2)}
</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Delivery Details</h4>
                        <div className="space-y-1">
                          <p><span className="font-medium">Address:</span> {order.deliveryDetails.address}</p>
                          <p><span className="font-medium">City:</span> {order.deliveryDetails.city}</p>
                          <p><span className="font-medium">Contact:</span> {(order as any).user?.contact || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;