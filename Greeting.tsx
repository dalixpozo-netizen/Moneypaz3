import { useProfile } from "@/hooks/use-profile";

export const Greeting = () => {
  const { profile } = useProfile();
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
        Buenas tardes, {profile?.full_name || 'David'} <span className="animate-pulse">✨</span>
      </h1>
      <p className="text-gray-400 italic mt-1">Todo okey makei</p>
    </div>
  );
};