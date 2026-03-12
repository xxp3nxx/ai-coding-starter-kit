import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CentreDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Centre Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your fitness centre, trainers, and classes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trainers</CardTitle>
            <CardDescription>Manage your team of trainers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">
                No trainers invited yet
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Classes</CardTitle>
            <CardDescription>All classes at your centre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">No classes yet</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invitations</CardTitle>
            <CardDescription>Pending trainer invitations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">
                No pending invitations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
