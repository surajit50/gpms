import Header from "@/components/protectedComponent/Header"
import UnifiedSidebar from "@/components/protectedComponent/unified-sidebar"
import "react-datepicker/dist/react-datepicker.css";

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:block flex-shrink-0">
        <UnifiedSidebar role="admin" />
      </aside>
      
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <UnifiedSidebar role="admin" />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 w-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/20">
          <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 max-w-full">
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
