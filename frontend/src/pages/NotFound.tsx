// pages/NotFound.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Graphic */}
        <div className="relative mb-8">
          <div className="text-9xl font-bold text-primary/20">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-bold text-foreground">Page Not Found</div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold mb-4">Oops! Lost in Space?</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for seems to have drifted off into the digital 
          cosmos. Don't worry, we'll help you get back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button 
            onClick={() => navigate("/dashboard")} 
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Optional: Search or additional help */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Can't find what you're looking for?
          </p>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard/support")}
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;