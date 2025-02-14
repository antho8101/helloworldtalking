
import React, { useEffect, useState } from "react";
import { CommunityTitle } from "./CommunityTitle";
import { ProfilesGrid } from "./ProfilesGrid";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/data/staticProfiles";
import { toast } from "sonner";

export const CommunityGrid: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      console.log("Fetching profiles...");
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, age, location, city, country, image, avatar_url, gender");

      if (error) {
        console.error("Error fetching profiles:", error);
        toast.error("Error loading community profiles");
        return;
      }

      console.log("Profiles data:", data);

      if (data) {
        const mappedProfiles = data.map(profile => ({
          id: profile.id,
          image: profile.avatar_url || profile.image || `https://i.pravatar.cc/150?u=${profile.id}`,
          name: profile.name || "Anonymous",
          age: profile.age || 25,
          location: profile.city && profile.country ? `${profile.city}, ${profile.country}` : profile.location || "Unknown",
          gender: "female" as const,
          messages: 0,
          isOnline: false
        }));
        console.log("Mapped profiles:", mappedProfiles);
        setProfiles(mappedProfiles);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <section className="bg-white flex w-full flex-col items-stretch px-[220px] py-20 max-md:px-5">
        <CommunityTitle memberCount={0} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6153BD]"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white flex w-full flex-col items-stretch px-[220px] py-20 max-md:px-5">
      <CommunityTitle memberCount={profiles.length} />
      <ProfilesGrid profiles={profiles} />
    </section>
  );
};
