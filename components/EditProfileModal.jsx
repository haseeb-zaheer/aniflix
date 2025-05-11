import { useState } from 'react';
import axios from 'axios';

export default function EditProfileModal({ currentDescription, onSave, onClose }) {
  const [description, setDescription] = useState(currentDescription || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [currentUploadType, setCurrentUploadType] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.elements.file.files[0];
    if (!file) return;

    try {
      const sigRes = await axios.post('/api/cloudinary');
      const { signature, timestamp, folder, apiKey, cloudName } = sigRes.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        formData
      );

      const imageUrl = uploadRes.data.secure_url;

      if (currentUploadType === 'profile') {
        setProfilePictureUrl(imageUrl);
      } else if (currentUploadType === 'banner') {
        setBannerImageUrl(imageUrl);
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleSave = () => {
    const payload = { description: description.trim() };
  
    if (profilePictureUrl) {
      payload.profilePictureUrl = profilePictureUrl;
    }
  
    if (bannerImageUrl) {
      payload.bannerImageUrl = bannerImageUrl;
    }
  
    onSave(payload);
    onClose();
  };
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#1c1c1c] p-6 rounded-lg w-full max-w-md text-white relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-3 text-gray-300 hover:text-white text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="mb-6 mt-6">
          <h2 className="text-xl font-semibold mb-2">Upload Profile Picture</h2>
          <form
            onSubmit={(e) => {
              handleUpload(e);
            }}
            className="flex flex-col gap-2"
          >
            <input
              type="file"
              name="file"
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0 file:text-sm file:font-semibold
                file:bg-netflix-red file:text-white hover:file:bg-red-700"
              required
              onClick={() => setCurrentUploadType('profile')}
            />
            <button
              type="submit"
              className="bg-netflix-red hover:bg-red-700 text-white py-2 rounded font-medium"
            >
              Upload Profile
            </button>
          </form>

          {profilePictureUrl && (
            <div className="mt-4 text-sm text-gray-300">
              <p className="mb-2">Preview:</p>
              <img
                src={profilePictureUrl}
                alt="Profile Preview"
                className="w-full max-h-40 object-cover rounded border border-gray-700"
              />
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Upload Banner Image</h2>
          <form
            onSubmit={(e) => {
              handleUpload(e);
            }}
            className="flex flex-col gap-2"
          >
            <input
              type="file"
              name="file"
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0 file:text-sm file:font-semibold
                file:bg-netflix-red file:text-white hover:file:bg-red-700"
              required
              onClick={() => setCurrentUploadType('banner')}
            />
            <button
              type="submit"
              className="bg-netflix-red hover:bg-red-700 text-white py-2 rounded font-medium"
            >
              Upload Banner
            </button>
          </form>

          {bannerImageUrl && (
            <div className="mt-4 text-sm text-gray-300">
              <p className="mb-2">Preview:</p>
              <img
                src={bannerImageUrl}
                alt="Banner Preview"
                className="w-full max-h-40 object-cover rounded border border-gray-700"
              />
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-2">Edit Description</h2>
        <textarea
          className="w-full h-32 p-3 rounded bg-gray-800 text-white resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleSave}
          className="mt-4 bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
