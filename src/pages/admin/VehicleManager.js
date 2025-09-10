import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db, storage } from '../../firebase';
import { collection, getDocs, deleteDoc, collectionGroup, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash, FaSearch, FaCar, FaSpinner, FaFilter } from 'react-icons/fa';

const VehicleManager = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('all');
  const navigate = useNavigate();

  const handleDelete = async (vehicle) => {
    const vehicleName = vehicle.name || vehicle.make || 'this vehicle';
    if (!window.confirm(`Are you sure you want to delete ${vehicleName}?`)) return;

    console.log('Starting delete process for vehicle:', vehicle);
    console.log('Vehicle structure:', JSON.stringify(vehicle, null, 2));
    
    try {
      // Skip image deletion to avoid errors and focus on document deletion
      console.log('Skipping image deletion to avoid storage errors');

      // Delete the document from Firestore - try multiple possible paths
      console.log('Deleting Firestore document for vehicle:', vehicle.id, 'in category:', vehicle.category);
      
      if (!vehicle.category || !vehicle.id) {
        throw new Error('Missing vehicle category or ID');
      }
      
      // Delete from the correct Firestore structure: vehicleDetails/{category}/vehicles/{id}
      const vehicleDetailsRef = doc(db, 'vehicleDetails', vehicle.category, 'vehicles', vehicle.id);
      console.log('Attempting to delete from vehicleDetails path: vehicleDetails/' + vehicle.category + '/vehicles/' + vehicle.id);
      
      await deleteDoc(vehicleDetailsRef);
      console.log('Successfully deleted from vehicleDetails path');

      // Update the local state to remove the deleted vehicle
      setVehicles(prevVehicles => {
        const updatedVehicles = prevVehicles.filter(v => v.id !== vehicle.id);
        console.log('Updated vehicles list. Removed vehicle:', vehicle.id);
        console.log('Remaining vehicles count:', updatedVehicles.length);
        return updatedVehicles;
      });
      
      toast.success(`${vehicleName} deleted successfully!`);
    } catch (error) {
      console.error('Error in handleDelete:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      toast.error(`Failed to delete vehicle: ${error.message}`);
    }
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [vehiclesSnapshot, categoriesSnapshot] = await Promise.all([
        getDocs(collectionGroup(db, 'vehicles')),
        getDocs(collection(db, 'categories'))
      ]);

      const vehiclesList = vehiclesSnapshot.docs.map(doc => ({
        id: doc.id,
        category: doc.ref.parent.parent.id,
        ...doc.data()
      }));
      setVehicles(vehiclesList);

      const categoriesList = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.id
      }));
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredVehicles = React.useMemo(() => {
    if (selectedVehicleId !== 'all') {
      return vehicles.filter(v => v.id === selectedVehicleId);
    }
    return vehicles;
  }, [vehicles, selectedVehicleId]);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <header className="py-4 border-b border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FaCar className="text-blue-600" />
                Vehicle Inventory
              </h1>
              <p className="text-gray-500 text-sm mt-1">Manage your fleet with ease</p>
            </div>
            <Link 
              to="/admin-panel/vehicles/add" 
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Add New Vehicle
            </Link>
          </div>
        </header>

        {/* Search and Filter Bar */}
        <section className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 py-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-64">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
              >
                <option value="all">All Vehicles</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name || 'Untitled'} {v.registration ? `• ${v.registration}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <FaFilter className="mr-2 h-4 w-4" />
              Filters
            </button>
          </div>
        </section>

        {isLoading ? (
          <div className="text-center p-10 flex flex-col items-center">
            <FaSpinner className="animate-spin text-2xl text-blue-600 mb-2" />
            <p className="text-gray-600 text-xs">Loading vehicles...</p>
          </div>
        ) : (
          <section className="space-y-4">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <article 
                  key={vehicle.id}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="flex items-center p-4">
                    {/* Small Vehicle Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {vehicle.images?.[0] ? (
                        <img 
                          src={vehicle.images[0]} 
                          alt={vehicle.name || 'Vehicle'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            console.log('Image failed to load:', vehicle.images[0]);
                            e.target.style.display = 'none';
                            const fallback = e.target.parentElement.querySelector('.fallback-icon');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="fallback-icon h-full w-full flex items-center justify-center text-gray-300" style={{display: vehicle.images?.[0] ? 'none' : 'flex'}}>
                        <FaCar className="text-xl" />
                      </div>
                    </div>
                    
                    {/* Vehicle Name */}
                    <div className="flex-1 ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {vehicle.name || vehicle.make || 'Unnamed Vehicle'} {vehicle.model ? vehicle.model : ''}
                      </h3>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Edit button clicked for vehicle:', vehicle.id, vehicle.category);
                          if (!vehicle.category || !vehicle.id) {
                            toast.error('Missing vehicle information');
                            return;
                          }
                          const cat = encodeURIComponent(vehicle.category);
                          const vid = encodeURIComponent(vehicle.id);
                          const editUrl = `/admin-panel/vehicles/edit/${cat}/${vid}`;
                          console.log('Navigating to:', editUrl);
                          navigate(editUrl);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        title="Edit Vehicle"
                      >
                        <FaEdit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Delete button clicked for vehicle:', vehicle.id);
                          if (!vehicle.id || !vehicle.category) {
                            toast.error('Missing vehicle information');
                            return;
                          }
                          handleDelete(vehicle);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        title="Delete Vehicle"
                      >
                        <FaTrash className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <FaCar className="mx-auto text-4xl text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 font-semibold">No vehicles found</p>
                <p className="text-gray-400 text-xs mt-1">Try adjusting your search filters</p>
              </div>
            )}
          </section>
        )}
        
        {/* Notifications */}
        <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnHover />
      </div>
    </div>
  );
};

export default VehicleManager;