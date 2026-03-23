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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfile({ ...profile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 sm:p-8 text-white min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0b1220" }}>
      <div className="relative w-full max-w-md bg-[#131f33] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl p-8">


        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full border-4 border-gray-700 overflow-hidden mb-4">
            <img
              src={profile.avatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {isEditing && (
            <div className="w-full bg-[#0b1220] border border-gray-800 rounded p-2 flex justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>
          )}
        </div>


        <div className="space-y-3 text-sm">
          {[
            { label: "Nom complet", name: "fullName" },
            { label: "Pseudo", name: "username" },
            { label: "Email", name: "email" },
            { label: "Téléphone", name: "phone" },
            { label: "Pays", name: "country" },
            { label: "Bio", name: "bio", italic: true },
          ].map((field) => (
            <div
              key={field.name}
              className="flex justify-between items-center p-3 rounded-lg bg-[#0b1220] border border-gray-800"
            >
              <span className="text-gray-400 font-medium">{field.label}</span>
              {isEditing ? (
                <input
                  type="text"
                  name={field.name}
                  value={profile[field.name as keyof typeof profile]}
                  onChange={handleChange}
                  className={`ml-2 text-right p-1 rounded bg-[#131f33] border border-gray-700 w-48 text-white outline-none focus:border-blue-500`}
                />
              ) : (
                <span className={`ml-2 text-right font-medium text-white ${field.italic ? "italic text-gray-300" : ""}`}>
                  {profile[field.name as keyof typeof profile]}
                </span>
              )}
            </div>
          ))}
        </div>


        <button
          onClick={() => setIsEditing(!isEditing)}
          className="w-full mt-8 py-3 bg-blue-600 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-white"
        >
          <Edit3 size={18} />
          {isEditing ? "Enregistrer" : "Modifier"}
        </button>
      </div>
    </div>
  );
};

export default Profile;