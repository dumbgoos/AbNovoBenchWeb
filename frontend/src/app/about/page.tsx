"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Target, 
  Lightbulb, 
  Award,
  ExternalLink,
  Mail,
  MapPin,
  Building,
  Github,
  Globe,
  Heart,
  Microscope,
  Dna,
  BarChart3
} from "lucide-react";
import Link from 'next/link';

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Ningshao Xia",
      role: "Academician of Chinese Academy of Engineering",
      affiliation: "School of Life Sciences, Xiamen University",
      bio: "Leading expert in vaccine development and infectious diseases, with extensive research in viral hepatitis, AIDS, influenza, and diagnostic development.",
      avatar: "👨‍🔬",
      email: "nsxia@xmu.edu.cn",
      website: "https://life.xmu.edu.cn/lifeen/info/1011/2952.htm"
    },
    {
      name: "Quan Yuan", 
      role: "Changjiang Young Scholar",
      affiliation: "National Institute of Diagnostics and Vaccine Development",
      bio: "Recipient of the Changjiang Young Scholars Program by the Ministry of Education, specializing in hepatitis research and vaccine development.",
      avatar: "👨‍💼",
      email: "yuanquan@xmu.edu.cn",
      website: "https://nidvd.xmu.edu.cn/info/1101/1116.htm"
    },
    {
      name: "Rongshan Yu",
      role: "IET Fellow; IEEE Senior Member",
      affiliation: "School of Informatics, Xiamen University",
      bio: "Distinguished researcher in computational biology and bioinformatics, with expertise in machine learning applications for biological data analysis.",
      avatar: "👨‍💻",
      email: "rsyu@xmu.edu.cn",
      website: "https://rongshanyu.wixsite.com/personal"
    }
  ];



  const collaborators = [
    { name: "National Institute for Data Science in Health and Medicine, Xiamen University", logo: "🏛️", type: "Research Institute" },
    { name: "State Key Laboratory of Vaccines for Infectious Diseases, Xiamen University", logo: "🔬", type: "Laboratory" },
    { name: "Xiang An Biomedicine Laboratory, Xiamen University", logo: "🔬", type: "Laboratory" },
    { name: "School of Public Health, Xiamen University", logo: "🏫", type: "Academic" },
    { name: "School of Life Sciences, Xiamen University", logo: "🏫", type: "Academic" },
    { name: "School of Informatics, Xiamen University", logo: "🏫", type: "Academic" },
    { name: "The First Affiliated Hospital of Xiamen University, School of Medicine, Xiamen University", logo: "🏥", type: "Medical" },
    { name: "Aginome Scientific, Xiamen", logo: "🧬", type: "Industry" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full text-white mb-6 shadow-xl">
            <Users className="w-10 h-10" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            About AbNovoBench
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advancing antibody research through standardized benchmarking and collaborative innovation
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12 border-0 shadow-xl bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
                <p className="text-gray-600">
                  To establish a comprehensive, standardized, and reproducible benchmarking system dedicated to evaluating monoclonal antibody de novo sequencing.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
                  <Lightbulb className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
                <p className="text-gray-600">
                  To empower researchers with high-quality datasets, consistent evaluation tools, and pre-trained models—accelerating antibody therapeutic development without the need for retraining from scratch.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Our Impact</h3>
                <p className="text-gray-600">
                  By offering the largest publicly available antibody sequencing dataset and ready-to-use evaluation pipeline, AbNovoBench helps researchers identify the most suitable models for their needs and drive innovation in antibody informatics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Project Overview */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Microscope className="w-6 h-6 text-blue-600" />
                  Project Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">About AbNovoBench</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Empowering antibody research through unified training, large-scale curated datasets, and comprehensive, reproducible benchmarking.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Background</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Monoclonal antibodies (mAbs) have become indispensable tools in modern research and biomedicine, yet accurate and complete sequence information identification remains challenging. Traditional mRNA-based methods rely on the availability of hybridoma clones and fail to detect post-translational modifications critical for antibody function. Mass spectrometry (MS)-based de novo sequencing provides a powerful alternative, enabling direct readout of secreted antibody sequences. However, benchmarking de novo tools in this domain has been limited by a lack of standardized datasets and unified evaluation protocols.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">The Challenge</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Most existing deep learning models for peptide sequencing were not specifically designed for monoclonal antibody applications. The field has faced three major obstacles: (1) inconsistent training datasets across studies that hinder fair comparisons; (2) insufficient availability of curated antibody-specific test data; and (3) the absence of a standardized, reproducible, and publicly accessible benchmarking framework tailored to antibodies.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Our Solution</h4>
                  <p className="text-gray-600 leading-relaxed">
                    AbNovoBench addresses these challenges by offering the largest high-quality benchmarking dataset for monoclonal antibody sequencing to date, comprising over 1.6 million peptide-spectrum matches (PSMs) from 131 antibodies across six species and 11 proteases. In addition, it provides eight fully annotated monoclonal antibody datasets with known full-length amino acid sequences, specifically designed for evaluating downstream assembly performance. The platform integrates a unified training set, standardized evaluation metrics, and automated scoring systems to support comprehensive, reproducible, and fair comparisons across different de novo peptide sequencing algorithms and assembly strategies.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Mass Spectrometry</Badge>
                  <Badge className="bg-green-100 text-green-800">Machine Learning</Badge>
                  <Badge className="bg-purple-100 text-purple-800">Proteomics</Badge>
                  <Badge className="bg-orange-100 text-orange-800">Bioinformatics</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Statistics */}
          <div>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                  Key Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">1.6M+</div>
                    <div className="text-sm text-gray-600">Peptide-Spectrum Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">131</div>
                    <div className="text-sm text-gray-600">Monoclonal Antibodies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">6</div>
                    <div className="text-sm text-gray-600">Species Covered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-1">11</div>
                    <div className="text-sm text-gray-600">Protease Types</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-1">8</div>
                    <div className="text-sm text-gray-600">Known Monoclonal Antibodies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">0.33TB</div>
                    <div className="text-sm text-gray-600">raw data</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Research Team */}
        <Card className="mb-12 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Users className="w-6 h-6 text-purple-600" />
              Research Team
            </CardTitle>
            <CardDescription>
              Meet the researchers and developers behind AbNovoBench
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <Card 
                  key={index}
                  className="border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{member.avatar}</div>
                    <h4 className="font-bold text-gray-900 mb-1">{member.name}</h4>
                    <p className="text-sm text-blue-600 font-medium mb-2">{member.role}</p>
                    <p className="text-xs text-gray-600 mb-4 leading-relaxed">{member.bio}</p>
                    <div className="flex justify-center space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${member.email}`}>
                          <Mail className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={member.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>



        {/* Collaborators */}
        <Card className="mb-12 border-0 shadow-xl bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Building className="w-6 h-6 text-indigo-600" />
              Collaborators & Partners
            </CardTitle>
            <CardDescription>
              Institutions and organizations supporting AbNovoBench
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collaborators.map((collab, index) => (
                <Card 
                  key={index}
                  className="border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-3">{collab.logo}</div>
                    <h5 className="font-medium text-gray-900 text-sm mb-2 leading-tight">{collab.name}</h5>
                    <Badge variant="outline" className="text-xs">
                      {collab.type}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact & Contribute */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Mail className="w-6 h-6 text-blue-600" />
                Get in Touch
              </CardTitle>
              <CardDescription>
                Connect with our team for collaborations and inquiries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>Distributed Research Team</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5 text-gray-400" />
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                  <a href="mailto:luolingplay@gmail.com" className="text-blue-600 hover:underline">
                    luolingplay@gmail.com
                  </a>
                  <a href="mailto:wenbin_jiang1@163.com" className="text-blue-600 hover:underline">
                    wenbin_jiang1@163.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Globe className="w-5 h-5 text-gray-400" />
                <a href="https://abnovobench.com" className="text-blue-600 hover:underline">
                  abnovobench.com
                </a>
              </div>
              <Button className="w-full mt-4" asChild>
                <a href="mailto:luolingplay@gmail.com,wenbin_jiang1@163.com?subject=AbNovoBench%20Inquiry">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Us
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Heart className="w-6 h-6 text-red-600" />
                Contribute
              </CardTitle>
              <CardDescription>
                Join our open-source community and help improve AbNovoBench
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Github className="w-5 h-5 text-gray-400" />
                <a href="https://github.com/dumbgoos/AbNovoBench" className="text-blue-600 hover:underline">
                  GitHub Repository
                </a>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Contribute datasets and models</p>
                <p>• Report bugs and feature requests</p>
                <p>• Improve documentation</p>
                <p>• Share research findings</p>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <a href="https://github.com/dumbgoos/AbNovoBench" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  View on GitHub
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 