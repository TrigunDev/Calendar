import WallCalendar from "@/components/WallCalendar";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex items-center justify-center p-4 md:p-8 transition-colors duration-500">
      <ThemeToggle />
      <WallCalendar />
    </main>
  );
};

export default Index;
