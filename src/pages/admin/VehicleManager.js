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
    if (!window.confirm(`Are you sure you want to delete ${vehicle.name}?`)) return;

    try {
      // Delete images from storage if they exist
      if (vehicle.images?.length > 0) {
        console.log('Deleting images for vehicle:', vehicle.id);
        
        await Promise.all(vehicle.images.map(async (imageUrl) => {
          try {
            console.log('Processing image URL:', imageUrl);
            
            // Handle both full URLs and storage paths
            let path = imageUrl;
            
            // If it's a Firebase Storage URL (check for both domains)
            if (imageUrl.includes('firebasestorage.googleapis.com') || imageUrl.includes('firebasestorage.app')) {
              const pathStart = imageUrl.indexOf('/o/') + 3;
              const pathEnd = imageUrl.indexOf('?');
              if (pathStart > 2 && pathEnd > pathStart) {
                path = decodeURIComponent(
                  imageUrl
                    .substring(pathStart, pathEnd)
                    .replace(/%2F/g, '/')
                );
              }
            }
            
            console.log('Deleting image with path:', path);
            const imageRef = ref(storage, path);
            await deleteObject(imageRef);
            console.log('Successfully deleted image:', path);
          } catch (imgError) {
            console.error('Error deleting image:', imgError);
            // Continue with other operations even if image deletion fails
          }
        }));
      }

      // Delete the document from Firestore
      console.log('Deleting Firestore document for vehicle:', vehicle.id);
      const vehicleRef = doc(db, 'categories', vehicle.category, 'vehicles', vehicle.id);
      await deleteDoc(vehicleRef);
      console.log('Successfully deleted Firestore document');

      // Update the local state to remove the deleted vehicle
      setVehicles(prevVehicles => {
        const updatedVehicles = prevVehicles.filter(v => v.id !== vehicle.id);
        console.log('Updated vehicles list:', updatedVehicles);
        return updatedVehicles;
      });
      
      // No modal to close as we navigate to edit page for details
      
      toast.success('Vehicle and all associated images deleted successfully!');
    } catch (error) {
      console.error('Error in handleDelete:', error);
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
      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        {/* Page Header */}
        <header className="py-3">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FaCar className="text-blue-600" />
            Manage Vehicles
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">Clean and mobile-friendly inventory management</p>
        </header>

        {/* Sticky Tools Bar - Single Dropdown */}
        <section className="sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border border-gray-200 rounded-xl shadow-sm p-3 mb-3">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Select Vehicle</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 focus:ring-1 focus:ring-blue-500 bg-white"
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
            >
              <option value="all">All vehicles</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.name || 'Untitled'} {v.registration ? `• ${v.registration}` : ''}</option>
              ))}
            </select>
          </div>
        </section>

        {isLoading ? (
          <div className="text-center p-10 flex flex-col items-center">
            <FaSpinner className="animate-spin text-2xl text-blue-600 mb-2" />
            <p className="text-gray-600 text-xs">Loading vehicles...</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-3 sm:gap-4 vehicle-list">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <article 
                  key={vehicle.id} 
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                  onClick={() => {
                    const cat = encodeURIComponent(vehicle.category || '');
                    const vid = encodeURIComponent(vehicle.id || '');
                    if (!cat || !vid) {
                      toast.error('Missing vehicle identifier');
                      return;
                    }
                    navigate(`/admin-panel/vehicles/edit/${cat}/${vid}`);
                  }}
                >
                  {/* Chat-style row */}
                  <div className="flex items-center p-3 hover:bg-gray-50 gap-3 vehicle-row">
                    {/* Avatar */}
                    <div
                      className="flex-none shrink-0 rounded-full overflow-hidden bg-gray-100 border border-gray-200"
                      style={{ width: 40, height: 40 }}
                    >
                      {vehicle.images?.[0] ? (
                        <img 
                          src={vehicle.images[0]} 
                          alt={vehicle.name}
                          className="vehicle-avatar block rounded-full object-cover object-center"
                          style={{ width: 40, height: 40 }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '';
                            e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                          <FaCar className="text-base md:text-lg" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content (chat-style) */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="text-[13px] font-semibold text-gray-900 truncate">{vehicle.name}</h3>
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                              {vehicle.category || 'N/A'}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-600 mt-1 truncate">
                            {vehicle.registration || 'No registration'} • {vehicle.fuelType || '—'} • {vehicle.transmission || '—'}
                          </div>
                        </div>
                        <div className="text-[12px] font-semibold text-blue-700 whitespace-nowrap">₹{parseInt(vehicle.price || 0).toLocaleString('en-IN')}</div>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-gray-500 mt-1">
                        <span>Year: <strong className="text-gray-700">{vehicle.year || 'N/A'}</strong></span>
                        <span>KM: <strong className="text-gray-700">{vehicle.odometer ? vehicle.odometer.toLocaleString('en-IN') : 'N/A'}</strong></span>
                      </div>
                    </div>
                  </div>
                  {/* Footer actions under the row */}
                  <div className="flex justify-end items-center gap-2 px-3 pb-3 pt-2 border-t border-gray-100 bg-white/60">
                    <Link 
                      to={`/admin-panel/vehicles/edit/${encodeURIComponent(vehicle.category || '')}/${encodeURIComponent(vehicle.id || '')}`}
                      className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all flex items-center gap-1 shadow-sm"
                      role="button"
                      aria-label={`Edit ${vehicle.name}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaEdit className="text-xs" /> Edit
                    </Link>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(vehicle);
                      }}
                      className="px-2.5 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors flex items-center gap-1 border border-red-100"
                      title="Delete"
                      aria-label={`Delete ${vehicle.name}`}
                    >
                      <FaTrash className="text-sm" /> Delete
                    </button>
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