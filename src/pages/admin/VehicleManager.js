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
    return vehicles.filter(vehicle => {
      const matchesSearch = ['name', 'registration', 'description'].some(field =>
        vehicle[field]?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesCategory = selectedCategory === 'all' || vehicle.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [vehicles, searchTerm, selectedCategory]);

  return (
    <div className="bg-gray-100 min-h-screen p-3 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaCar className="text-blue-600" />
            Vehicle Inventory
          </h1>
          <p className="text-gray-500 text-xs mt-1">Manage your vehicle listings</p>
        </header>

        <section className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search vehicles..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
              aria-label="Toggle filters"
            >
              <FaFilter className="text-sm" />
            </button>
          </div>
          
          {showFilters && (
            <div className="mt-2 pt-3 border-t border-gray-100">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 focus:ring-1 focus:ring-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}
        </section>

        {isLoading ? (
          <div className="text-center p-8 flex flex-col items-center">
            <FaSpinner className="animate-spin text-2xl text-blue-600 mb-2" />
            <p className="text-gray-600 text-xs">Loading vehicles...</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-3">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <article 
                  key={vehicle.id} 
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
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
                  <div className="flex h-20 md:h-24 p-3 hover:bg-gray-50">
                    {/* Image container */}
                    <div className="w-20 md:w-24 h-full flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      {vehicle.images?.[0] ? (
                        <img 
                          src={vehicle.images[0]} 
                          alt={vehicle.name}
                          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '';
                            e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-300">
                          <FaCar className="text-2xl" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pl-4 flex flex-col justify-between overflow-hidden">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 pr-2">{vehicle.name}</h3>
                          <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                            {vehicle.category || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                          <div className="flex items-center">
                            <span className="text-gray-500 w-10 inline-block">Year:</span>
                            <span className="font-medium">{vehicle.year || 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 w-12 inline-block">KM:</span>
                            <span className="font-medium">{vehicle.odometer ? vehicle.odometer.toLocaleString('en-IN') : 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 w-10 inline-block">Fuel:</span>
                            <span className="font-medium">{vehicle.fuelType || 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 w-12 inline-block">Trans:</span>
                            <span className="font-medium">{vehicle.transmission || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                        <span className="text-sm font-bold text-blue-700">₹{parseInt(vehicle.price || 0).toLocaleString('en-IN')}</span>
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/admin-panel/vehicles/edit/${encodeURIComponent(vehicle.category || '')}/${encodeURIComponent(vehicle.id || '')}`}
                            className="px-2.5 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all flex items-center gap-1 border border-blue-100"
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
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                            aria-label={`Delete ${vehicle.name}`}
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </div>
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
        
        {/* Modal removed: editing is done on the dedicated edit page */}
        <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnHover />
      </div>
    </div>
  );
};

export default VehicleManager;