import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate, getFinancialYear } from "@/utils/utils";
import PrintPrayerDocument from "./PrintPrayerDocument";
import { gpcode } from "@/constants/gpinfor";

interface PageProps {
  searchParams: Promise<{
    workId?: string;
  }>;
}

async function getWorkDetails(workId: string) {
  try {
    const workDetail = await db.worksDetail.findUnique({
      where: {
        id: workId,
      },
      include: {
        nitDetails: true,
        ApprovedActionPlanDetails: true,
        AwardofContract: {
          include: {
            workorderdetails: {
              include: {
                Bidagency: {
                  include: {
                    agencydetails: true,
                    earnestMoneyRegister: true,
                  },
                },
              },
            },
          },
        },
        paymentDetails: {
          include: {
            securityDeposit: true,
          },
          orderBy: {
            billPaymentDate: "desc",
          },
        },
      },
    });

    return workDetail;
  } catch (error) {
    console.error("Error fetching work details:", error);
    return null;
  }
}

export default async function PrintPrayerPage({ searchParams }: PageProps) {
  const { workId } = await searchParams;

  if (!workId) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Please provide a work ID to generate the print prayer document.
          </p>
        </div>
      </div>
    );
  }

  const workDetail = await getWorkDetails(workId);

  if (!workDetail || !workDetail.nitDetails) {
    notFound();
  }

  // Calculate financial year from NIT memo date
  const financialYear = workDetail.nitDetails.memoDate
    ? getFinancialYear(workDetail.nitDetails.memoDate)
    : "N/A";

  // Format NIT details
  const nitMemoNumber = workDetail.nitDetails.memoNumber;
  const nitYear = workDetail.nitDetails.memoDate.getFullYear();
  const nitDate = formatDate(workDetail.nitDetails.memoDate);
  const nitDetails = `${nitMemoNumber}/${gpcode}/${nitYear} Dated: ${nitDate}`;

  // Get contractor details
  const contractor =
    workDetail.AwardofContract?.workorderdetails?.[0]?.Bidagency?.agencydetails;

  // Get earnest money details
  const earnestMoneyRegister =
    workDetail.AwardofContract?.workorderdetails?.[0]?.Bidagency
      ?.earnestMoneyRegister?.[0];

  // Get security deposit details (from latest payment)
  const latestPayment = workDetail.paymentDetails?.[0];
  const securityDeposit = latestPayment?.securityDeposit;

  return (
    <PrintPrayerDocument
      financialYear={financialYear}
      nitDetails={nitDetails}
      workSlNo={workDetail.workslno}
      contractorName={contractor?.name || "N/A"}
      contractorAddress={contractor?.contactDetails || "N/A"}
      workName={
        workDetail.ApprovedActionPlanDetails?.activityDescription || "N/A"
      }
      earnestMoneyAmount={earnestMoneyRegister?.earnestMoneyAmount || 0}
      earnestMoneyStatus={earnestMoneyRegister?.paymentstatus || "pending"}
      securityDepositAmount={securityDeposit?.securityDepositAmt || 0}
      securityDepositStatus={securityDeposit?.paymentstatus || "unpaid"}
    />
  );
}
