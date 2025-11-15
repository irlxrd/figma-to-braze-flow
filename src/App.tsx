import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ConnectionScreen from "./pages/ConnectionScreen";
import SelectDesign from "./pages/SelectDesign";
import CampaignType from "./pages/CampaignType";
import MappingPreview from "./pages/MappingPreview";
import Success from "./pages/Success";
import NotFound from "./pages/NotFound";
import FigmaConnect from "./pages/figma/Connect";
import FileFrames from "./pages/figma/FileFrames";
import ExportFrame from "./pages/figma/ExportFrame";
import Files from "./pages/figma/Files";
import FileDetail from "./pages/figma/FileDetail";
import FigmaTeamInput from "./pages/FigmaTeamInput";
import FigmaTeamFiles from "./pages/FigmaTeamFiles";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ConnectionScreen />} />
          <Route path="/select-design" element={<SelectDesign />} />
          <Route path="/campaign-type" element={<CampaignType />} />
          <Route path="/mapping" element={<MappingPreview />} />
          <Route path="/success" element={<Success />} />
          {/* Figma Integration Routes */}
          <Route path="/figma/connect" element={<FigmaConnect />} />
          <Route path="/figma/files" element={<Files />} />
          <Route path="/figma/files/:fileKey" element={<FileDetail />} />
          <Route path="/figma/file/:fileKey" element={<FileDetail />} />
          <Route path="/figma/files/:fileKey/frames" element={<FileFrames />} />
          <Route path="/figma/files/:fileKey/export" element={<ExportFrame />} />
          <Route path="/figma/team" element={<FigmaTeamInput />} />
          <Route path="/figma/team/:teamId/files" element={<FigmaTeamFiles />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
