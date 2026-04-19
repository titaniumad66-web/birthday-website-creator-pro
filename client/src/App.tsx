import { Switch, Route, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  clearAuthToken,
  getAuthPayload,
  getValidAuthToken,
  queryClient,
} from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { JSX, useEffect } from "react";
import PreviewWebsite from "./pages/PreviewWebsite";
import Home from "@/pages/Home";
import CreateWebsite from "@/pages/CreateWebsite";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDashboard";
import AllTemplates from "@/pages/AllTemplates";
import WebsiteView from "@/pages/WebsiteView";
import LetterView from "@/pages/LetterView";
import NotFound from "@/pages/not-found";
import AuraAI from "@/components/AuraAI";
import Dashboard from "@/pages/Dashboard";
import Payment from "@/pages/Payment";

// 🔒 Protected Route (Logged in users only)
function ProtectedRoute({ component: Component }: any) {
  const token = getValidAuthToken();

  if (!token) {
    clearAuthToken();
    window.location.href = "/login";
    return null;
  }

  return <Component />;
}

// 👑 Admin Only Route
function AdminRoute({ component: Component }: any) {
  const token = getValidAuthToken();

  if (!token) {
    clearAuthToken();
    window.location.href = "/login";
    return null;
  }

  const payload = getAuthPayload();

  if (payload?.role !== "admin") {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>🚫 Access Denied</h2>
        <p>You are not authorized to view this page.</p>
      </div>
    );
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/preview" component={PreviewWebsite} />
      <Route path="/preview/:id" component={PreviewWebsite} />
      <Route path="/templates" component={AllTemplates} />

      <Route path="/create">
        {() => <ProtectedRoute component={CreateWebsite} />}
      </Route>

      <Route path="/admin">
        {() => <AdminRoute component={AdminDashboard} />}
      </Route>

      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>

      <Route path="/pay" component={Payment} />

      <Route path="/letter/:id" component={LetterView} />

      {/* ✅ PUBLIC WEBSITE ROUTE */}
      <Route path="/w/:id" component={WebsiteView} />

      {/* ⚠️ ALWAYS KEEP THIS LAST */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App(): JSX.Element {
  const [location] = useLocation();
  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation");
    const navEntry = navEntries[0] as PerformanceNavigationTiming | undefined;
    if (navEntry?.type === "reload") {
      clearAuthToken();
    }

    const handleBeforeUnload = () => {
      clearAuthToken();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const showAuraAi = location !== "/login";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative min-h-screen flex flex-col bg-background text-foreground">
          <Navbar />
          <main className="flex flex-1 flex-col pt-20 md:pt-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={location}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-1 flex-col"
              >
                <Router />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        {showAuraAi ? <AuraAI /> : null}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
