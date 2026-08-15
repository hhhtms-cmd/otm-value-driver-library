import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ClientValidationBrief from "./pages/ClientValidationBrief";
import ClientBriefV2 from "./pages/ClientBriefV2";

/* Design reminder: Cobalt Field Guide is the customer-facing entry; Decision Archive remains an explicit internal workbench. */

function Router() {
  return (
    <Switch>
      <Route path={"/client-brief"} component={ClientBriefV2} />
      <Route path={"/client-brief-classic"} component={ClientValidationBrief} />
      <Route path={"/workbench"} component={Home} />
      <Route path={"/"} component={ClientBriefV2} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
