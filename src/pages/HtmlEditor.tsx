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
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { convertPageToHtml, insertLiquidTags, generateBrazeExport } from "@/services/figmaToHtml";

interface LiquidTag {
  placeholder: string;
  description: string;
  fallback: string;
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
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!pageData) {
      toast.error('No page data found. Please select a design first.');
      navigate(`/figma/file/${fileKey}`);
      return;
    }

    convertToHtml();
  }, [pageData, fileKey, navigate]);

  const convertToHtml = async () => {
    setLoading(true);
    try {
      const result = convertPageToHtml(pageData);
      setHtml(result.html);
      setCss(result.css);
      setProcessedHtml(result.html);
      toast.success(`Converted ${result.metadata.frameCount} frames to HTML`);
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
    setExporting(true);
    try {
      const brazeExport = generateBrazeExport(processedHtml);
      
      // Create downloadable file
      const blob = new Blob([brazeExport.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pageName.replace(/\s+/g, '_')}_braze_template.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show export summary
      toast.success(`HTML exported! Found ${brazeExport.liquidTags.length} liquid tags`);
      
      // Navigate to success page or campaign setup
      navigate('/success', {
        state: {
          exportData: brazeExport,
          pageName: pageName
        }
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to export HTML');
      console.error('Export error:', error);
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
            
            <Button 
              onClick={exportToBraze}
              disabled={exporting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Export to Braze
            </Button>
          </div>
        </div>

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
    </div>
  );
}