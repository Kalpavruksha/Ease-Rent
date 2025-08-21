import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Home, Users, DollarSign, AlertCircle } from 'lucide-react';
import { useDatabase } from '../../lib/database';

interface DashboardStats {
  totalProperties: number;
  occupiedProperties: number;
  totalTenants: number;
  pendingPayments: number;
}

const Dashboard = () => {
  const { isReady, operations } = useDatabase();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!isReady) return null;

      const [properties, tenants, payments] = await Promise.all([
        operations.getAllProperties(),
        operations.getAllTenants(),
        operations.getAllPayments()
      ]);

      return {
        totalProperties: properties.length,
        occupiedProperties: properties.filter(p => p.status === 'occupied').length,
        totalTenants: tenants.length,
        pendingPayments: payments.filter(p => p.status === 'pending').length
      };
    },
    enabled: isReady
  });

  if (!isReady || isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  const statCards = [
    {
      title: 'Total Properties',
      value: stats?.totalProperties || 0,
      icon: Home,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Tenants',
      value: stats?.totalTenants || 0,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Payments',
      value: stats?.pendingPayments || 0,
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      title: 'Vacant Properties',
      value: (stats?.totalProperties || 0) - (stats?.occupiedProperties || 0),
      icon: AlertCircle,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-full`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;