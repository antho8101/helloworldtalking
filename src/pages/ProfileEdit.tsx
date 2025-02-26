
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/layout/Footer";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { toast } from "sonner";
import type { ProfileData } from "@/types/profile";
import type { Json } from "@/integrations/supabase/types";
import type { LanguageWithLevel } from "@/components/LanguageSelector";

export const ProfileEdit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setUserId(session.user.id);
      fetchProfile(session.user.id);
    };

    checkUser();
  }, [navigate]);

  const fetchProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("Profile not found");
        return;
      }

      // Transform the data to match ProfileData type
      const languageLevels = Array.isArray(data.language_levels) 
        ? (data.language_levels as any[]).map(lang => ({
            language: typeof lang.language === 'string' ? lang.language : '',
            level: typeof lang.level === 'string' ? lang.level : 'beginner'
          }))
        : [];

      const profileData: ProfileData = {
        username: data.username || "",
        name: data.name || "",
        age: data.age || 0,
        avatar_url: data.avatar_url || "",
        native_languages: Array.isArray(data.native_languages) 
          ? data.native_languages.map(lang => ({ language: lang }))
          : [],
        learning_languages: Array.isArray(data.language_levels) 
          ? (data.language_levels as any[]).map(lang => ({
              language: typeof lang.language === 'string' ? lang.language : '',
              level: typeof lang.level === 'string' ? lang.level : 'beginner'
            }))
          : [],
        country: data.country || "",
        city: data.city || "",
        bio: data.bio || "",
        gender: data.gender || "",
        interested_in: data.interested_in || [],
        looking_for: data.looking_for || [],
        language_levels: languageLevels,
        is_suspended: data.is_suspended || false,
        is_banned: data.is_banned || false,
        suspension_end_timestamp: data.suspension_end_timestamp || null,
      };

      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCity = async (search: string) => {
    setCitySearch(search);
    if (search.length > 2 && profile?.country) {
      try {
        const { data: secretData, error: secretError } = await supabase
          .from('secrets')
          .select('value')
          .eq('name', 'API_NINJAS_KEY')
          .maybeSingle();

        if (secretError) throw secretError;
        if (!secretData) {
          console.error('API key not found');
          setCities([
            `${search} City`,
            `${search} Town`,
            `New ${search}`,
            `${search}ville`,
          ].map(city => `${city}, ${profile.country}`));
          return;
        }

        const response = await fetch(
          `https://api.api-ninjas.com/v1/city?name=${search}&country=${profile.country}&limit=5`,
          {
            headers: {
              'X-Api-Key': secretData.value
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }
        
        const data = await response.json();
        setCities(data.map((city: any) => city.name));
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities([
          `${search} City`,
          `${search} Town`,
          `New ${search}`,
          `${search}ville`,
        ].map(city => `${city}, ${profile.country}`));
      }
    } else {
      setCities([]);
    }
  };

  const handleProfileUpdate = async (updates: Partial<ProfileData>) => {
    try {
      // Transform the updates to match the database schema
      const dbUpdates: any = {
        ...updates,
        native_languages: updates.native_languages?.map(lang => lang.language),
        language_levels: updates.learning_languages || [],
      };

      const { error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("id", userId);

      if (error) throw error;

      toast.success("Profile updated successfully");
      navigate(`/profile/${userId}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <main className="min-h-screen">
      <div className="bg-[rgba(255,243,240,1)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[80%] mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-black text-[#6153BD] mb-8">Edit your profile</h1>
          
          <ProfileForm
            userId={userId || ""}
            profile={profile}
            citySearch={citySearch}
            cities={cities}
            onProfileChange={handleProfileUpdate}
            onCitySearch={handleSearchCity}
            onCitySelect={(city) => {
              handleProfileUpdate({ city });
              setCitySearch(city);
              setCities([]);
            }}
            onSubmit={() => navigate(`/profile/${userId}`)}
          />
        </div>
      </div>
      <Footer />
    </main>
  );
};
