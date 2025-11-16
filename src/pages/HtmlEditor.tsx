/**
 * HTML Editor Page
 * Convert Figma designs to HTML and add Liquid templating
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Code, 
  Eye, 
  Download, 
  Send, 
  Plus,
  X,
  Loader2,
  Copy,
  Sparkles,
  Check,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { convertPageToHtml, insertLiquidTags, generateBrazeExport } from "@/services/figmaToHtml";
import { getLiquidTagSuggestions } from "@/services/llmSuggestions";
import { useBrazeConnection } from "@/hooks/useBrazeConnection";
import { BrazeProtected } from "@/components/BrazeProtected";

interface LiquidTag {
  placeholder: string;
  description: string;
  fallback: string;
}

interface LiquidTagSuggestion extends LiquidTag {
  location: string;
  reason: string;
}

export default function HtmlEditor() {
  const navigate = useNavigate();
  const { fileKey } = useParams<{ fileKey: string }>();
  const location = useLocation();
  
  // Get page data from navigation state
  const pageData = location.state?.pageData;
  const pageName = location.state?.pageName || 'Design';
  
  const [html, setHtml] = useState<string>('');
  const [css, setCss] = useState<string>('');
  const [liquidTags, setLiquidTags] = useState<LiquidTag[]>([
    { placeholder: 'first_name', description: 'User first name', fallback: 'there' },
    { placeholder: 'last_name', description: 'User last name', fallback: '' },
    { placeholder: 'email_address', description: 'User email', fallback: 'user@example.com' }
  ]);
  const [newTag, setNewTag] = useState<LiquidTag>({ placeholder: '', description: '', fallback: '' });
  const [processedHtml, setProcessedHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [templateName, setTemplateName] = useState(`${pageName}_template`);
  const [uploadType, setUploadType] = useState<'content_block' | 'email_campaign'>('content_block');
  const [suggestions, setSuggestions] = useState<LiquidTagSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [conversionMetadata, setConversionMetadata] = useState<any>(null);
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Check Braze connection
  const { isConnected: brazeConnected } = useBrazeConnection();

  useEffect(() => {
    if (!pageData) {
      toast.error('No page data found. Please select a design first.');
      navigate(`/figma/file/${fileKey}`);
      return;
    }

    console.log('Page data received:', {
      type: pageData.type,
      name: pageData.name,
      hasChildren: !!pageData.children,
      childCount: pageData.children?.length || 0,
      children: pageData.children?.map(c => ({ type: c.type, name: c.name }))
    });

    convertToHtml();
  }, [pageData, fileKey, navigate]);

  const convertToHtml = async () => {
    setLoading(true);
    try {
      console.log('Converting page to HTML...', { pageData, fileKey });
      const result = convertPageToHtml(pageData, fileKey);
      setHtml(result.html);
      setCss(result.css);
      setProcessedHtml(result.html);
      setConversionMetadata(result.metadata);
      
      // Inform user about images
      if (result.metadata.requiresImages) {
        toast.success(
          `Converted ${result.metadata.frameCount} frames to HTML. Images will be exported from Figma.`,
          { duration: 5000 }
        );
      } else {
        toast.success(`Converted ${result.metadata.frameCount} frames to HTML`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to convert design to HTML');
      console.error('HTML conversion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProcessedHtml = () => {
    if (!html) return;
    
    const htmlWithLiquid = insertLiquidTags(html, liquidTags);
    setProcessedHtml(htmlWithLiquid);
  };

  useEffect(() => {
    updateProcessedHtml();
  }, [html, liquidTags]);

  const addLiquidTag = () => {
    if (!newTag.placeholder.trim()) {
      toast.error('Please enter a placeholder name');
      return;
    }

    if (liquidTags.some(tag => tag.placeholder === newTag.placeholder)) {
      toast.error('This placeholder already exists');
      return;
    }

    setLiquidTags([...liquidTags, { ...newTag }]);
    setNewTag({ placeholder: '', description: '', fallback: '' });
    toast.success('Liquid tag added');
  };

  const removeLiquidTag = (placeholder: string) => {
    setLiquidTags(liquidTags.filter(tag => tag.placeholder !== placeholder));
    toast.success('Liquid tag removed');
  };

  const getSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const suggestionsData = await getLiquidTagSuggestions(processedHtml, liquidTags);
      setSuggestions(suggestionsData);
      setShowSuggestions(true);
      toast.success(`Got ${suggestionsData.length} suggestions from AI`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to get suggestions');
      console.error('Suggestions error:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: LiquidTagSuggestion) => {
    // Check if already exists
    if (liquidTags.some(tag => tag.placeholder === suggestion.placeholder)) {
      toast.error('This tag already exists');
      return;
    }

    // Add to liquid tags
    setLiquidTags([...liquidTags, {
      placeholder: suggestion.placeholder,
      description: suggestion.description,
      fallback: suggestion.fallback
    }]);

    // Remove from suggestions
    setSuggestions(suggestions.filter(s => s.placeholder !== suggestion.placeholder));
    
    toast.success(`Added ${suggestion.placeholder} tag`);
  };

  const insertLiquidTagAtCursor = (liquidSyntax: string) => {
    const textarea = htmlTextareaRef.current;
    if (!textarea) {
      // Fallback: append to end
      setProcessedHtml(prev => prev + liquidSyntax);
      return;
    }

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const textBefore = processedHtml.substring(0, startPos);
    const textAfter = processedHtml.substring(endPos);
    
    const newHtml = textBefore + liquidSyntax + textAfter;
    setProcessedHtml(newHtml);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + liquidSyntax.length, startPos + liquidSyntax.length);
    }, 0);
  };

  const exportToBraze = async () => {
    if (!brazeConnected) {
      toast.error("Braze is not connected. Please connect your Braze account first.");
      navigate("/");
      return;
    }

    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    setExporting(true);
    try {
      const brazeExport = generateBrazeExport(processedHtml);
      
      console.log('[Upload] Sending to Braze:', {
        htmlLength: brazeExport.html.length,
        templateName: templateName.trim(),
        type: uploadType
      });
      
      // Upload HTML template to Braze
      const response = await fetch("/api/braze/upload-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: brazeExport.html,
          templateName: templateName.trim(),
          type: uploadType,
        }),
      });

      console.log('[Upload] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Server returned ${response.status}: ${errorText}`);
        }
        
        console.error('[Upload] Error response:', errorData);
        
        // Show detailed error message
        const errorMsg = errorData.error || "Failed to upload template to Braze";
        const details = errorData.details ? `\n\nDetails: ${JSON.stringify(errorData.details)}` : '';
        throw new Error(errorMsg + details);
      }

      const data = await response.json();
      console.log('[Upload] Success response:', data);

      if (!data.success) {
        throw new Error(data.error || "Failed to upload template to Braze");
      }

      // Also create downloadable file as backup
      const blob = new Blob([brazeExport.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateName.replace(/\s+/g, '_')}_braze_template.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show success message with sanitized name if it was changed
      let successMsg = `Template uploaded to Braze successfully!`;
      if (data.sanitizedName && data.sanitizedName !== data.originalName) {
        successMsg += ` (Saved as "${data.sanitizedName}")`;
      }
      toast.success(successMsg);
      
      // Navigate to success page
      navigate('/success', {
        state: {
          exportData: brazeExport,
          pageName: pageName,
          uploaded: true,
          uploadType: uploadType
        }
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload template to Braze');
      console.error('Upload error:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Converting design to HTML...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <BrazeProtected 
        backPath={`/figma/file/${fileKey}`}
        backText="Back to Design"
        warningMessage="You need to connect your Braze account before uploading HTML templates."
      >
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/figma/file/${fileKey}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Design
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">HTML Editor</h1>
              <p className="text-slate-600">
                Convert "{pageName}" to HTML with Braze Liquid templating
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="templateName">Template Name:</Label>
                <Input
                  id="templateName"
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="w-48"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="uploadType">Type:</Label>
                <select
                  id="uploadType"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as 'content_block' | 'email_campaign')}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="content_block">Content Block</option>
                  <option value="email_campaign">Email Campaign</option>
                </select>
              </div>
              <Button 
                onClick={exportToBraze}
                disabled={exporting || !brazeConnected || !templateName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {exporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Upload to Braze
              </Button>
            </div>
          </div>
        </div>

        {/* Conversion Info */}
        {!loading && html && conversionMetadata && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-blue-900">Status:</span>
                    <span className="ml-2 text-blue-700">✓ Converted</span>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-900">Frames:</span>
                    <span className="ml-2 text-blue-700">{conversionMetadata.frameCount}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-900">Elements:</span>
                    <span className="ml-2 text-blue-700">{conversionMetadata.elementCount}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-900">Images:</span>
                    <span className="ml-2 text-blue-700">
                      {conversionMetadata.requiresImages ? 'Yes (auto-exported)' : 'None'}
                    </span>
                  </div>
                </div>
              </div>
              {conversionMetadata.requiresImages && (
                <div className="mt-3 text-xs text-blue-800 bg-blue-100 p-2 rounded flex items-center justify-between">
                  <span>
                    ℹ️ Images and vectors are being exported from Figma. If images don't load, verify your Figma access token.
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.info('Reconverting design...');
                      convertToHtml();
                    }}
                    className="ml-3"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reconvert
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liquid Tags Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="mr-2 h-5 w-5" />
                  Liquid Tags
                </CardTitle>
                <CardDescription>
                  Add personalization tags for Braze campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* AI Suggestions Button */}
                <Button
                  onClick={getSuggestions}
                  disabled={loadingSuggestions || !processedHtml}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="sm"
                >
                  {loadingSuggestions ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting AI Suggestions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI Suggest Tags
                    </>
                  )}
                </Button>

                {/* AI Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="space-y-2 p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-purple-900 flex items-center">
                        <Sparkles className="mr-1 h-4 w-4" />
                        AI Suggestions ({suggestions.length})
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSuggestions(false)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {suggestions.map((suggestion) => (
                        <div
                          key={suggestion.placeholder}
                          className="p-3 bg-white rounded-md border border-purple-200 hover:border-purple-400 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-mono font-bold text-purple-700">
                                {`{{${suggestion.placeholder}}}`}
                              </div>
                              <div className="text-xs text-slate-700 mt-1">
                                {suggestion.description}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => applySuggestion(suggestion)}
                              className="h-7 px-2 bg-purple-600 text-white hover:bg-purple-700 ml-2"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                          {suggestion.fallback && (
                            <div className="text-xs text-slate-500 mb-1">
                              Default: "{suggestion.fallback}"
                            </div>
                          )}
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            📍 {suggestion.location}
                          </div>
                          <div className="text-xs text-slate-600 mt-1 italic">
                            💡 {suggestion.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing Tags */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Active Tags</Label>
                  {liquidTags.map((tag) => (
                    <div
                      key={tag.placeholder}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-mono text-blue-600">
                          {`{{${tag.placeholder}}}`}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {tag.description}
                        </div>
                        {tag.fallback && (
                          <div className="text-xs text-slate-400">
                            Default: "{tag.fallback}"
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const liquidSyntax = tag.fallback 
                              ? `{{${tag.placeholder} | default: '${tag.fallback}'}}`
                              : `{{${tag.placeholder}}}`;
                            insertLiquidTagAtCursor(liquidSyntax);
                            toast.success(`Inserted ${liquidSyntax} into HTML`);
                          }}
                          className="h-6 w-6 p-0"
                          title="Insert into HTML at cursor"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLiquidTag(tag.placeholder)}
                          className="h-6 w-6 p-0"
                          title="Remove tag"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Tag */}
                <div className="space-y-2 pt-4 border-t">
                  <Label className="text-sm font-medium">Add New Tag</Label>
                  <Input
                    placeholder="placeholder_name"
                    value={newTag.placeholder}
                    onChange={(e) => setNewTag({ ...newTag, placeholder: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={newTag.description}
                    onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                  />
                  <Input
                    placeholder="Default value (optional)"
                    value={newTag.fallback}
                    onChange={(e) => setNewTag({ ...newTag, fallback: e.target.value })}
                  />
                  <Button
                    onClick={addLiquidTag}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tag
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="preview">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="html">
                      <Code className="mr-2 h-4 w-4" />
                      HTML
                    </TabsTrigger>
                    <TabsTrigger value="css">
                      <Code className="mr-2 h-4 w-4" />
                      CSS
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsContent value="preview" className="mt-0">
                    <div className="border rounded-lg bg-white">
                      <div className="p-4 border-b bg-slate-50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Live Preview</span>
                          <Badge variant="secondary">
                            {liquidTags.length} liquid tags
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <iframe
                          srcDoc={processedHtml}
                          className="w-full h-96 border-0"
                          title="HTML Preview"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="html" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>HTML Code</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(processedHtml);
                              toast.success('HTML copied to clipboard');
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      {/* Quick Liquid Tag Insertion */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border">
                          <span className="text-xs text-slate-600 font-medium">Your Tags:</span>
                          {liquidTags.map((tag) => (
                            <Button
                              key={tag.placeholder}
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs px-2"
                              onClick={() => {
                                const liquidSyntax = tag.fallback 
                                  ? `{{${tag.placeholder} | default: '${tag.fallback}'}}`
                                  : `{{${tag.placeholder}}}`;
                                insertLiquidTagAtCursor(liquidSyntax);
                                toast.success(`Inserted ${liquidSyntax}`);
                              }}
                            >
                              {`{{${tag.placeholder}}}`}
                            </Button>
                          ))}
                        </div>
                        
                        {/* Common Braze Tags */}
                        <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <span className="text-xs text-blue-700 font-medium">Common Braze Tags:</span>
                          {[
                            { tag: 'user_id', desc: 'User ID' },
                            { tag: 'campaign_name', desc: 'Campaign Name' },
                            { tag: 'canvas_name', desc: 'Canvas Name' },
                            { tag: 'date_of_first_session | date: "%B %e, %Y"', desc: 'First Session Date' },
                            { tag: 'most_recent_app_version', desc: 'App Version' },
                            { tag: 'time_zone', desc: 'User Timezone' }
                          ].map(({ tag, desc }) => (
                            <Button
                              key={tag}
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs px-2 border-blue-300 hover:bg-blue-100"
                              onClick={() => {
                                const liquidSyntax = `{{${tag}}}`;
                                insertLiquidTagAtCursor(liquidSyntax);
                                toast.success(`Inserted ${desc}`);
                              }}
                              title={desc}
                            >
                              {tag.length > 20 ? `{{${tag.substring(0, 15)}...}}` : `{{${tag}}}`}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Textarea
                          ref={htmlTextareaRef}
                          value={processedHtml}
                          onChange={(e) => setProcessedHtml(e.target.value)}
                          className="font-mono text-sm h-96 resize-none"
                          placeholder="HTML code will appear here... You can edit directly and add liquid tags like {{first_name}}"
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-slate-400">
                          Lines: {processedHtml.split('\n').length} | Characters: {processedHtml.length}
                        </div>
                      </div>
                      
                      {/* HTML Editing Tips */}
                      <div className="text-xs text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <strong>💡 Pro Tips:</strong>
                        <ul className="mt-1 space-y-1 ml-2">
                          <li>• Click quick insert buttons above to add liquid tags</li>
                          <li>• Use <code className="bg-white px-1 rounded">{'{{variable | default: "fallback"}}'}</code> for fallback values</li>
                          <li>• Common tags: <code className="bg-white px-1 rounded">{'{{first_name}}'}</code>, <code className="bg-white px-1 rounded">{'{{email_address}}'}</code></li>
                          <li>• Changes auto-update the preview above</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="css" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>CSS Styles</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(css);
                            toast.success('CSS copied to clipboard');
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                      </div>
                      <Textarea
                        value={css}
                        onChange={(e) => setCss(e.target.value)}
                        className="font-mono text-sm h-96"
                        placeholder="CSS styles will appear here..."
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </BrazeProtected>
    </div>
  );
}