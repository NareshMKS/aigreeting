import { useState, useCallback } from 'react';
import { FileSpreadsheet, Upload, Send, AlertCircle, CheckCircle2, User, Calendar, MessageSquare, PenLine, Hash } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateSingleGreeting, generateBulkGreetings } from '@/services/greetingApi';
import { GeneratedImage } from '@/types/greeting';
import GeneratedResults from '@/components/upload/GeneratedResults';

type Mode = 'single' | 'bulk';

interface FormData {
  templateId: string;
  recipientName: string;
  occasion: string;
  message: string;
  senderName: string;
}

export default function UploadCSV() {
  const [mode, setMode] = useState<Mode>('single');
  const [formData, setFormData] = useState<FormData>({
    templateId: '',
    recipientName: '',
    occasion: '',
    message: '',
    senderName: '',
  });
  const [bulkTemplateId, setBulkTemplateId] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<GeneratedImage[]>([]);
  const { toast } = useToast();

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields are filled
    const emptyFields = Object.entries(formData)
      .filter(([_, value]) => !value.trim())
      .map(([key]) => key);
    
    if (emptyFields.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedResults([]);

    try {
      const response = await generateSingleGreeting({
        templateId: formData.templateId.trim(),
        recipientName: formData.recipientName.trim(),
        occasion: formData.occasion.trim(),
        message: formData.message.trim(),
        senderName: formData.senderName.trim(),
      });

      if (response.status === 'SUCCESS' && response.results.length > 0) {
        setGeneratedResults(response.results);
        toast({
          title: "Success!",
          description: `Generated ${response.generated} greeting card${response.generated !== 1 ? 's' : ''}.`,
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "No cards were generated. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate greeting card.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (!uploadedFile) {
      toast({
        title: "No File",
        description: "Please upload a CSV file first.",
        variant: "destructive",
      });
      return;
    }

    if (!bulkTemplateId.trim()) {
      toast({
        title: "Template ID Required",
        description: "Please enter a Template ID.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedResults([]);

    try {
      const response = await generateBulkGreetings(uploadedFile, bulkTemplateId.trim());

      if (response.status === 'SUCCESS' && response.results.length > 0) {
        setGeneratedResults(response.results);
        toast({
          title: "Success!",
          description: `Generated ${response.generated} greeting card${response.generated !== 1 ? 's' : ''}.`,
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "No cards were generated. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate greeting cards.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['text/csv', 'application/vnd.ms-excel'];
    const isCSV = validTypes.includes(file.type) || file.name.endsWith('.csv');
    
    if (!isCSV) {
      setFileError('Invalid file type. Please upload a .csv file only.');
      setUploadedFile(null);
      return false;
    }
    
    setFileError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setUploadedFile(file);
      setGeneratedResults([]);
      toast({
        title: "File uploaded!",
        description: `${file.name} has been uploaded successfully.`,
      });
    }
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setUploadedFile(file);
      setGeneratedResults([]);
      toast({
        title: "File uploaded!",
        description: `${file.name} has been uploaded successfully.`,
      });
    }
    e.target.value = '';
  };

  const clearFile = () => {
    setUploadedFile(null);
    setFileError(null);
    setGeneratedResults([]);
  };

  const handleModeChange = (checked: boolean) => {
    setMode(checked ? 'bulk' : 'single');
    setGeneratedResults([]);
  };

  return (
    <div className="h-full bg-background overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2 tracking-tight">
            Generate Greeting Cards
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Create greeting cards individually or batch process using a CSV file.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center justify-center gap-4 mb-10 p-4 bg-muted/30 rounded-xl border border-border/50">
          <span className={cn(
            "text-sm font-medium transition-colors",
            mode === 'single' ? 'text-primary' : 'text-muted-foreground'
          )}>
            Single
          </span>
          <Switch
            checked={mode === 'bulk'}
            onCheckedChange={handleModeChange}
            className="data-[state=checked]:bg-primary"
          />
          <span className={cn(
            "text-sm font-medium transition-colors",
            mode === 'bulk' ? 'text-primary' : 'text-muted-foreground'
          )}>
            Bulk
          </span>
        </div>

        {/* Content Area */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          {mode === 'single' ? (
            /* Single Mode - Form */
            <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="templateId" className="text-sm font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  Template ID
                </Label>
                <Input
                  id="templateId"
                  placeholder="Enter template ID (e.g., example_01)"
                  value={formData.templateId}
                  onChange={(e) => handleFormChange('templateId', e.target.value)}
                  className="h-12 bg-background border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientName" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Recipient Name
                </Label>
                <Input
                  id="recipientName"
                  placeholder="Enter recipient's name"
                  value={formData.recipientName}
                  onChange={(e) => handleFormChange('recipientName', e.target.value)}
                  className="h-12 bg-background border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occasion" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Occasion
                </Label>
                <Input
                  id="occasion"
                  placeholder="e.g., Birthday, Anniversary, Thank You"
                  value={formData.occasion}
                  onChange={(e) => handleFormChange('occasion', e.target.value)}
                  className="h-12 bg-background border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Write your heartfelt message here..."
                  value={formData.message}
                  onChange={(e) => handleFormChange('message', e.target.value)}
                  className="min-h-[120px] bg-background border-border/50 focus:border-primary/50 transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senderName" className="text-sm font-medium flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-muted-foreground" />
                  Sender Name
                </Label>
                <Input
                  id="senderName"
                  placeholder="Enter your name"
                  value={formData.senderName}
                  onChange={(e) => handleFormChange('senderName', e.target.value)}
                  className="h-12 bg-background border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isGenerating}
                  className="w-full h-12 text-base font-medium shadow-sm hover:shadow-md transition-all"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Generate Now
                </Button>
              </div>
            </form>
          ) : (
            /* Bulk Mode - Drag & Drop Upload */
            <div className="p-8">
              {/* Template ID Input for Bulk */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="bulkTemplateId" className="text-sm font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  Template ID
                </Label>
                <Input
                  id="bulkTemplateId"
                  placeholder="Enter template ID (e.g., example_01)"
                  value={bulkTemplateId}
                  onChange={(e) => setBulkTemplateId(e.target.value)}
                  className="h-12 bg-background border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200",
                  isDragging 
                    ? "border-primary bg-primary/5 scale-[1.01]" 
                    : "border-border/70 hover:border-primary/50 hover:bg-muted/30",
                  uploadedFile && !fileError && "border-primary/50 bg-primary/5",
                  fileError && "border-destructive/50 bg-destructive/5"
                )}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="pointer-events-none">
                  {uploadedFile && !fileError ? (
                    <>
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-7 h-7 text-primary" />
                      </div>
                      <p className="text-lg font-medium text-foreground mb-1">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                        className="pointer-events-auto"
                      >
                        Remove File
                      </Button>
                    </>
                  ) : fileError ? (
                    <>
                      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-7 h-7 text-destructive" />
                      </div>
                      <p className="text-lg font-medium text-destructive mb-1">
                        Upload Failed
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {fileError}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                        className="pointer-events-auto"
                      >
                        Try Again
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-7 h-7 text-primary" />
                      </div>
                      <p className="text-lg font-medium text-foreground mb-1">
                        Drag & drop your CSV file here
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse from your computer
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-xs text-muted-foreground">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Only .csv files are accepted
                      </div>
                    </>
                  )}
                </div>
              </div>

              {uploadedFile && !fileError && (
                <div className="mt-6">
                  <Button
                    size="lg"
                    onClick={handleBulkSubmit}
                    disabled={isGenerating}
                    className="w-full h-12 text-base font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Generate Now
                  </Button>
                </div>
              )}

              {/* CSV Format Guide */}
              <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-border/30">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  CSV Format Guide
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Your CSV file should include the following columns:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['recipientName', 'occasion', 'message', 'senderName'].map((field) => (
                    <span
                      key={field}
                      className="inline-flex px-2.5 py-1 bg-background rounded-md text-xs font-mono text-muted-foreground border border-border/50"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generated Results */}
        <GeneratedResults results={generatedResults} isLoading={isGenerating} />
      </div>
    </div>
  );
}