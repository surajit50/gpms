"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CorrectionRequestReview from "./correction-request-review";
import CorrectionRequestForm from "./correction-request-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, User, FileText, Users, Calendar, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/utils/utils";
import { Separator } from "@/components/ui/separator";

export default function EnhancedCorrectionSearch({
  initialRequests,
  initialApp,
}: {
  initialRequests: any[];
  initialApp: any;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [app, setApp] = useState(initialApp);
  const [requests, setRequests] = useState(initialRequests);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any[]>([]);

  // Initialize with props
  useEffect(() => {
    if (initialApp) {
      setApp(initialApp);
      setDetails(initialApp.details || []);
    }
    if (initialRequests) {
      setRequests(initialRequests);
    }
  }, [initialApp, initialRequests]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setRequests([]);
    setApp(null);
    setDetails([]);

    try {
      const res = await fetch(`/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchQuery }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch application");
      }

      const foundApp = data?.app || data;
      if (!foundApp?.id) {
        throw new Error("No application found for this query");
      }

      // Navigate to the dedicated correction page for better handling
      router.push(`/employeedashboard/warish/apply-correction/${foundApp.id}`);

      // Fallback local state update (in case navigation is blocked)
      setApp(foundApp);
      setDetails([]);
      await fetchRequests(foundApp.id);
    } catch (err: any) {
      setError(err.message || "An error occurred while searching");
    } finally {
      setLoading(false);
    }
  }

  async function fetchRequests(warishApplicationId: string) {
    try {
      const reqRes = await fetch(
        `/api/warish-correction-requests?warishApplicationId=${warishApplicationId}`
      );

      console.log(reqRes);
      if (!reqRes.ok) {
        throw new Error("Failed to fetch correction requests");
      }

      const reqData = await reqRes.json();
      setRequests(reqData.requests || []);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    }
  }

  const handleRequestReviewed = () => {
    if (app) {
      fetchRequests(app.id);
    }
  };

  const handleRequestSubmitted = () => {
    if (app) {
      fetchRequests(app.id);
    }
  };

  // Define available fields for correction
  const applicationFields = [
    {
      value: "applicantName",
      label: "Applicant Name",
      currentValue: app?.applicantName,
      icon: User,
    },
    {
      value: "applicantMobileNumber",
      label: "Mobile Number",
      currentValue: app?.applicantMobileNumber,
      icon: Phone,
    },
    {
      value: "relationwithdeceased",
      label: "Relation with Deceased",
      currentValue: app?.relationwithdeceased,
      icon: Users,
    },
    {
      value: "nameOfDeceased",
      label: "Name of Deceased",
      currentValue: app?.nameOfDeceased,
      icon: User,
    },
    {
      value: "fatherName",
      label: "Father Name",
      currentValue: app?.fatherName,
      icon: User,
    },
    {
      value: "spouseName",
      label: "Spouse Name",
      currentValue: app?.spouseName,
      icon: User,
    },
    {
      value: "villageName",
      label: "Village Name",
      currentValue: app?.villageName,
      icon: MapPin,
    },
    {
      value: "postOffice",
      label: "Post Office",
      currentValue: app?.postOffice,
      icon: MapPin,
    },
  ];

  // Detail fields for each heir
  const detailFields = (detail: any) => [
    {
      value: "name",
      label: "Heir Name",
      currentValue: detail?.name,
      icon: User,
    },
    {
      value: "gender",
      label: "Gender",
      currentValue: detail?.gender,
      icon: Users,
    },
    {
      value: "relation",
      label: "Relation",
      currentValue: detail?.relation,
      icon: Users,
    },
    {
      value: "livingStatus",
      label: "Living Status",
      currentValue: detail?.livingStatus,
      icon: User,
    },
    {
      value: "maritialStatus",
      label: "Marital Status",
      currentValue: detail?.maritialStatus,
      icon: Users,
    },
    {
      value: "hasbandName",
      label: "Husband Name",
      currentValue: detail?.hasbandName || "",
      icon: User,
    },
  ];

  function flattenDetails(details: any[]) {
    return details.reduce((acc, detail) => {
      acc.push(detail);
      if (detail.children && detail.children.length > 0) {
        acc.push(...flattenDetails(detail.children));
      }
      return acc;
    }, []);
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Search Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Search Warish Application
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Enter acknowledgement number, reference number, or applicant name to find applications
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4 items-end"
          >
            <div className="flex-1 w-full">
              <Label htmlFor="searchQuery" className="font-semibold text-gray-700 mb-2 block">
                Search Application
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="searchQuery"
                  type="text"
                  placeholder="Enter acknowledgement number, reference number, or applicant name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 py-2 h-11 border-gray-300 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 h-11 px-6"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Error:</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Card */}
      {app && (
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Application Details
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
                    ACK: {app.acknowlegment || "N/A"}
                  </Badge>
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    Ref: {app.warishRefNo || "N/A"}
                  </Badge>
                  <Badge variant="default" className={
                    app.status === "approved" ? "bg-green-100 text-green-800 border-green-200" :
                    app.status === "rejected" ? "bg-red-100 text-red-800 border-red-200" :
                    "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }>
                    Status: {app.status || "Pending"}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(app.createdAt) || "N/A"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <Label className="font-semibold text-gray-500 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Applicant Name
                </Label>
                <p className="font-medium text-gray-900">{app.applicantName}</p>
              </div>
              <div className="space-y-1">
                <Label className="font-semibold text-gray-500 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Mobile Number
                </Label>
                <p className="text-gray-900">{app.applicantMobileNumber}</p>
              </div>
              <div className="space-y-1">
                <Label className="font-semibold text-gray-500 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Deceased Person
                </Label>
                <p className="text-gray-900">{app.nameOfDeceased}</p>
              </div>
              <div className="space-y-1">
                <Label className="font-semibold text-gray-500 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Relation with Deceased
                </Label>
                <p className="text-gray-900">{app.relationwithdeceased}</p>
              </div>
              <div className="space-y-1">
                <Label className="font-semibold text-gray-500 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <p className="text-gray-900">
                  {app.villageName}, {app.postOffice}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="font-semibold text-gray-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Submission Date
                </Label>
                <p className="text-gray-900">{formatDate(app.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Correction Requests Section */}
      {app && (
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Correction Requests
            </CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              Request corrections for application details or warish information
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="application" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-4 pb-0">
                <TabsTrigger value="application" className="flex items-center gap-2 py-3">
                  <FileText className="h-4 w-4" />
                  Application Information
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-2 py-3">
                  <Users className="h-4 w-4" />
                  Warish Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="application" className="p-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800">Application Information</h3>
                      <p className="text-gray-600 mt-1">
                        Request corrections for applicant details, deceased information, and address fields.
                        All requests will be reviewed by administration.
                      </p>
                    </div>
                    <CorrectionRequestForm
                      warishApplicationId={app.id}
                      targetType="application"
                      availableFields={applicationFields}
                      onRequestSubmitted={handleRequestSubmitted}
                      requesterName={app.applicantName || ""}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="p-4">
                {details.length > 0 ? (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-800">Heir Information</h3>
                      <p className="text-gray-600 text-sm">
                        Request corrections for individual heir details. Select a heir to modify their information.
                      </p>
                    </div>
                    {details.map((detail, index) => (
                      <Card key={detail.id || index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-600" />
                                    {detail.name}
                                  </h4>
                                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {detail.gender} • {detail.relation}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {detail.livingStatus} • {detail.maritialStatus}
                                    </span>
                                  </div>
                                  {detail.hasbandName && (
                                    <p className="mt-2 text-sm text-gray-600">
                                      <span className="font-medium">Husband:</span> {detail.hasbandName}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <CorrectionRequestForm
                              warishApplicationId={app.id}
                              warishDetailId={detail.id}
                              targetType="detail"
                              availableFields={detailFields(detail)}
                              onRequestSubmitted={handleRequestSubmitted}
                              requesterName={app.applicantName || ""}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No warish details found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      This application does not have any heir information recorded.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Existing Correction Requests */}
      {app && requests.length > 0 && (
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50 rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Existing Correction Requests
            </CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              Review and manage pending correction requests for this application
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <CorrectionRequestReview
              requests={requests}
              onRequestReviewed={handleRequestReviewed}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
