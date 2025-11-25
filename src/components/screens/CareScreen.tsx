/**
 * Placeholder Care Screen component.
 * Will be expanded in Milestone 1.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStateReadOnly } from "@/game/hooks/useGameState";

/**
 * Main care screen showing pet status and care actions.
 */
export function CareScreen() {
  const { state, isLoading } = useGameStateReadOnly();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!state?.pet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Digital Pets!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You don't have a pet yet. The pet creation feature will be available
            in the next milestone.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Screen</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Pet care interface will be implemented in Milestone 1.
        </p>
      </CardContent>
    </Card>
  );
}
