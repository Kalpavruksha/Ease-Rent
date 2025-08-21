import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Home, Edit, Trash2 } from 'lucide-react';
import { dbOperations } from '../../lib/database';

interface Property {
  id: string;
  name: string;
  address: string;
  monthly_rent: number;
  status: string;
}

const Properties = () => {
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['properties'],
    queryFn: () => dbOperations.getAllProperties()
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Properties</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Home className="w-4 h-4" />
          Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{property.name}</h3>
            <p className="text-gray-600 mb-4">{property.address}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">₹{property.monthly_rent}/month</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                property.status === 'available' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {property.status}
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 flex items-center justify-center gap-2 text-blue-500 hover:bg-blue-50 py-2 rounded">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-2 rounded">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Properties;