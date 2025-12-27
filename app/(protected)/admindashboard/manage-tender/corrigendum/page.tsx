import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function CorrigendumPage() {
  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-2xl font-bold text-slate-800">
            Tender Corrigendum
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-slate-700 mb-4">
            This is a placeholder for managing tender corrigenda. Add forms and listings here.
          </p>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/admindashboard/manage-tender/open">Back to Active Tenders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

