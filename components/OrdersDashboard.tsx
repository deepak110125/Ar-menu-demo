
import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { Clock, CheckCircle, Trash2, Utensils, XCircle } from 'lucide-react';

interface OrdersDashboardProps {
  orders: Order[];
  onCompleteOrder: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => void;
  translations?: Record<string, string>;
}

const OrdersDashboard: React.FC<OrdersDashboardProps> = ({ orders, onCompleteOrder, onDeleteOrder, translations }) => {
  const t = (txt: string) => translations?.[txt] || txt;

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const getRelativeTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    
    // Handle Firestore Timestamp or Date object or number
    let millis = 0;
    if (timestamp.toMillis) {
        millis = timestamp.toMillis();
    } else if (timestamp instanceof Date) {
        millis = timestamp.getTime();
    } else if (typeof timestamp === 'number') {
        millis = timestamp;
    } else {
        return 'Just now';
    }

    const diff = Math.floor((Date.now() - millis) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    const hours = Math.floor(diff / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  const calculateTotalOrderAmount = (order: Order) => {
      // If the totalAmount is already stored, use it. Otherwise calculate.
      if (order.totalAmount) return order.totalAmount;
      return order.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Utensils className="text-orange-500" />
            {t("Live Orders")} ({orders.length})
        </h2>
        <span className="text-xs text-slate-400 bg-gray-100 px-2 py-1 rounded">
            Live Updates
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Clock size={48} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">No active orders</p>
            <p className="text-sm">New orders will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden animate-fadeIn relative">
              {/* Order Status Badge if needed */}
              <div className="bg-slate-50 p-3 border-b border-gray-100 flex justify-between items-center">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-white border border-gray-200 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm text-red-600">
                        {order.tableNumber}
                    </span>
                    {t("Table")}
                </span>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Clock size={12} />
                    {getRelativeTime(order.createdAt)}
                </span>
              </div>
              <div className="p-4">
                <ul className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {order.items.map((item, idx) => {
                        return (
                            <li key={idx} className="text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start">
                                    <span className="text-slate-700 font-medium">
                                        <span className="text-slate-400 mr-2 font-bold">{item.quantity}x</span>
                                        {item.name}
                                    </span>
                                    <span className="text-slate-900 font-bold">₹{Math.round(item.totalPrice)}</span>
                                </div>
                                
                                {/* Specific Details */}
                                <div className="ml-6 mt-1 space-y-1">
                                    {item.size && item.size !== 'Regular' && (
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">Size:</span>
                                            <span className="font-semibold bg-gray-100 px-1.5 py-0.5 rounded text-slate-600">{item.size}</span>
                                        </div>
                                    )}
                                    {item.addons && item.addons.length > 0 && (
                                        <div className="text-xs text-slate-500">
                                            <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider block mb-0.5">Add-ons:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {item.addons.map((addon, aIdx) => (
                                                    <span key={aIdx} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-blue-100">
                                                        + {addon.name} (₹{Math.round(addon.price)})
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 mb-4">
                    <span className="text-slate-500 text-sm font-bold">{t("Total")}</span>
                    <span className="text-green-600 text-lg font-black">₹{Math.round(calculateTotalOrderAmount(order))}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onCompleteOrder(order.id)} className="flex-[3] py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm">
                      <CheckCircle size={16} /> Completed
                  </button>
                  {onDeleteOrder && (
                    <button onClick={() => onDeleteOrder(order.id)} className="flex-1 py-2 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 rounded-xl transition-all flex items-center justify-center shadow-sm" title="Cancel Order">
                      <XCircle size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersDashboard;
