import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, FileText, Send, AlertCircle, CheckCircle } from "lucide-react";

interface DataApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetName: string;
  onSubmit: (applicationData: {
    dataName: string;
    purpose: string;
    organization: string;
    contactEmail: string;
    additionalInfo: string;
  }) => Promise<void>;
}

export const DataApplicationModal: React.FC<DataApplicationModalProps> = ({
  isOpen,
  onClose,
  datasetName,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    purpose: '',
    organization: '',
    contactEmail: '',
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Get current scroll position and viewport height
      const updatePosition = () => {
        setScrollY(window.scrollY);
        setViewportHeight(window.innerHeight);
      };

      updatePosition();
      
      // Listen for scroll and resize events
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      
      // Prevent background scrolling
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // ESC key to close
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose();
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await onSubmit({
        dataName: datasetName,
        ...formData
      });
      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (error) {
      setSubmitStatus('error');
      console.error('Application submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      purpose: '',
      organization: '',
      contactEmail: '',
      additionalInfo: ''
    });
    setSubmitStatus('idle');
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  // Calculate modal position - relative to current viewport position
  const modalTop = scrollY + viewportHeight * 0.02; // 2% from viewport top
  const modalWidth = 'min(90vw, 512px)';
  const modalHeight = `${viewportHeight * 0.85}px`;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <Card 
        className="absolute left-1/2 transform -translate-x-1/2 bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          top: modalTop,
          width: modalWidth,
          maxHeight: modalHeight,
          overflowY: 'auto'
        }}
      >
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Data Application</CardTitle>
                <CardDescription>Request access to: {datasetName}</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {submitStatus === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Submitted</h3>
              <p className="text-gray-600">
                Your data access request has been submitted successfully. 
                You will be notified once it has been reviewed.
              </p>
            </div>
          ) : submitStatus === 'error' ? (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submission Failed</h3>
              <p className="text-gray-600 mb-4">
                There was an error submitting your application. Please try again.
              </p>
              <Button onClick={() => setSubmitStatus('idle')} className="mt-2">
                Try Again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Research Purpose <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Please describe the intended use of this dataset for your research..."
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  required
                  rows={3}
                  className="border-gray-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Organization/Institution <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Your university, company, or research institution"
                  value={formData.organization}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                  required
                  className="border-gray-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="your.email@domain.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  required
                  className="border-gray-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Additional Information
                </label>
                <Textarea
                  placeholder="Any additional information that would support your application..."
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  rows={2}
                  className="border-gray-200 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Submit Application
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 