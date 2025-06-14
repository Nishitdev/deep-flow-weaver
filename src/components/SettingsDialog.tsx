
import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

export const SettingsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [replicateApiKey, setReplicateApiKey] = useState('');

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('replicate_api_key');
    if (savedKey) {
      setReplicateApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    if (replicateApiKey.trim()) {
      localStorage.setItem('replicate_api_key', replicateApiKey.trim());
      toast({
        title: "Settings Saved",
        description: "Your API key has been saved successfully.",
      });
    } else {
      localStorage.removeItem('replicate_api_key');
      toast({
        title: "API Key Removed",
        description: "Your API key has been removed.",
      });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Workflow Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys and other settings here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="replicate-key" className="text-right">
              Replicate API Key
            </Label>
            <Input
              id="replicate-key"
              type="password"
              placeholder="Enter your Replicate API key"
              value={replicateApiKey}
              onChange={(e) => setReplicateApiKey(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Get your API key from{' '}
            <a
              href="https://replicate.com/account/api-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Replicate Account Settings
            </a>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
