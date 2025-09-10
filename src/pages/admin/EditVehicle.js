import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaSave, FaTrash, FaSpinner, FaCar } from 'react-icons/fa';

const EditVehicle = () => {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [vehicle, setVehicle] = useState({
    name: '',
    price: '',
    year: '',
    odometer: '',
    fuelType: 'Petrol',
    transmission: 'Manual',
    owners: '',
    registration: '',
    description: '',
    images: []
  });

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        // Use vehicleDetails path directly based on your Firestore structure
        const docRef = doc(db, 'vehicleDetails', category, 'vehicles', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setVehicle({
            id: docSnap.id,
            category,
            ...docSnap.data(),
            price: docSnap.data().price?.toString() || '',
            year: docSnap.data().year?.toString() || '',
            odometer: docSnap.data().odometer?.toString() || ''
          });
        } else {
          toast.error('Vehicle not found');
          navigate('/admin-panel/vehicles');
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error);
        toast.error('Failed to load vehicle details');
        navigate('/admin-panel/vehicles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicle();
  }, [category, id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicle(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `vehicles/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setVehicle(prev => ({
        ...prev,
        images: [...(prev.images || []), downloadURL]
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (index, imageUrl) => {
    try {
      // Remove from UI first for better UX
      setVehicle(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));

      // Try to delete from storage
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.warn('Failed to delete image from storage:', error);
        // Continue even if storage deletion fails
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
      // Refresh the vehicle data to restore the image
      const docRef = doc(db, 'vehicleDetails', category, 'vehicles', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVehicle(prev => ({
          ...prev,
          images: docSnap.data().images || []
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const vehicleData = {
        ...vehicle,
        price: vehicle.price,
        year: vehicle.year,
        odometer: vehicle.odometer,
        updatedAt: new Date().toISOString()
      };

      // Update using the correct vehicleDetails path
      const vehicleRef = doc(db, 'vehicleDetails', category, 'vehicles', id);
      await updateDoc(vehicleRef, vehicleData);
      
      toast.success('Vehicle updated successfully');
      navigate('/admin-panel/vehicles');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Vehicles
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Vehicle</h1>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Left Column - Images */}
                <div className="sm:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Images</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {vehicle.images?.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`${vehicle.name} ${index + 1}`}
                            className="w-full h-64 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                            onClick={() => window.open(img, '_blank')}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, img)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
                            aria-label="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {vehicle.images?.length < 10 && (
                        <label className="h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                          />
                          {isUploading ? (
                            <FaSpinner className="animate-spin text-gray-400 text-xl" />
                          ) : (
                            <div className="text-center p-2">
                              <svg
                                className="mx-auto h-8 w-8 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="block text-xs text-gray-500 mt-1">Add Image</span>
                            </div>
                          )}
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Form Fields */}
                <div className="sm:col-span-4 space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Vehicle Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={vehicle.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        value={vehicle.price}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                        Year
                      </label>
                      <input
                        type="number"
                        name="year"
                        id="year"
                        value={vehicle.year}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="odometer" className="block text-sm font-medium text-gray-700">
                        Odometer (km)
                      </label>
                      <input
                        type="number"
                        name="odometer"
                        id="odometer"
                        value={vehicle.odometer}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">
                        Fuel Type
                      </label>
                      <select
                        id="fuelType"
                        name="fuelType"
                        value={vehicle.fuelType}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option>Petrol</option>
                        <option>Diesel</option>
                        <option>CNG</option>
                        <option>Electric</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">
                        Transmission
                      </label>
                      <select
                        id="transmission"
                        name="transmission"
                        value={vehicle.transmission}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option>Manual</option>
                        <option>Automatic</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="owners" className="block text-sm font-medium text-gray-700">
                        Owners
                      </label>
                      <input
                        type="text"
                        name="owners"
                        id="owners"
                        value={vehicle.owners}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="registration" className="block text-sm font-medium text-gray-700">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        name="registration"
                        id="registration"
                        value={vehicle.registration}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={vehicle.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaSave className="-ml-1 mr-2 h-4 w-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default EditVehicle;
