import { useState } from "react";
import { Edit3 } from "lucide-react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "Alice Crypto",
    username: "alice123",
    email: "alice@cryptoapp.com",
    phone: "+33 6 12 34 56 78",
    country: "France",
    bio: "Trader crypto passionnée",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
  });

  // Modifier les champs texte
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Modifier l'image depuis l'ordinateur
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfile({ ...profile, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b13] flex items-center justify-center p-4 font-sans text-black">
      <div className="relative w-full max-w-md bg-[#080b13] border border-gray-300 rounded-3xl overflow-hidden shadow-2xl p-8">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full border-4 border-gray-400 overflow-hidden mb-4">
            <img
              src={profile.avatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Rectangle blanc pour uploader l'image */}
          {isEditing && (
            <div className="w-full bg-white rounded p-2 flex justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-black"
              />
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="space-y-4 text-sm">
          {[
            { label: "Full Name", name: "fullName" },
            { label: "Username", name: "username" },
            { label: "Email", name: "email" },
            { label: "Phone", name: "phone" },
            { label: "Country", name: "country" },
            { label: "Bio", name: "bio", italic: true },
          ].map((field) => (
            <div
              key={field.name}
              className="flex justify-between items-center p-2 rounded bg-white"
            >
              <span className="text-gray-700 font-medium">{field.label}</span>
              {isEditing ? (
                <input
                  type="text"
                  name={field.name}
                  value={profile[field.name]}
                  onChange={handleChange}
                  className={`ml-2 text-right p-1 rounded w-48 ${
                    field.italic ? "italic text-gray-700" : "text-black"
                  }`}
                />
              ) : (
                <span
                  className={`ml-2 text-right font-medium ${
                    field.italic ? "italic text-gray-700" : ""
                  }`}
                >
                  {profile[field.name]}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Bouton Edit */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="w-full mt-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2 text-white"
        >
          <Edit3 size={18} />
          {isEditing ? "Save Profile" : "Edit Profile"}
        </button>
      </div>
    </div>
  );
};

export default Profile;