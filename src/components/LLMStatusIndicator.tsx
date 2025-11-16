/**
 * LLM Status Indicator
 * Shows if LLM is configured and working
 */

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface LLMConfig {
  configured: boolean;
  provider?: string;
  model?: string;
}

export default function LLMStatusIndicator() {
  const [status, setStatus] = useState<'loading' | 'configured' | 'not-configured'>('loading');
  const [config, setConfig] = useState<LLMConfig | null>(null);

  useEffect(() => {
    checkLLMStatus();
  }, []);

  const checkLLMStatus = async () => {
    try {
      const response = await fetch('/api/llm/config');
      const data = await response.json();
      
      if (data.configured) {
        setStatus('configured');
        setConfig(data);
      } else {
        setStatus('not-configured');
      }
    } catch (error) {
      console.error('Failed to check LLM status:', error);
      setStatus('not-configured');
    }
  };

  if (status === 'loading') {
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking AI...
      </Badge>
    );
  }

  if (status === 'configured' && config) {
    return (
      <Badge 
        variant="secondary" 
        className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
        title={`Using ${config.provider} - ${config.model}`}
      >
        <Sparkles className="h-3 w-3" />
        AI Ready
      </Badge>
    );
  }

  return (
    <Badge 
      variant="secondary" 
      className="gap-1 bg-orange-100 text-orange-700"
      title="LLM_API_KEY not configured in .env"
    >
      <AlertCircle className="h-3 w-3" />
      AI Not Configured
    </Badge>
  );
}
