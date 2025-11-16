import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Lightbulb, Zap, Shield } from "lucide-react";

/**
 * LLM Suggestions Help Card
 * Displays information about the AI-powered liquid tag suggestion feature
 */
export default function LLMSuggestionsHelp() {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-900">
          <Sparkles className="mr-2 h-5 w-5" />
          AI-Powered Liquid Tag Suggestions
        </CardTitle>
        <CardDescription>
          Let AI analyze your HTML and suggest the best liquid tags for personalization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-white border-blue-300">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            <strong>How it works:</strong> Our AI analyzes your HTML content, identifies personalization 
            opportunities, and suggests relevant Braze liquid tags with smart defaults and usage tips.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <div className="bg-purple-100 rounded-full p-2">
              <Zap className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <strong className="text-purple-900">Smart Analysis</strong>
              <p className="text-slate-700 text-xs mt-1">
                Examines your content structure, identifies user-facing text, and recommends 
                tags for names, emails, products, and more.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <div className="bg-blue-100 rounded-full p-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <strong className="text-blue-900">Contextual Suggestions</strong>
              <p className="text-slate-700 text-xs mt-1">
                Each suggestion includes where to use it, why it's useful, and a sensible default value.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <div className="bg-green-100 rounded-full p-2">
              <Shield className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <strong className="text-green-900">One-Click Addition</strong>
              <p className="text-slate-700 text-xs mt-1">
                Review suggestions and add them to your template with a single click. 
                Already added tags won't be suggested again.
              </p>
            </div>
          </div>
        </div>

        <Alert className="bg-purple-100 border-purple-300">
          <AlertDescription className="text-xs text-purple-900">
            <strong>💡 Tip:</strong> Run suggestions after converting your design to get personalized 
            recommendations based on your specific content. You can run it multiple times as you edit.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
