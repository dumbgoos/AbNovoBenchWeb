"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User,
  AlertCircle,
  RefreshCw,
  Save,
  Edit,
  Check,
  X,
  UserCheck,
  Calendar,
  Trophy,
  FileText,
  Download,
  Clock,
  Cpu,
  Tag,
  ExternalLink,
  Plus,
  BarChart3,
  Star
} from "lucide-react";
import { submissionsAPI, authAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface ModelInfo {
  name: string;
  architecture: string;
  info: string;
  version?: string;
  paper_url?: string;
  tags?: string[];
}

interface Submission {
  id: number;
  code_url?: string;
  code_path?: string;
  model_path?: string;
  model_info?: ModelInfo;
  user_name: string;
  email: string;
  status?: string;
  date?: string;
  score?: number;
  created_at?: string;
  updated_at?: string;
}

interface UserProfile {
  id: string;
  username?: string;
  email?: string;
  role?: string;
  created_at?: string;
}

// Helper function to normalize user data from backend
const normalizeUserData = (backendUser: any): UserProfile => {
  return {
    id: backendUser.id?.toString() || '',
    username: backendUser.username || backendUser.user_name, // Handle both field names
    email: backendUser.email,
    role: backendUser.role,
    created_at: backendUser.created_at
  };
};

const ProfilePage: React.FC = () => {
  const { user: authUser, isAuthenticated, updateUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated]);

  // Initialize user data from AuthContext if available
  useEffect(() => {
    if (authUser && !user) {
      const normalizedUser = normalizeUserData(authUser);
      setUser(normalizedUser);
      setEditFormData({
        username: normalizedUser.username || ''
      });
    }
  }, [authUser, user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching profile data for user:', authUser);
      
      const [userResponse, submissionsResponse] = await Promise.allSettled([
        authAPI.getCurrentUser(),
        submissionsAPI.getMy()
      ]);

      console.log('👤 User response:', userResponse);
      console.log('📋 Submissions response:', submissionsResponse);

      if (userResponse.status === 'fulfilled' && userResponse.value.success) {
        const backendUserData = userResponse.value.data?.user || userResponse.value.data;
        const normalizedUserData = normalizeUserData(backendUserData);
        setUser(normalizedUserData);
        setEditFormData({
          username: normalizedUserData.username || ''
        });
        console.log('✅ User data loaded and normalized:', normalizedUserData);
      } else if (authUser) {
        // Fallback to AuthContext user data if API fails
        console.log('⚠️ Using AuthContext user data as fallback');
        const fallbackUser = normalizeUserData(authUser);
        setUser(fallbackUser);
        setEditFormData({
          username: fallbackUser.username || ''
        });
      } else {
        console.error('❌ Failed to load user data:', userResponse);
      }

      if (submissionsResponse.status === 'fulfilled' && submissionsResponse.value.success) {
        const submissionsData = submissionsResponse.value.data;
        const submissionsList = submissionsData?.submissions || submissionsData || [];
        setSubmissions(Array.isArray(submissionsList) ? submissionsList : []);
        console.log('✅ Submissions loaded:', submissionsList);
      } else {
        console.warn('⚠️ Failed to load submissions:', submissionsResponse);
        setSubmissions([]);
      }

    } catch (err) {
      console.error('❌ Error fetching profile data:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setError(null); // Clear previous errors
      
      if (!editFormData.username.trim()) {
        setError('Username is required');
        return;
      }

      // Validate username format (must match backend validation)
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(editFormData.username)) {
        setError('Username can only contain letters, numbers, and underscores');
        return;
      }

      if (editFormData.username.length < 3 || editFormData.username.length > 50) {
        setError('Username must be between 3 and 50 characters');
        return;
      }

      const updateData: any = {};
      if (editFormData.username !== user?.username) {
        updateData.username = editFormData.username;
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditingProfile(false);
        return;
      }

      console.log('🔄 Updating profile with data:', updateData);
      
      const response = await authAPI.updateProfile(updateData);
      
      console.log('✅ Profile update response:', response);
      
      if (response.success) {
        const updatedUserData = response.data?.user || response.data;
        const normalizedUpdatedUser = normalizeUserData(updatedUserData);
        setUser(prev => ({ ...prev, ...normalizedUpdatedUser }));
        
        // Update AuthContext as well
        if (authUser) {
          updateUser({ username: normalizedUpdatedUser.username });
        }
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setIsEditingProfile(false);
      } else {
        setError(response.message || 'Failed to update profile');
      }
      
    } catch (err: any) {
      console.error('❌ Error updating profile:', err);
      
      // Handle specific error types
      if (err.message) {
        if (err.message.includes('用户名已存在') || err.message.includes('username already exists')) {
          setError('This username is already taken. Please choose a different one.');
        } else if (err.message.includes('用户名只能包含字母、数字和下划线') || err.message.includes('Username can only contain')) {
          setError('Username can only contain letters, numbers, and underscores');
        } else if (err.message.includes('用户名长度必须在3-50个字符之间') || err.message.includes('Username must be between')) {
          setError('Username must be between 3 and 50 characters');
        } else if (err.message.includes('Network connection failed') || err.message.includes('fetch')) {
          setError('Network connection failed. Please check if the backend server is running.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to update profile. Please try again.');
      }
    }
  };

  const handleDownload = async (submissionId: number, type: 'code' | 'model') => {
    try {
      await submissionsAPI.downloadFile(submissionId.toString(), type);
    } catch (error) {
      console.error(`Download ${type} error:`, error);
      setError(`Failed to download ${type} file`);
    }
  };

  const getUserInitials = (username?: string) => {
    if (!username || username.length === 0) return 'U';
    return username.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status?: string) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatsData = () => {
    const total = submissions.length;
    const completed = submissions.filter(s => s.status === 'completed' || s.status === 'success').length;
    const processing = submissions.filter(s => s.status === 'processing' || s.status === 'pending').length;
    const failed = submissions.filter(s => s.status === 'failed' || s.status === 'error').length;
    
    return { total, completed, processing, failed };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Profile</h2>
          <p className="text-gray-600 text-lg">Please wait while we load your information...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Access Denied</h2>
            <p className="text-gray-600 mb-6">Please log in to view your profile</p>
            <Link href="/auth/login">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 h-12 text-base">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getStatsData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            My Profile
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Manage your account settings and track your model submissions
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50/80 backdrop-blur-sm">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError(null)} 
                className="ml-2 text-red-800 hover:bg-red-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {saveSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50/80 backdrop-blur-sm animate-in slide-in-from-top-4 duration-500">
            <Check className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-8">
                <CardTitle className="text-center text-xl font-bold">
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-blue-100 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold">
                      {getUserInitials(user?.username)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {!isEditingProfile ? (
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-gray-800">{user?.username || 'Unknown User'}</h3>
                      <p className="text-gray-600">{user?.email || 'No email'}</p>
                      <div className="flex items-center justify-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-500" />
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {user?.role === 'admin' ? 'Administrator' : 'User'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {formatDate(user?.created_at)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <Input
                          value={editFormData.username}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="Enter username"
                          className="text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Email (Read-only)</label>
                        <Input
                          value={user?.email || ''}
                          disabled
                          className="text-center bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {!isEditingProfile ? (
                    <>
                      <Button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 h-11"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button 
                        onClick={fetchProfileData} 
                        variant="outline" 
                        className="px-4 h-11"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleSaveProfile}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 h-11"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setEditFormData({ username: user?.username || '' });
                        }}
                        variant="outline"
                        className="flex-1 h-11"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Trophy className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Check className="h-6 w-6 text-green-500 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-gray-800">{stats.completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-gray-800">{stats.processing}</div>
                    <div className="text-sm text-gray-600">Processing</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <X className="h-6 w-6 text-red-500 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-gray-800">{stats.failed}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Submissions */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6" />
                    My Submissions
                    <Badge className="bg-white/20 text-white">
                      {submissions.length}
                    </Badge>
                  </div>
                  <Link href="/submit">
                    <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Plus className="h-4 w-4 mr-2" />
                      New Submission
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {submissions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-600 mb-3">No Submissions Yet</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      Start your journey by submitting your first machine learning model for evaluation and comparison.
                    </p>
                    <Link href="/submit">
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 h-12 px-8">
                        <Plus className="h-5 w-5 mr-2" />
                        Submit Your First Model
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {submissions.map((submission, index) => (
                      <div
                        key={submission.id}
                        className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl p-6 border border-blue-100/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">#{submission.id}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-gray-800 mb-2">
                                  {submission.model_info?.name || `Model Submission ${submission.id}`}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  {submission.model_info?.architecture && (
                                    <Badge variant="outline" className="text-xs bg-white">
                                      <Cpu className="h-3 w-3 mr-1" />
                                      {submission.model_info.architecture}
                                    </Badge>
                                  )}
                                  <Badge className={`text-xs ${getStatusBadgeColor(submission.status)}`}>
                                    {getStatusText(submission.status)}
                                  </Badge>
                                </div>
                                
                                {submission.model_info?.info && (
                                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {submission.model_info.info}
                                  </p>
                                )}

                                <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Submitted: {formatDate(submission.created_at)}</span>
                                  </div>
                                  {submission.score && (
                                    <div className="flex items-center gap-2">
                                      <Star className="h-4 w-4 text-yellow-500" />
                                      <span>Score: {submission.score}</span>
                                    </div>
                                  )}
                                </div>

                                {submission.model_info?.tags && submission.model_info.tags.length > 0 && (
                                  <div className="flex items-center gap-2 mt-3">
                                    <Tag className="h-4 w-4 text-gray-400" />
                                    <div className="flex gap-1 flex-wrap">
                                      {submission.model_info.tags.map((tag, tagIndex) => (
                                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {submission.code_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(submission.code_url, '_blank')}
                                className="hover:bg-blue-50"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View Code
                              </Button>
                            )}
                            {submission.code_path && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(submission.id, 'code')}
                                className="hover:bg-green-50"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            )}
                            {submission.model_path && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(submission.id, 'model')}
                                className="hover:bg-purple-50"
                              >
                                <Download className="h-4 w-4 mr-1" />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 