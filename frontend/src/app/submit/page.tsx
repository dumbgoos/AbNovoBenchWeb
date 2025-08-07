"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { submissionsAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  FileCode, 
  Github, 
  Link as LinkIcon, 
  Send,
  AlertCircle,
  CheckCircle,
  Loader,
  User,
  Calendar,
  Tag,
  FileText,
  Database,
  Info,
  Cpu,
  Download,
  X,
  Sparkles,
  Zap,
  Target,
  Trophy,
  Code,
  Brain,
  ArrowRight,
  Plus,
  Clock,
  BarChart3,
  Shield,
  Rocket
} from "lucide-react";
import Link from 'next/link';

interface ModelInfo {
  name: string;
  architecture: string;
  info: string;
  version?: string;
  paper_url?: string;
  tags?: string[];
}

interface SubmissionFormData {
  code_url: string;
  model_info: ModelInfo;
  codeFile?: File;
  modelFile?: File;
}

interface Submission {
  id: number;
  code_url?: string;
  code_path?: string;
  model_path?: string;
  model_info?: ModelInfo;
  user_name: string;
  email: string;
}

export default function SubmitPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [activeStep, setActiveStep] = useState(1);

  const [formData, setFormData] = useState<SubmissionFormData>({
    code_url: '',
    model_info: {
      name: '',
      architecture: '',
      info: '',
      version: '',
      paper_url: '',
      tags: []
    }
  });

  const [formErrors, setFormErrors] = useState<any>({});
  const [tagInput, setTagInput] = useState('');

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Get user's submission records
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchMySubmissions();
    }
  }, [isAuthenticated, user]);

  const fetchMySubmissions = async () => {
    try {
      if (!user?.id) {
        console.warn('Submit: User ID does not exist, cannot get submission records');
        setMySubmissions([]);
        return;
      }
      console.log('Submit: Attempting to get user submission records, user ID:', user.id);
      const response = await submissionsAPI.getMy(user.id.toString());
      console.log('Submit: API response:', response);
      // Backend returns { success: true, data: { submissions: [...], pagination: {...} } }
      setMySubmissions(response.data?.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      setMySubmissions([]);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: any = {};

    if (!formData.model_info.name.trim()) {
      errors.name = 'Model name is required';
    }

    if (!formData.model_info.architecture.trim()) {
      errors.architecture = 'Model architecture is required';
    }

    if (!formData.code_url.trim() && !formData.codeFile) {
      errors.code_url = 'Please provide GitHub URL or upload code file';
    }

    if (formData.code_url && !/^https?:\/\//.test(formData.code_url)) {
      errors.code_url = 'Please enter a valid URL format';
    }

    if (formData.model_info.paper_url && !/^https?:\/\//.test(formData.model_info.paper_url)) {
      errors.paper_url = 'Please enter a valid paper URL format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleModelInfoChange = (field: keyof ModelInfo, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      model_info: {
        ...prev.model_info,
        [field]: value
      }
    }));

    // Clear corresponding field error
    if (formErrors[field]) {
      setFormErrors((prev: any) => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleFileChange = (field: 'codeFile' | 'modelFile', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file || undefined
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.model_info.tags?.includes(tagInput.trim())) {
      handleModelInfoChange('tags', [...(formData.model_info.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleModelInfoChange('tags', formData.model_info.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      // Create FormData object
      const submitFormData = new FormData();
      
      // Add code URL (if available)
      if (formData.code_url.trim()) {
        submitFormData.append('code_url', formData.code_url.trim());
      }

      // Add model information JSON
      const modelInfoJson = JSON.stringify(formData.model_info);
      submitFormData.append('model_info', modelInfoJson);

      // Add files (if available)
      if (formData.codeFile) {
        submitFormData.append('codeFile', formData.codeFile);
      }
      if (formData.modelFile) {
        submitFormData.append('modelFile', formData.modelFile);
      }

      const response = await submissionsAPI.create(submitFormData);

      if (response.success) {
        setSubmitSuccess(true);
        setFormData({
          code_url: '',
          model_info: {
            name: '',
            architecture: '',
            info: '',
            version: '',
            paper_url: '',
            tags: []
          }
        });
        setActiveStep(1);
        // Refresh submission records
        fetchMySubmissions();
        
        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      } else {
        setSubmitError(response.message || 'Submission failed, please try again');
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Network error, please check your connection and try again');
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (submissionId: number, type: 'code' | 'model') => {
    try {
      await submissionsAPI.downloadFile(submissionId.toString(), type);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const steps = [
    { 
      id: 1, 
      title: 'Model Info', 
      icon: Brain, 
      description: 'Fill in model basic information' 
    },
    { 
      id: 2, 
      title: 'Code Resources', 
      icon: Code, 
      description: 'Provide code repository or files' 
    },
    { 
      id: 3, 
      title: 'Model Files', 
      icon: Database, 
      description: 'Upload model files' 
    }
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left side: Submission form */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg pb-8">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  Submit New Model
                </CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Follow the steps to submit your model and make it shine on the leaderboard
                </CardDescription>
                
                {/* Step indicator */}
                <div className="flex items-center justify-between mt-6 bg-white/10 rounded-xl p-4">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center gap-3 ${activeStep >= step.id ? 'text-white' : 'text-blue-200'}`}>
                        <div className="hidden sm:block">
                          <div className="font-medium">{step.title}</div>
                          <div className="text-xs opacity-80">{step.description}</div>
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-blue-300 mx-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Step 1: Model Information */}
                  <div className={`space-y-6 transition-all duration-500 ${
                    activeStep === 1 ? 'opacity-100' : 'opacity-50'
                  }`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Model Basic Information</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Model Name *
                        </label>
                        <Input
                          value={formData.model_info.name}
                          onChange={(e) => handleModelInfoChange('name', e.target.value)}
                          placeholder="e.g. GPT-4-Vision-Enhanced"
                          className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                            formErrors.name ? 'border-red-500 focus:ring-red-500' : ''
                          }`}
                        />
                        {formErrors.name && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Model Architecture *
                        </label>
                        <Input
                          value={formData.model_info.architecture}
                          onChange={(e) => handleModelInfoChange('architecture', e.target.value)}
                          placeholder="e.g. Transformer, CNN, RNN"
                          className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                            formErrors.architecture ? 'border-red-500 focus:ring-red-500' : ''
                          }`}
                        />
                        {formErrors.architecture && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.architecture}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Model Version
                        </label>
                        <Input
                          value={formData.model_info.version || ''}
                          onChange={(e) => handleModelInfoChange('version', e.target.value)}
                          placeholder="e.g. v1.0.0"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Paper Link
                        </label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="url"
                            value={formData.model_info.paper_url || ''}
                            onChange={(e) => handleModelInfoChange('paper_url', e.target.value)}
                            placeholder="https://arxiv.org/abs/..."
                            className={`pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                              formErrors.paper_url ? 'border-red-500 focus:ring-red-500' : ''
                            }`}
                          />
                        </div>
                        {formErrors.paper_url && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.paper_url}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Model Description
                      </label>
                      <Textarea
                        value={formData.model_info.info}
                        onChange={(e) => handleModelInfoChange('info', e.target.value)}
                        placeholder="Describe your model's features, innovations, applications, etc..."
                        rows={4}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    {/* Tag system */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        Model Tags
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Add tags..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={addTag}
                          variant="outline"
                          size="sm"
                          className="px-4"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {formData.model_info.tags && formData.model_info.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.model_info.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 hover:from-blue-200 hover:to-purple-200 transition-all duration-200"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-2 hover:text-red-600 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => setActiveStep(2)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      >
                        Next: Code Resources
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Step 2: Code Resources */}
                  <div className={`space-y-6 transition-all duration-500 ${
                    activeStep === 2 ? 'opacity-100' : 'opacity-50'
                  }`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Code className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Code Resources</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          GitHub Repository Link
                        </label>
                        <div className="relative">
                          <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="url"
                            value={formData.code_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, code_url: e.target.value }))}
                            placeholder="https://github.com/username/repository"
                            className={`pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                              formErrors.code_url ? 'border-red-500 focus:ring-red-500' : ''
                            }`}
                          />
                        </div>
                        {formErrors.code_url && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.code_url}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500">or</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Upload Code File
                        </label>
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 transition-all duration-200 bg-gradient-to-br from-gray-50 to-blue-50 cursor-pointer"
                          onClick={() => document.getElementById('codeFile')?.click()}
                        >
                          <div className="text-center">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <div className="text-lg font-medium text-gray-700 mb-2">
                              Click to upload code file
                            </div>
                            <div className="text-sm text-gray-500">
                              Supports ZIP, TAR, GZ, 7Z formats, max 100MB
                            </div>
                          </div>
                          <input
                            type="file"
                            accept=".zip,.tar,.gz,.7z"
                            onChange={(e) => handleFileChange('codeFile', e.target.files?.[0] || null)}
                            className="hidden"
                            id="codeFile"
                          />
                        </div>
                        {formData.codeFile && (
                          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-800">
                              Selected file: {formData.codeFile.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveStep(1)}
                        className="transition-all duration-200"
                      >
                        Previous
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setActiveStep(3)}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                      >
                        Next: Model Files
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Step 3: Model Files */}
                  <div className={`space-y-6 transition-all duration-500 ${
                    activeStep === 3 ? 'opacity-100' : 'opacity-50'
                  }`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Database className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Model Files</h3>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Upload Model File (Optional)
                      </label>
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-purple-400 transition-all duration-200 bg-gradient-to-br from-gray-50 to-purple-50 cursor-pointer"
                        onClick={() => document.getElementById('modelFile')?.click()}
                      >
                        <div className="text-center">
                          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <div className="text-lg font-medium text-gray-700 mb-2">
                            Click to upload model file
                          </div>
                          <div className="text-sm text-gray-500">
                            Supports ZIP, TAR, GZ, 7Z, PKL, PTH, H5, CKPT formats, max 100MB
                          </div>
                        </div>
                        <input
                          type="file"
                          accept=".zip,.tar,.gz,.7z,.pkl,.pth,.h5,.ckpt"
                          onChange={(e) => handleFileChange('modelFile', e.target.files?.[0] || null)}
                          className="hidden"
                          id="modelFile"
                        />
                      </div>
                      {formData.modelFile && (
                        <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-purple-800">
                            Selected file: {formData.modelFile.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveStep(2)}
                        className="transition-all duration-200"
                      >
                        Previous
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 min-w-[140px]"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Rocket className="mr-2 h-4 w-4" />
                            Launch Model
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Success and error messages */}
                  {submitSuccess && (
                    <Alert className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 animate-in slide-in-from-top-2 duration-500">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <AlertDescription className="text-green-800 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Congratulations! Model submitted successfully! Your model is queued for evaluation.
                      </AlertDescription>
                    </Alert>
                  )}

                  {submitError && (
                    <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50 animate-in slide-in-from-top-2 duration-500">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {submitError}
                      </AlertDescription>
                    </Alert>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right side: My submissions */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-white backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <Trophy className="h-5 w-5" />
                  My Submissions
                </CardTitle>
                <CardDescription className="text-emerald-100">
                  Track your model performance and ranking changes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                {isLoadingSubmissions ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="h-8 w-8 animate-spin text-gray-400 mb-3" />
                    <span className="text-gray-500">Loading submissions...</span>
                  </div>
                ) : !Array.isArray(mySubmissions) || mySubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Rocket className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-2">No submissions yet</p>
                    <p className="text-sm text-gray-400">
                      Submit your first model to start your AI evaluation journey!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Array.isArray(mySubmissions) && mySubmissions.map((submission, index) => (
                      <div
                        key={submission.id}
                        className="group relative bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                              {submission.model_info?.name || 'Unnamed Model'}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Cpu className="h-3 w-3" />
                              <span>{submission.model_info?.architecture || 'Unknown Architecture'}</span>
                            </div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800"
                          >
                            #{index + 1}
                          </Badge>
                        </div>

                        {submission.model_info?.tags && submission.model_info.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {submission.model_info.tags.slice(0, 3).map((tag, tagIndex) => (
                              <Badge
                                key={tagIndex}
                                variant="outline"
                                className="text-xs bg-white/50"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {submission.model_info.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs bg-white/50">
                                +{submission.model_info.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>Just submitted</span>
                          </div>
                          <div className="flex gap-1">
                            {submission.code_path && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(submission.id, 'code')}
                                className="h-7 px-2 text-xs hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Code
                              </Button>
                            )}
                            {submission.model_path && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(submission.id, 'model')}
                                className="h-7 px-2 text-xs hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Model
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tip card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-100">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Quick Tips</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Detailed model descriptions help improve evaluation quality</li>
                      <li>• Consider providing both code repository and model files</li>
                      <li>• Use accurate tags to help other researchers discover your work</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 