import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center space-y-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
        <p className="text-muted-foreground max-w-[500px]">
             {error.message || "An unexpected error occurred. Please try again."}
        </p>
      </div>
      <Button onClick={resetErrorBoundary} variant="default" size="lg">
        Try again
      </Button>
    </div>
  );
};
