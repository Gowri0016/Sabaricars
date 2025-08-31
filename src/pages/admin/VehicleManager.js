import React, { useState, useEffect, useCallback } from 'react';
import { db, storage } from '../../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, collectionGroup } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaCar, FaSpinner, FaEye } from 'react-icons/fa';

// Modal component for viewing and editing vehicle details
const VehicleDetailsModal = ({ vehicle, onClose, onSave, isEditing, onToggleEdit, editForm, setEditForm }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Edit Vehicle' : 'Vehicle Details'}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Close modal">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="space-y-6">
          {vehicle.images?.[0] && (
            <div className="flex justify-center">
              <img src={vehicle.images[0]} alt={vehicle.name} className="rounded-lg max-h-60 object-cover w-full" />
            </div>
          )}

          {isEditing ? (
            <form onSubmit={onSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Vehicle Name" className="p-3 border rounded-lg" value={editForm.name} onChange={handleInputChange} required />
              <input type="number" name="price" placeholder="Price (₹)" className="p-3 border rounded-lg" value={editForm.price} onChange={handleInputChange} required />
              <input type="number" name="year" placeholder="Year" className="p-3 border rounded-lg" value={editForm.year} onChange={handleInputChange} />
              <input type="text" name="odometer" placeholder="Odometer (km)" className="p-3 border rounded-lg" value={editForm.odometer} onChange={handleInputChange} />
              <select name="fuelType" className="p-3 border rounded-lg" value={editForm.fuelType} onChange={handleInputChange}>
                <option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option>
              </select>
              <select name="transmission" className="p-3 border rounded-lg" value={editForm.transmission} onChange={handleInputChange}>
                <option>Manual</option><option>Automatic</option>
              </select>
              <input type="text" name="owners" placeholder="Owners" className="p-3 border rounded-lg" value={editForm.owners} onChange={handleInputChange} />
              <input type="text" name="registration" placeholder="Registration" className="p-3 border rounded-lg" value={editForm.registration} onChange={handleInputChange} />
              <textarea name="description" placeholder="Description" rows="4" className="col-span-1 sm:col-span-2 p-3 border rounded-lg" value={editForm.description} onChange={handleInputChange} />

              <div className="col-span-1 sm:col-span-2 flex gap-4 mt-4">
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  <FaSave /> Save Changes
                </button>
                <button type="button" onClick={onToggleEdit} className="flex-1 flex items-center justify-center gap-2 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors">
                  <FaTimes /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p><strong className="font-semibold text-gray-700">Name:</strong> {vehicle.name}</p>
              <p><strong className="font-semibold text-gray-700">Price:</strong> ₹{parseInt(vehicle.price).toLocaleString('en-IN')}</p>
              <p><strong className="font-semibold text-gray-700">Year:</strong> {vehicle.year}</p>
              <p><strong className="font-semibold text-gray-700">Odometer:</strong> {vehicle.odometer} km</p>
              <p><strong className="font-semibold text-gray-700">Fuel Type:</strong> {vehicle.fuelType}</p>
              <p><strong className="font-semibold text-gray-700">Transmission:</strong> {vehicle.transmission}</p>
              <p><strong className="font-semibold text-gray-700">Owners:</strong> {vehicle.owners}</p>
              <p><strong className="font-semibold text-gray-700">Registration:</strong> {vehicle.registration}</p>
              <p><strong className="font-semibold text-gray-700">Description:</strong> {vehicle.description}</p>

              <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
                <button onClick={onToggleEdit} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  <FaEdit /> Edit
                </button>
                <button onClick={onClose} className="flex-1 flex items-center justify-center gap-2 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors">
                  <FaTimes /> Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main component with a cleaner, simplified view
const VehicleManager = () => {
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalVehicle, setModalVehicle] = useState(null);
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [editForm, setEditForm] = useState({});

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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!modalVehicle) return;

    try {
      const vehicleRef = doc(db, 'categories', modalVehicle.category, 'vehicles', modalVehicle.id);
      await updateDoc(vehicleRef, { ...editForm, updatedAt: new Date().toISOString() });

      setVehicles(prevVehicles => prevVehicles.map(v => (v.id === modalVehicle.id ? { ...v, ...editForm } : v)));
      toast.success('Vehicle updated successfully!');
      setModalVehicle({ ...modalVehicle, ...editForm }); // Update modal content
      setIsEditingModal(false);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle');
    }
  };

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
      
      // Close the modal if it's open for the deleted vehicle
      if (modalVehicle && modalVehicle.id === vehicle.id) {
        setModalVehicle(null);
      }
      
      toast.success('Vehicle and all associated images deleted successfully!');
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast.error(`Failed to delete vehicle: ${error.message}`);
    }
  };

  const openModal = (vehicle) => {
    setModalVehicle(vehicle);
    setIsEditingModal(false);
    setEditForm(vehicle);
  };

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
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <FaCar className="text-blue-600" />
            Vehicle Inventory
          </h1>
          <p className="text-gray-500 mt-2">Manage your vehicle listings with a clean, concise view.</p>
        </header>

        <section className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, Reg. no..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </section>

        {isLoading ? (
          <div className="text-center p-12 flex flex-col items-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
            <p className="text-gray-600">Loading vehicles...</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <article key={vehicle.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                  <div className="relative h-52 bg-gray-200">
                    {vehicle.images?.[0] ? (
                      <img src={vehicle.images[0]} alt={vehicle.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <FaCar className="text-5xl" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">{vehicle.category || 'N/A'}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{vehicle.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">{vehicle.year} • {vehicle.odometer} km</p>
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                      <span className="text-2xl font-extrabold text-blue-700">₹{parseInt(vehicle.price).toLocaleString('en-IN')}</span>
                      <div className="flex gap-2">
                        <button onClick={() => openModal(vehicle)} className="p-3 text-blue-600 rounded-full hover:bg-blue-100 transition-colors" title="View Details"><FaEye /></button>
                        <button onClick={() => handleDelete(vehicle)} className="p-3 text-red-600 rounded-full hover:bg-red-100 transition-colors" title="Delete vehicle"><FaTrash /></button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-xl shadow-lg p-10 text-center">
                <FaCar className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-xl text-gray-500 font-semibold">No vehicles found</p>
                <p className="text-gray-400 mt-2">Try adjusting your search filters.</p>
              </div>
            )}
          </section>
        )}

        {modalVehicle && (
          <VehicleDetailsModal
            vehicle={modalVehicle}
            onClose={() => setModalVehicle(null)}
            onSave={handleSave}
            isEditing={isEditingModal}
            onToggleEdit={() => setIsEditingModal(!isEditingModal)}
            editForm={editForm}
            setEditForm={setEditForm}
          />
        )}
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnHover />
      </div>
    </div>
  );
};

export default VehicleManager;