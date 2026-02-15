import { Greeting } from "@/components/dashboard/Greeting";
import { MonthSummary } from "@/components/dashboard/MonthSummary";
import { Whispers } from "@/components/dashboard/Whispers";

const HomePage = () => {
  return (
    <div className="p-6 space-y-8">
      <Greeting />
      
      <div className="bg-[#141821] rounded-[2.5rem] p-8 border border-gray-800 shadow-2xl">
        <MonthSummary />
      </div>

      <div className="bg-[#141821] rounded-[2.5rem] p-8 border border-gray-800 shadow-2xl">
        <Whispers />
      </div>
    </div>
  );
};

export default HomePage;