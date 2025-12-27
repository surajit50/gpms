"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/utils/utils";
import { gpname } from "@/constants/gpinfor";

interface PrintPrayerDocumentProps {
  financialYear: string;
  nitDetails: string;
  workSlNo: number;
  contractorName: string;
  contractorAddress: string;
  workName: string;
  earnestMoneyAmount: number;
  earnestMoneyStatus: string;
  securityDepositAmount: number;
  securityDepositStatus: string;
}

export default function PrintPrayerDocument({
  financialYear,
  nitDetails,
  workSlNo,
  contractorName,
  contractorAddress,
  workName,
  earnestMoneyAmount,
  earnestMoneyStatus,
  securityDepositAmount,
  securityDepositStatus,
}: PrintPrayerDocumentProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleToggleItem = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const prayerItems = [
    { id: "bill-prayer", label: "Print Bill Prayer" },
    { id: "earnest-refund", label: "Earnest Money Refund" },
    { id: "security-deposit", label: "Security Deposit Refund" },
    { id: "work-order", label: "Work Order Copy" },
    { id: "payment-certificate", label: "Payment Certificate" },
    { id: "completion-certificate", label: "Completion Certificate" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Print Controls */}
      <div className="print:hidden bg-muted/40 py-4 sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              ← Back
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Document
            </Button>
          </div>
        </div>
      </div>

      {/* Printable Document */}
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="bg-white border-2 border-gray-800 p-8 print:p-12 space-y-6">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-800 pb-4">
            <h1 className="text-3xl font-bold uppercase mb-2">
              Print Prayer Document
            </h1>
            <p className="text-sm text-gray-600">{gpname}</p>
          </div>

          {/* Financial Year */}
          <div className="border border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-lg">Financial Year:</span>
              <span className="text-lg">{financialYear}</span>
            </div>
          </div>

          {/* NIT Details */}
          <div className="border border-gray-800 p-4">
            <div className="mb-2">
              <span className="font-bold text-lg">NIT Details:</span>
            </div>
            <div className="ml-4">
              <p className="text-base">{nitDetails}</p>
            </div>
          </div>

          {/* Work SL No */}
          <div className="border border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-lg">Work SL No:</span>
              <span className="text-lg">{workSlNo.toFixed()}</span>
            </div>
          </div>

          {/* Contractor Details */}
          <div className="border border-gray-800 p-4">
            <div className="mb-2">
              <span className="font-bold text-lg">Contractor Name:</span>
            </div>
            <div className="ml-4 mb-2">
              <p className="text-base">{contractorName}</p>
            </div>
            <div className="mb-2">
              <span className="font-bold text-lg">Contractor Address:</span>
            </div>
            <div className="ml-4">
              <p className="text-base">{contractorAddress}</p>
            </div>
          </div>

          {/* Work Name */}
          <div className="border border-gray-800 p-4">
            <div className="mb-2">
              <span className="font-bold text-lg">Name of Work:</span>
            </div>
            <div className="ml-4">
              <p className="text-base">{workName}</p>
            </div>
          </div>

          {/* Prayer Items - Checkboxes */}
          <div className="border-2 border-gray-800 p-4 mt-6">
            <div className="mb-4">
              <span className="font-bold text-lg">
                Please select the required documents:
              </span>
            </div>
            <div className="space-y-3 ml-4">
              {prayerItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => handleToggleItem(item.id)}
                >
                  <div className="w-6 h-6 border-2 border-gray-800 flex items-center justify-center print:border-gray-900">
                    {selectedItems.includes(item.id) && (
                      <div className="w-4 h-4 bg-black print:bg-black" />
                    )}
                  </div>
                  <span className="text-base font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="border border-gray-800 p-4 mt-6">
            <div className="mb-2">
              <span className="font-bold text-lg">Additional Information:</span>
            </div>
            <div className="space-y-2 ml-4 text-sm">
              {earnestMoneyAmount > 0 && (
                <p>
                  <span className="font-semibold">Earnest Money:</span> ₹
                  {earnestMoneyAmount.toLocaleString("en-IN")} (Status:{" "}
                  {earnestMoneyStatus})
                </p>
              )}
              {securityDepositAmount > 0 && (
                <p>
                  <span className="font-semibold">Security Deposit:</span> ₹
                  {securityDepositAmount.toLocaleString("en-IN")} (Status:{" "}
                  {securityDepositStatus})
                </p>
              )}
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-12 pt-8 border-t-2 border-gray-800">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="border-t-2 border-gray-800 pt-2 mt-16">
                  <p className="text-center font-semibold">
                    Contractor Signature
                  </p>
                </div>
              </div>
              <div>
                <div className="border-t-2 border-gray-800 pt-2 mt-16">
                  <p className="text-center font-semibold">
                    Authorized Signatory
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="mt-6 text-right">
            <p className="text-sm">Date: {formatDate(new Date())}</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-12 {
            padding: 3rem !important;
          }
          .print\\:border-gray-900 {
            border-color: #000 !important;
          }
          .print\\:bg-black {
            background-color: #000 !important;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
