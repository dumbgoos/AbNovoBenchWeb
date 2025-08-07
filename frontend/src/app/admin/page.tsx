"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, Users, Database, BarChart3, FileText, Search, Plus, Edit, Trash2, 
  RefreshCw, AlertCircle, X, Brain, Activity, Clock, Settings, UserPlus, Key, Eye
} from "lucide-react";
import { modelsAPI, usersAPI, submissionsAPI, metricsAPI } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Helper function to safely format metric values
  const formatMetric = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    const numValue = parseFloat(value.toString());
    if (isNaN(numValue)) {
      return 'N/A';
    }
    return numValue.toFixed(3);
  };

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [models, setModels] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [enzymeMetrics, setEnzymeMetrics] = useState<any[]>([]);
  const [speciesMetrics, setSpeciesMetrics] = useState<any[]>([]);
  const [allMetrics, setAllMetrics] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showCreateModel, setShowCreateModel] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditModel, setShowEditModel] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showCreateEnzymeMetric, setShowCreateEnzymeMetric] = useState(false);
  const [showCreateSpeciesMetric, setShowCreateSpeciesMetric] = useState(false);
  const [showCreateAllMetric, setShowCreateAllMetric] = useState(false);
  const [showEditEnzymeMetric, setShowEditEnzymeMetric] = useState(false);
  const [showEditSpeciesMetric, setShowEditSpeciesMetric] = useState(false);
  const [showEditAllMetric, setShowEditAllMetric] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState<{username: string, newPassword: string} | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form states
  const [modelForm, setModelForm] = useState({ name: '', architecture: '', code_path: '', checkpoint_path: '', log_path: '', info: '', url: '' });
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'user' });
  const [enzymeMetricForm, setEnzymeMetricForm] = useState({ 
    model_id: '', enzyme: '', aa_precision: '', aa_recall: '', pep_precision: '', pep_recall: '', ptm_precision: '', ptm_recall: '', auc: '' 
  });
  const [speciesMetricForm, setSpeciesMetricForm] = useState({ 
    model_id: '', species: '', aa_precision: '', aa_recall: '', pep_precision: '', pep_recall: '', ptm_precision: '', ptm_recall: '', auc: '' 
  });
  const [allMetricForm, setAllMetricForm] = useState({ 
    model_id: '', aa_precision: '', aa_recall: '', pep_precision: '', pep_recall: '', ptm_precision: '', ptm_recall: '', auc: '' 
  });

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/profile');
    }
  }, [isAuthenticated, user, router]);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      const [modelsRes, usersRes, submissionsRes, metricsRes, enzymeRes, speciesRes, allRes] = await Promise.allSettled([
        modelsAPI.getAllModels({ limit: 10000 }),
        usersAPI.getAll({ limit: 10000 }),
        submissionsAPI.getAll({ limit: 10000 }),
        metricsAPI.all.getAll({ limit: 10000 }),
        metricsAPI.enzyme.getAll({ limit: 10000 }),
        metricsAPI.species.getAll({ limit: 10000 }),
        metricsAPI.all.getAll({ limit: 10000 })
      ]);

      const errors: string[] = [];

      // Handle models
      if (modelsRes.status === 'fulfilled' && modelsRes.value.success) {
        setModels(modelsRes.value.data?.models || []);
      } else {
        const error = modelsRes.status === 'rejected' ? modelsRes.reason?.message : 
                     (modelsRes.value?.message || 'Unknown models error');
        errors.push(`Models: ${error}`);
        console.error('Models API error:', modelsRes);
      }

      // Handle users
      if (usersRes.status === 'fulfilled' && usersRes.value.success) {
        setUsers(usersRes.value.data?.users || []);
      } else {
        const error = usersRes.status === 'rejected' ? usersRes.reason?.message : 
                     (usersRes.value?.message || 'Unknown users error');
        errors.push(`Users: ${error}`);
        console.error('Users API error:', usersRes);
      }

      // Handle submissions
      if (submissionsRes.status === 'fulfilled' && submissionsRes.value.success) {
        setSubmissions(submissionsRes.value.data?.submissions || []);
      } else {
        const error = submissionsRes.status === 'rejected' ? submissionsRes.reason?.message : 
                     (submissionsRes.value?.message || 'Unknown submissions error');
        errors.push(`Submissions: ${error}`);
        console.error('Submissions API error:', submissionsRes);
      }

      // Handle metrics
      if (metricsRes.status === 'fulfilled' && metricsRes.value.success) {
        setMetrics(metricsRes.value.data?.metrics || []);
      } else {
        const error = metricsRes.status === 'rejected' ? metricsRes.reason?.message : 
                     (metricsRes.value?.message || 'Unknown metrics error');
        errors.push(`Metrics: ${error}`);
        console.error('Metrics API error:', metricsRes);
      }

      // Handle enzyme metrics
      if (enzymeRes.status === 'fulfilled' && enzymeRes.value.success) {
        setEnzymeMetrics(enzymeRes.value.data?.metrics || []);
      } else {
        const error = enzymeRes.status === 'rejected' ? enzymeRes.reason?.message : 
                     (enzymeRes.value?.message || 'Unknown enzyme metrics error');
        errors.push(`Enzyme Metrics: ${error}`);
        console.error('Enzyme Metrics API error:', enzymeRes);
      }

      // Handle species metrics
      if (speciesRes.status === 'fulfilled' && speciesRes.value.success) {
        setSpeciesMetrics(speciesRes.value.data?.metrics || []);
      } else {
        const error = speciesRes.status === 'rejected' ? speciesRes.reason?.message : 
                     (speciesRes.value?.message || 'Unknown species metrics error');
        errors.push(`Species Metrics: ${error}`);
        console.error('Species Metrics API error:', speciesRes);
      }

      // Handle all metrics
      if (allRes.status === 'fulfilled' && allRes.value.success) {
        setAllMetrics(allRes.value.data?.metrics || []);
      } else {
        const error = allRes.status === 'rejected' ? allRes.reason?.message : 
                     (allRes.value?.message || 'Unknown all metrics error');
        errors.push(`All Metrics: ${error}`);
        console.error('All Metrics API error:', allRes);
      }

      // Set error message if there are any errors
      if (errors.length > 0) {
        setError(`Failed to load some data:\n${errors.join('\n')}`);
      }
    } catch (err) {
      console.error('Unexpected error in fetchData:', err);
      setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Admin页面 - 用户状态:', { 
      isAuthenticated, 
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      token: localStorage.getItem('token') ? 'exists' : 'missing'
    });
    
    if (user?.role === 'admin') {
      fetchData();
    } else if (user && user.role !== 'admin') {
      setError('您没有管理员权限');
    }
  }, [user, isAuthenticated]);

  // CRUD operations
  const handleCreateModel = async () => {
    try {
      await modelsAPI.createModel(modelForm);
      setShowCreateModel(false);
      setModelForm({ name: '', architecture: '', code_path: '', checkpoint_path: '', log_path: '', info: '', url: '' });
      fetchData();
    } catch (error) {
      setError('Failed to create model');
    }
  };

  const handleEditModel = (model: any) => {
    setSelectedItem(model);
    setModelForm({
      name: model.name || '',
      architecture: model.architecture || '',
      code_path: model.code_path || '',
      checkpoint_path: model.checkpoint_path || '',
      log_path: model.log_path || '',
      info: model.info || '',
      url: model.url || ''
    });
    setShowEditModel(true);
  };

  const handleUpdateModel = async () => {
    try {
      await modelsAPI.updateModel(selectedItem.id.toString(), modelForm);
      setShowEditModel(false);
      setSelectedItem(null);
      setModelForm({ name: '', architecture: '', code_path: '', checkpoint_path: '', log_path: '', info: '', url: '' });
      fetchData();
    } catch (error) {
      setError('Failed to update model');
    }
  };

  const handleCreateUser = async () => {
    try {
      await usersAPI.create({
        user_name: userForm.username,
        email: userForm.email,
        pwd: userForm.password,
        role: userForm.role
      });
      setShowCreateUser(false);
      setUserForm({ username: '', email: '', password: '', role: 'user' });
      fetchData();
    } catch (error) {
      setError('Failed to create user');
    }
  };

  const handleDeleteModel = async (id: number) => {
    if (confirm('Delete this model?')) {
      try {
        await modelsAPI.deleteModel(id.toString());
        fetchData();
      } catch (error) {
        setError('Failed to delete model');
      }
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('Delete this user?')) {
      try {
        await usersAPI.delete(id.toString());
        fetchData();
      } catch (error) {
        setError('Failed to delete user');
      }
    }
  };

  const handleResetPassword = async (id: number) => {
    const user = users.find(u => u.id === id);
    if (!user) {
      setError('找不到用户');
      return;
    }

    if (confirm(`确定要重置用户 "${user.user_name}" 的密码吗？`)) {
      try {
        const response = await usersAPI.resetPassword(id.toString());
        if (response.success && response.data?.newPassword) {
          // 设置重置密码数据并显示对话框
          setResetPasswordData({
            username: user.user_name,
            newPassword: response.data.newPassword
          });
          setShowPasswordReset(true);
          
          // 刷新用户列表
          fetchData();
        } else {
          setError('密码重置失败：未收到新密码');
        }
      } catch (error) {
        console.error('Reset password error:', error);
        setError('密码重置失败');
      }
    }
  };

  const handleCopyPassword = async () => {
    if (resetPasswordData && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(resetPasswordData.newPassword);
        alert('新密码已复制到剪贴板！');
      } catch (error) {
        console.error('Failed to copy password:', error);
        alert('复制失败，请手动选择并复制密码');
      }
    }
  };

  // Enzyme Metric handlers
  const handleCreateEnzymeMetric = async () => {
    try {
      const metricData = {
        model_id: parseInt(enzymeMetricForm.model_id),
        enzyme: enzymeMetricForm.enzyme,
        aa_precision: parseFloat(enzymeMetricForm.aa_precision),
        aa_recall: parseFloat(enzymeMetricForm.aa_recall),
        pep_precision: parseFloat(enzymeMetricForm.pep_precision),
        pep_recall: parseFloat(enzymeMetricForm.pep_recall),
        ptm_precision: parseFloat(enzymeMetricForm.ptm_precision),
        ptm_recall: parseFloat(enzymeMetricForm.ptm_recall),
        auc: parseFloat(enzymeMetricForm.auc)
      };
      await metricsAPI.enzyme.create(metricData);
      setShowCreateEnzymeMetric(false);
      setEnzymeMetricForm({ model_id: '', enzyme: '', aa_precision: '', aa_recall: '', pep_precision: '', pep_recall: '', ptm_precision: '', ptm_recall: '', auc: '' });
      fetchData();
    } catch (error) {
      setError('Failed to create enzyme metric');
    }
  };

  const handleEditEnzymeMetric = (metric: any) => {
    setSelectedItem(metric);
    setEnzymeMetricForm({
      model_id: metric.model_id.toString(),
      enzyme: metric.enzyme,
      aa_precision: metric.aa_precision.toString(),
      aa_recall: metric.aa_recall.toString(),
      pep_precision: metric.pep_precision.toString(),
      pep_recall: metric.pep_recall.toString(),
      ptm_precision: metric.ptm_precision.toString(),
      ptm_recall: metric.ptm_recall.toString(),
      auc: metric.auc.toString()
    });
    setShowEditEnzymeMetric(true);
  };

  const handleUpdateEnzymeMetric = async () => {
    try {
      const metricData = {
        model_id: parseInt(enzymeMetricForm.model_id),
        enzyme: enzymeMetricForm.enzyme,
        aa_precision: parseFloat(enzymeMetricForm.aa_precision),
        aa_recall: parseFloat(enzymeMetricForm.aa_recall),
        pep_precision: parseFloat(enzymeMetricForm.pep_precision),
        pep_recall: parseFloat(enzymeMetricForm.pep_recall),
        ptm_precision: parseFloat(enzymeMetricForm.ptm_precision),
        ptm_recall: parseFloat(enzymeMetricForm.ptm_recall),
        auc: parseFloat(enzymeMetricForm.auc)
      };
      await metricsAPI.enzyme.update(selectedItem.id.toString(), metricData);
      setShowEditEnzymeMetric(false);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      setError('Failed to update enzyme metric');
    }
  };

  const handleDeleteEnzymeMetric = async (id: number) => {
    if (confirm('Delete this enzyme metric?')) {
      try {
        await metricsAPI.enzyme.delete(id.toString());
        fetchData();
      } catch (error) {
        setError('Failed to delete enzyme metric');
      }
    }
  };

  // Species Metric handlers
  const handleCreateSpeciesMetric = async () => {
    try {
      const metricData = {
        model_id: parseInt(speciesMetricForm.model_id),
        species: speciesMetricForm.species,
        aa_precision: parseFloat(speciesMetricForm.aa_precision),
        aa_recall: parseFloat(speciesMetricForm.aa_recall),
        pep_precision: parseFloat(speciesMetricForm.pep_precision),
        pep_recall: parseFloat(speciesMetricForm.pep_recall),
        ptm_precision: parseFloat(speciesMetricForm.ptm_precision),
        ptm_recall: parseFloat(speciesMetricForm.ptm_recall),
        auc: parseFloat(speciesMetricForm.auc)
      };
      await metricsAPI.species.create(metricData);
      setShowCreateSpeciesMetric(false);
      setSpeciesMetricForm({ model_id: '', species: '', aa_precision: '', aa_recall: '', pep_precision: '', pep_recall: '', ptm_precision: '', ptm_recall: '', auc: '' });
      fetchData();
    } catch (error) {
      setError('Failed to create species metric');
    }
  };

  const handleEditSpeciesMetric = (metric: any) => {
    setSelectedItem(metric);
    setSpeciesMetricForm({
      model_id: metric.model_id.toString(),
      species: metric.species,
      aa_precision: metric.aa_precision.toString(),
      aa_recall: metric.aa_recall.toString(),
      pep_precision: metric.pep_precision.toString(),
      pep_recall: metric.pep_recall.toString(),
      ptm_precision: metric.ptm_precision.toString(),
      ptm_recall: metric.ptm_recall.toString(),
      auc: metric.auc.toString()
    });
    setShowEditSpeciesMetric(true);
  };

  const handleUpdateSpeciesMetric = async () => {
    try {
      const metricData = {
        model_id: parseInt(speciesMetricForm.model_id),
        species: speciesMetricForm.species,
        aa_precision: parseFloat(speciesMetricForm.aa_precision),
        aa_recall: parseFloat(speciesMetricForm.aa_recall),
        pep_precision: parseFloat(speciesMetricForm.pep_precision),
        pep_recall: parseFloat(speciesMetricForm.pep_recall),
        ptm_precision: parseFloat(speciesMetricForm.ptm_precision),
        ptm_recall: parseFloat(speciesMetricForm.ptm_recall),
        auc: parseFloat(speciesMetricForm.auc)
      };
      await metricsAPI.species.update(selectedItem.id.toString(), metricData);
      setShowEditSpeciesMetric(false);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      setError('Failed to update species metric');
    }
  };

  const handleDeleteSpeciesMetric = async (id: number) => {
    if (confirm('Delete this species metric?')) {
      try {
        await metricsAPI.species.delete(id.toString());
        fetchData();
      } catch (error) {
        setError('Failed to delete species metric');
      }
    }
  };

  // All Metric handlers
  const handleCreateAllMetric = async () => {
    try {
      const metricData = {
        model_id: parseInt(allMetricForm.model_id),
        aa_precision: parseFloat(allMetricForm.aa_precision),
        aa_recall: parseFloat(allMetricForm.aa_recall),
        pep_precision: parseFloat(allMetricForm.pep_precision),
        pep_recall: parseFloat(allMetricForm.pep_recall),
        ptm_precision: parseFloat(allMetricForm.ptm_precision),
        ptm_recall: parseFloat(allMetricForm.ptm_recall),
        auc: parseFloat(allMetricForm.auc)
      };
      await metricsAPI.all.create(metricData);
      setShowCreateAllMetric(false);
      setAllMetricForm({ model_id: '', aa_precision: '', aa_recall: '', pep_precision: '', pep_recall: '', ptm_precision: '', ptm_recall: '', auc: '' });
      fetchData();
    } catch (error) {
      setError('Failed to create all metric');
    }
  };

  const handleEditAllMetric = (metric: any) => {
    setSelectedItem(metric);
    setAllMetricForm({
      model_id: metric.model_id.toString(),
      aa_precision: metric.aa_precision.toString(),
      aa_recall: metric.aa_recall.toString(),
      pep_precision: metric.pep_precision.toString(),
      pep_recall: metric.pep_recall.toString(),
      ptm_precision: metric.ptm_precision.toString(),
      ptm_recall: metric.ptm_recall.toString(),
      auc: metric.auc.toString()
    });
    setShowEditAllMetric(true);
  };

  const handleUpdateAllMetric = async () => {
    try {
      const metricData = {
        model_id: parseInt(allMetricForm.model_id),
        aa_precision: parseFloat(allMetricForm.aa_precision),
        aa_recall: parseFloat(allMetricForm.aa_recall),
        pep_precision: parseFloat(allMetricForm.pep_precision),
        pep_recall: parseFloat(allMetricForm.pep_recall),
        ptm_precision: parseFloat(allMetricForm.ptm_precision),
        ptm_recall: parseFloat(allMetricForm.ptm_recall),
        auc: parseFloat(allMetricForm.auc)
      };
      await metricsAPI.all.update(selectedItem.id.toString(), metricData);
      setShowEditAllMetric(false);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      setError('Failed to update all metric');
    }
  };

  const handleDeleteAllMetric = async (id: number) => {
    if (confirm('Delete this summary metric?')) {
      try {
        await metricsAPI.all.delete(id.toString());
        fetchData();
      } catch (error) {
        setError('Failed to delete all metric');
      }
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage all system resources and configurations</p>
            </div>
          </div>
          
          {error && (
            <Alert className="border-red-200 bg-red-50 mb-6">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
                <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-2">
                  <X className="h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Models</p>
                  <p className="text-3xl font-bold">{models.filter(m => !m.is_delete).length}</p>
                  <p className="text-blue-200 text-xs">Active records</p>
                </div>
                <Brain className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                  <p className="text-green-200 text-xs">All records</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Submissions</p>
                  <p className="text-3xl font-bold">{submissions.length}</p>
                  <p className="text-purple-200 text-xs">All records</p>
                </div>
                <FileText className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Total Metrics</p>
                  <p className="text-3xl font-bold">{enzymeMetrics.length + speciesMetrics.length + allMetrics.length}</p>
                  <p className="text-orange-200 text-xs">All records</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="enzyme-metrics">Enzyme Metrics</TabsTrigger>
            <TabsTrigger value="species-metrics">Species Metrics</TabsTrigger>
            <TabsTrigger value="all-metrics">Summary Metrics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Database Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Active Models</span>
                      <Badge variant="outline">{models.filter(m => !m.is_delete).length}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Total Users</span>
                      <Badge variant="outline">{users.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium">Submissions</span>
                      <Badge variant="outline">{submissions.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium">Enzyme Metrics</span>
                      <Badge variant="outline">{enzymeMetrics.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium">Species Metrics</span>
                      <Badge variant="outline">{speciesMetrics.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium">Summary Metrics</span>
                      <Badge variant="outline">{allMetrics.length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => setShowCreateModel(true)} className="bg-blue-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Model
                    </Button>
                    <Button onClick={() => setShowCreateUser(true)} className="bg-green-600">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                    <Button onClick={fetchData} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline">
                      <Database className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models">
            <Card className="shadow-xl border-0 bg-white/80">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    Model Management 
                    <Badge variant="secondary" className="ml-2">
                      {models.filter(m => m.name?.toLowerCase().includes(searchTerm.toLowerCase()) && !m.is_delete).length} / {models.filter(m => !m.is_delete).length}
                    </Badge>
                  </CardTitle>
                  <Button onClick={() => setShowCreateModel(true)} className="bg-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Model
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search models..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Architecture</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {models.filter(m => 
                      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) && !m.is_delete
                    ).map((model) => (
                      <TableRow key={model.id}>
                        <TableCell>{model.id}</TableCell>
                        <TableCell className="font-medium">{model.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{model.architecture}</Badge>
                        </TableCell>
                        <TableCell>{new Date(model.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditModel(model)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteModel(model.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="shadow-xl border-0 bg-white/80">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    User Management
                    <Badge variant="secondary" className="ml-2">
                      {users.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())).length} / {users.length}
                    </Badge>
                  </CardTitle>
                  <Button onClick={() => setShowCreateUser(true)} className="bg-green-600">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(u => 
                      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleResetPassword(user.id)}
                            >
                              <Key className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <Card className="shadow-xl border-0 bg-white/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Submission Management
                  <Badge variant="secondary" className="ml-2">
                    {submissions.filter(s => 
                      s.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      s.code_url?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length} / {submissions.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search submissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Code URL</TableHead>
                      <TableHead>Code Path</TableHead>
                      <TableHead>Model Path</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.filter(s => 
                      s.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      s.code_url?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>{submission.id}</TableCell>
                        <TableCell className="font-medium">{submission.user_name}</TableCell>
                        <TableCell>
                          {submission.code_url ? (
                            <a href={submission.code_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {submission.code_url.length > 30 ? submission.code_url.substring(0, 30) + '...' : submission.code_url}
                            </a>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>{submission.code_path ? submission.code_path.split('/').pop() : 'N/A'}</TableCell>
                        <TableCell>{submission.model_path ? submission.model_path.split('/').pop() : 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enzyme Metrics Tab */}
          <TabsContent value="enzyme-metrics">
            <Card className="shadow-xl border-0 bg-white/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    Enzyme Metrics Management
                    <Badge variant="secondary" className="ml-2">
                      {enzymeMetrics.filter(m => m.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.enzyme?.toLowerCase().includes(searchTerm.toLowerCase())).length} / {enzymeMetrics.length}
                    </Badge>
                  </div>
                  <Button onClick={() => setShowCreateEnzymeMetric(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Enzyme Metric
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search enzyme metrics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Enzyme</TableHead>
                      <TableHead>AA Precision</TableHead>
                      <TableHead>Pep Precision</TableHead>
                      <TableHead>PTM Precision</TableHead>
                      <TableHead>AUC</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enzymeMetrics.filter(m => 
                      m.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      m.enzyme?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell>{metric.id}</TableCell>
                        <TableCell className="font-medium">{metric.model_name}</TableCell>
                        <TableCell>{metric.enzyme}</TableCell>
                        <TableCell>{formatMetric(metric.aa_precision)}</TableCell>
                        <TableCell>{formatMetric(metric.pep_precision)}</TableCell>
                        <TableCell>{formatMetric(metric.ptm_precision)}</TableCell>
                        <TableCell>{formatMetric(metric.auc)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditEnzymeMetric(metric)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteEnzymeMetric(metric.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Species Metrics Tab */}
          <TabsContent value="species-metrics">
            <Card className="shadow-xl border-0 bg-white/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-orange-600" />
                    Species Metrics Management
                    <Badge variant="secondary" className="ml-2">
                      {speciesMetrics.filter(m => m.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.species?.toLowerCase().includes(searchTerm.toLowerCase())).length} / {speciesMetrics.length}
                    </Badge>
                  </div>
                  <Button onClick={() => setShowCreateSpeciesMetric(true)} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Species Metric
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search species metrics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Species</TableHead>
                      <TableHead>AA Precision</TableHead>
                      <TableHead>Pep Precision</TableHead>
                      <TableHead>PTM Precision</TableHead>
                      <TableHead>AUC</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {speciesMetrics.filter(m => 
                      m.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      m.species?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell>{metric.id}</TableCell>
                        <TableCell className="font-medium">{metric.model_name}</TableCell>
                        <TableCell>{metric.species}</TableCell>
                        <TableCell>{formatMetric(metric.aa_precision)}</TableCell>
                        <TableCell>{formatMetric(metric.pep_precision)}</TableCell>
                        <TableCell>{formatMetric(metric.ptm_precision)}</TableCell>
                        <TableCell>{formatMetric(metric.auc)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditSpeciesMetric(metric)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteSpeciesMetric(metric.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Summary Metrics Tab */}
          <TabsContent value="all-metrics">
            <Card className="shadow-xl border-0 bg-white/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Summary Metrics Management
                    <Badge variant="secondary" className="ml-2">
                      {allMetrics.filter(m => m.model_name?.toLowerCase().includes(searchTerm.toLowerCase())).length} / {allMetrics.length}
                    </Badge>
                  </div>
                  <Button onClick={() => setShowCreateAllMetric(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Summary Metric
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search summary metrics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>AA Precision</TableHead>
                      <TableHead>AA Recall</TableHead>
                      <TableHead>Pep Precision</TableHead>
                      <TableHead>Pep Recall</TableHead>
                      <TableHead>PTM Precision</TableHead>
                      <TableHead>PTM Recall</TableHead>
                      <TableHead>AUC</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allMetrics.filter(m => 
                      m.model_name?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell>{metric.id}</TableCell>
                        <TableCell className="font-medium">{metric.model_name}</TableCell>
                        <TableCell>{formatMetric(metric.aa_precision)}</TableCell>
                        <TableCell>{formatMetric(metric.aa_recall)}</TableCell>
                        <TableCell>{formatMetric(metric.pep_precision)}</TableCell>
                        <TableCell>{formatMetric(metric.pep_recall)}</TableCell>
                        <TableCell>{formatMetric(metric.ptm_precision)}</TableCell>
                        <TableCell>{formatMetric(metric.ptm_recall)}</TableCell>
                        <TableCell>{formatMetric(metric.auc)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditAllMetric(metric)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteAllMetric(metric.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Model Dialog */}
        <Dialog open={showCreateModel} onOpenChange={setShowCreateModel}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Model</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Model Name"
                value={modelForm.name}
                onChange={(e) => setModelForm(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Architecture"
                value={modelForm.architecture}
                onChange={(e) => setModelForm(prev => ({ ...prev, architecture: e.target.value }))}
              />
              <Input
                placeholder="Code Path"
                value={modelForm.code_path}
                onChange={(e) => setModelForm(prev => ({ ...prev, code_path: e.target.value }))}
              />
              <Input
                placeholder="Checkpoint Path"
                value={modelForm.checkpoint_path}
                onChange={(e) => setModelForm(prev => ({ ...prev, checkpoint_path: e.target.value }))}
              />
              <Input
                placeholder="Log Path"
                value={modelForm.log_path}
                onChange={(e) => setModelForm(prev => ({ ...prev, log_path: e.target.value }))}
              />
              <Input
                placeholder="Info"
                value={modelForm.info}
                onChange={(e) => setModelForm(prev => ({ ...prev, info: e.target.value }))}
              />
              <Input
                placeholder="URL"
                value={modelForm.url}
                onChange={(e) => setModelForm(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModel(false)}>Cancel</Button>
              <Button onClick={handleCreateModel}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Model Dialog */}
        <Dialog open={showEditModel} onOpenChange={setShowEditModel}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Model</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Model Name"
                value={modelForm.name}
                onChange={(e) => setModelForm(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Architecture"
                value={modelForm.architecture}
                onChange={(e) => setModelForm(prev => ({ ...prev, architecture: e.target.value }))}
              />
              <Input
                placeholder="Code Path"
                value={modelForm.code_path}
                onChange={(e) => setModelForm(prev => ({ ...prev, code_path: e.target.value }))}
              />
              <Input
                placeholder="Checkpoint Path"
                value={modelForm.checkpoint_path}
                onChange={(e) => setModelForm(prev => ({ ...prev, checkpoint_path: e.target.value }))}
              />
              <Input
                placeholder="Log Path"
                value={modelForm.log_path}
                onChange={(e) => setModelForm(prev => ({ ...prev, log_path: e.target.value }))}
              />
              <Input
                placeholder="Info"
                value={modelForm.info}
                onChange={(e) => setModelForm(prev => ({ ...prev, info: e.target.value }))}
              />
              <Input
                placeholder="URL"
                value={modelForm.url}
                onChange={(e) => setModelForm(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModel(false)}>Cancel</Button>
              <Button onClick={handleUpdateModel}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Enzyme Metric Dialog */}
        <Dialog open={showCreateEnzymeMetric} onOpenChange={setShowCreateEnzymeMetric}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Enzyme Metric</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select onValueChange={(value) => setEnzymeMetricForm(prev => ({ ...prev, model_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Enzyme Type"
                value={enzymeMetricForm.enzyme}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, enzyme: e.target.value }))}
              />
              <Input
                placeholder="AA Precision"
                type="number"
                step="0.001"
                value={enzymeMetricForm.aa_precision}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, aa_precision: e.target.value }))}
              />
              <Input
                placeholder="AA Recall"
                type="number"
                step="0.001"
                value={enzymeMetricForm.aa_recall}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, aa_recall: e.target.value }))}
              />
              <Input
                placeholder="Pep Precision"
                type="number"
                step="0.001"
                value={enzymeMetricForm.pep_precision}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, pep_precision: e.target.value }))}
              />
              <Input
                placeholder="Pep Recall"
                type="number"
                step="0.001"
                value={enzymeMetricForm.pep_recall}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, pep_recall: e.target.value }))}
              />
              <Input
                placeholder="PTM Precision"
                type="number"
                step="0.001"
                value={enzymeMetricForm.ptm_precision}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, ptm_precision: e.target.value }))}
              />
              <Input
                placeholder="PTM Recall"
                type="number"
                step="0.001"
                value={enzymeMetricForm.ptm_recall}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, ptm_recall: e.target.value }))}
              />
              <Input
                placeholder="AUC"
                type="number"
                step="0.001"
                value={enzymeMetricForm.auc}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, auc: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateEnzymeMetric(false)}>Cancel</Button>
              <Button onClick={handleCreateEnzymeMetric}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Enzyme Metric Dialog */}
        <Dialog open={showEditEnzymeMetric} onOpenChange={setShowEditEnzymeMetric}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Enzyme Metric</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={enzymeMetricForm.model_id} onValueChange={(value) => setEnzymeMetricForm(prev => ({ ...prev, model_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Enzyme Type"
                value={enzymeMetricForm.enzyme}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, enzyme: e.target.value }))}
              />
              <Input
                placeholder="AA Precision"
                type="number"
                step="0.001"
                value={enzymeMetricForm.aa_precision}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, aa_precision: e.target.value }))}
              />
              <Input
                placeholder="AA Recall"
                type="number"
                step="0.001"
                value={enzymeMetricForm.aa_recall}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, aa_recall: e.target.value }))}
              />
              <Input
                placeholder="Pep Precision"
                type="number"
                step="0.001"
                value={enzymeMetricForm.pep_precision}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, pep_precision: e.target.value }))}
              />
              <Input
                placeholder="Pep Recall"
                type="number"
                step="0.001"
                value={enzymeMetricForm.pep_recall}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, pep_recall: e.target.value }))}
              />
              <Input
                placeholder="PTM Precision"
                type="number"
                step="0.001"
                value={enzymeMetricForm.ptm_precision}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, ptm_precision: e.target.value }))}
              />
              <Input
                placeholder="PTM Recall"
                type="number"
                step="0.001"
                value={enzymeMetricForm.ptm_recall}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, ptm_recall: e.target.value }))}
              />
              <Input
                placeholder="AUC"
                type="number"
                step="0.001"
                value={enzymeMetricForm.auc}
                onChange={(e) => setEnzymeMetricForm(prev => ({ ...prev, auc: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditEnzymeMetric(false)}>Cancel</Button>
              <Button onClick={handleUpdateEnzymeMetric}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Species Metric Dialog */}
        <Dialog open={showCreateSpeciesMetric} onOpenChange={setShowCreateSpeciesMetric}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Species Metric</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select onValueChange={(value) => setSpeciesMetricForm(prev => ({ ...prev, model_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Species Type"
                value={speciesMetricForm.species}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, species: e.target.value }))}
              />
              <Input
                placeholder="AA Precision"
                type="number"
                step="0.001"
                value={speciesMetricForm.aa_precision}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, aa_precision: e.target.value }))}
              />
              <Input
                placeholder="AA Recall"
                type="number"
                step="0.001"
                value={speciesMetricForm.aa_recall}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, aa_recall: e.target.value }))}
              />
              <Input
                placeholder="Pep Precision"
                type="number"
                step="0.001"
                value={speciesMetricForm.pep_precision}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, pep_precision: e.target.value }))}
              />
              <Input
                placeholder="Pep Recall"
                type="number"
                step="0.001"
                value={speciesMetricForm.pep_recall}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, pep_recall: e.target.value }))}
              />
              <Input
                placeholder="PTM Precision"
                type="number"
                step="0.001"
                value={speciesMetricForm.ptm_precision}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, ptm_precision: e.target.value }))}
              />
              <Input
                placeholder="PTM Recall"
                type="number"
                step="0.001"
                value={speciesMetricForm.ptm_recall}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, ptm_recall: e.target.value }))}
              />
              <Input
                placeholder="AUC"
                type="number"
                step="0.001"
                value={speciesMetricForm.auc}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, auc: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateSpeciesMetric(false)}>Cancel</Button>
              <Button onClick={handleCreateSpeciesMetric}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Species Metric Dialog */}
        <Dialog open={showEditSpeciesMetric} onOpenChange={setShowEditSpeciesMetric}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Species Metric</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={speciesMetricForm.model_id} onValueChange={(value) => setSpeciesMetricForm(prev => ({ ...prev, model_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Species Type"
                value={speciesMetricForm.species}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, species: e.target.value }))}
              />
              <Input
                placeholder="AA Precision"
                type="number"
                step="0.001"
                value={speciesMetricForm.aa_precision}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, aa_precision: e.target.value }))}
              />
              <Input
                placeholder="AA Recall"
                type="number"
                step="0.001"
                value={speciesMetricForm.aa_recall}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, aa_recall: e.target.value }))}
              />
              <Input
                placeholder="Pep Precision"
                type="number"
                step="0.001"
                value={speciesMetricForm.pep_precision}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, pep_precision: e.target.value }))}
              />
              <Input
                placeholder="Pep Recall"
                type="number"
                step="0.001"
                value={speciesMetricForm.pep_recall}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, pep_recall: e.target.value }))}
              />
              <Input
                placeholder="PTM Precision"
                type="number"
                step="0.001"
                value={speciesMetricForm.ptm_precision}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, ptm_precision: e.target.value }))}
              />
              <Input
                placeholder="PTM Recall"
                type="number"
                step="0.001"
                value={speciesMetricForm.ptm_recall}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, ptm_recall: e.target.value }))}
              />
              <Input
                placeholder="AUC"
                type="number"
                step="0.001"
                value={speciesMetricForm.auc}
                onChange={(e) => setSpeciesMetricForm(prev => ({ ...prev, auc: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditSpeciesMetric(false)}>Cancel</Button>
              <Button onClick={handleUpdateSpeciesMetric}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Summary Metric Dialog */}
        <Dialog open={showCreateAllMetric} onOpenChange={setShowCreateAllMetric}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Summary Metric</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select onValueChange={(value) => setAllMetricForm(prev => ({ ...prev, model_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="AA Precision"
                type="number"
                step="0.001"
                value={allMetricForm.aa_precision}
                onChange={(e) => setAllMetricForm(prev => ({ ...prev, aa_precision: e.target.value }))}
              />
              <Input
                placeholder="AA Recall"
                type="number"
                step="0.001"
                value={allMetricForm.aa_recall}
                onChange={(e) => setAllMetricForm(prev => ({ ...prev, aa_recall: e.target.value }))}
              />
              <Input
                placeholder="Pep Precision"
                type="number"
                step="0.001"
                value={allMetricForm.pep_precision}
                onChange={(e) => setAllMetricForm(prev => ({ ...prev, pep_precision: e.target.value }))}
              />
              <Input
                placeholder="Pep Recall"
                type="number"
                step="0.001"
                value={allMetricForm.pep_recall}
                onChange={(e) => setAllMetricForm(prev => ({ ...prev, pep_recall: e.target.value }))}
              />
              <Input
                placeholder="PTM Precision"
                type="number"
                step="0.001"
                value={allMetricForm.ptm_precision}
                onChange={(e) => setAllMetricForm(prev => ({ ...prev, ptm_precision: e.target.value }))}
              />
              <Input
                placeholder="PTM Recall"
                type="number"
                step="0.001"
                value={allMetricForm.ptm_recall}
                onChange={(e) => setAllMetricForm(prev => ({ ...prev, ptm_recall: e.target.value }))}
              />
              <Input
                placeholder="AUC"
                type="number"
                step="0.001"
                value={allMetricForm.auc}
                onChange={(e) => setAllMetricForm(prev => ({ ...prev, auc: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateAllMetric(false)}>Cancel</Button>
              <Button onClick={handleCreateAllMetric}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Summary Metric Dialog */}
        <Dialog open={showEditAllMetric} onOpenChange={setShowEditAllMetric}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Summary Metric</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={allMetricForm.model_id} onValueChange={(value) => setAllMetricForm(prev => ({ ...prev, model_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="AA Precision"
                type="number"
                step="0.001"
                value={allMetricForm.aa_precision}
                onChange={(e) => setAllMetricForm(prev => ({ ...prev, aa_precision: e.target.value }))}
              />
              <Input
                placeholder="AA Recall"
                type="number"
                step="0.001"
                value={allMetricForm.aa_recall}
                onChange={(e) => setAllMetricForm(prev => ({ ...prev, aa_recall: e.target.value }))}
              />
              <Input
                placeholder="Pep Precision"
                type="number"
                step="0.001"
                value={allMetricForm.pep_precision}
                onChange={(e) => setAllMetricForm(prev => ({ ...prev, pep_precision: e.target.value }))}
              />
              <Input
                placeholder="Pep Recall"
                type="number"
                step="0.001"
                value={allMetricForm.pep_recall}
                onChange={(e) => setAllMetricForm(prev => ({ ...prev, pep_recall: e.target.value }))}
              />
              <Input
                placeholder="PTM Precision"
                type="number"
                step="0.001"
                value={allMetricForm.ptm_precision}
                onChange={(e) => setAllMetricForm(prev => ({ ...prev, ptm_precision: e.target.value }))}
              />
              <Input
                placeholder="PTM Recall"
                type="number"
                step="0.001"
                value={allMetricForm.ptm_recall}
                onChange={(e) => setAllMetricForm(prev => ({ ...prev, ptm_recall: e.target.value }))}
              />
              <Input
                placeholder="AUC"
                type="number"
                step="0.001"
                value={allMetricForm.auc}
                onChange={(e) => setAllMetricForm(prev => ({ ...prev, auc: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditAllMetric(false)}>Cancel</Button>
              <Button onClick={handleUpdateAllMetric}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Username"
                value={userForm.username}
                onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
              />
              <Input
                placeholder="Email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                placeholder="Password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
              />
              <Select value={userForm.role} onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateUser(false)}>Cancel</Button>
              <Button onClick={handleCreateUser}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Password Reset Dialog */}
        <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">密码重置成功</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  用户 <span className="font-semibold">{resetPasswordData?.username}</span> 的密码已成功重置。
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-xs text-gray-500 mb-2">新密码：</p>
                  <p className="text-lg font-mono font-semibold text-center bg-white p-3 rounded border select-all">
                    {resetPasswordData?.newPassword}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  请将此密码安全地提供给用户，并建议用户登录后立即修改密码。
                </p>
              </div>
            </div>
            <DialogFooter className="flex justify-center space-x-2">
              <Button variant="outline" onClick={handleCopyPassword} className="flex items-center space-x-2">
                <span>📋</span>
                <span>复制密码</span>
              </Button>
              <Button onClick={() => setShowPasswordReset(false)}>
                关闭
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 