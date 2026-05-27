import PatientList from "@/components/dashboard/PatientList";
import CalendarWidget from "@/components/dashboard/CalendarWidget";

export default function WelcomeDashboardPage() {
  return (
    <div className="flex flex-col h-full gap-8">
      <div className="flex flex-row gap-6 w-full items-start">
        <div className="flex-1">
          <PatientList />
        </div>
        <div className="shrink-0">
          <CalendarWidget />
        </div>
      </div>
    </div>
  );
}
