"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen,
  ExternalLink,
  Calendar,
  Settings,
  GitCommit
} from "lucide-react";

export default function NewsPage() {
  const publications = [
    {
      title: "Improvements to Casanovo, a deep learning de novo peptide sequencer",
      authors: "Straub, G., et al.",
      journal: "bioRxiv",
      year: "2025",
      doi: "10.1101/2025.07.25.666826",
      status: "preprint"
    },
    {
      title: "InstaNovo enables diffusion-powered de novo peptide sequencing in large-scale proteomics experiments",
      authors: "Eloff, K., Kalogeropoulos, K., Mabona, A., et al.",
      journal: "Nature Machine Intelligence",
      year: "2025",
      doi: "10.1038/s42256-025-01019-5",
      status: "Published"
    },
    {
      title: "π-PrimeNovo: an accurate and efficient non-autoregressive deep learning model for de novo peptide sequencing",
      authors: "Zhang, X., Ling, T., Jin, Z., et al.",
      journal: "Nature Communications",
      year: "2025",
      doi: "10.1038/s41467-025-00267-x",
      status: "Published"
    },
    {
      title: "AdaNovo: Towards Robust De Novo Peptide Sequencing in Proteomics against Data Biases",
      authors: "Xia, J., Chen, S., Zhou, J., et al.",
      journal: "Advances in Neural Information Processing Systems (NeurIPS)",
      year: "2024",
      doi: "10.48550/arXiv.2024.neurips",
      status: "Published"
    },
    {
      title: "Sequence-to-sequence translation from mass spectra to peptides with a transformer model",
      authors: "Yilmaz, M., Fondrie, W.E., Bittremieux, W., et al.",
      journal: "Nature Communications",
      year: "2024",
      doi: "10.1038/s41467-024-06427-x",
      status: "Published"
    },
    {
      title: "ContraNovo: A Contrastive Learning Approach to Enhance De Novo Peptide Sequencing",
      authors: "Jin, Z., Xu, S., Zhang, X., et al.",
      journal: "AAAI Conference on Artificial Intelligence",
      year: "2024",
      doi: "10.1609/AAAI.V38I1.27765",
      status: "Published"
    },
    {
      title: "Introducing π-HelixNovo for practical large-scale de novo peptide sequencing",
      authors: "Yang, T., Ling, T., Sun, B., et al.",
      journal: "Briefings in Bioinformatics",
      year: "2024",
      doi: "10.1093/bib/bbae021",
      status: "Published"
    },
    {
      title: "PGPointNovo: an efficient neural network-based tool for parallel de novo peptide sequencing",
      authors: "Xu, X., Yang, C., He, Q., et al.",
      journal: "Bioinformatics Advances",
      year: "2023",
      doi: "10.1093/bioadv/vbad057",
      status: "Published"
    },
    {
      title: "Accurate de novo peptide sequencing using fully convolutional neural networks",
      authors: "Liu, K., Ye, Y., Li, S., Tang, H.",
      journal: "Nature Communications",
      year: "2023",
      doi: "10.1038/s41467-023-33725-4",
      status: "Published"
    },
    {
      title: "De novo mass spectrometry peptide sequencing with a transformer model",
      authors: "Yilmaz, M., Fondrie, W., Bittremieux, W., Oh, S., Noble, W.S.",
      journal: "International Conference on Machine Learning (ICML)",
      year: "2022",
      doi: "10.48550/arXiv.2202.08859",
      status: "Published"
    },
    {
      title: "Computationally instrument-resolution-independent de novo peptide sequencing for high-resolution devices",
      authors: "Qiao, R., Tran, N.H., Xin, L., Chen, X., Li, M., Shan, B., Ghodsi, A.",
      journal: "Nature Machine Intelligence",
      year: "2021",
      doi: "10.1038/s42256-021-00304-3",
      status: "Published"
    },
    {
      title: "pNovo 3: precise de novo peptide sequencing using a learning-to-rank framework",
      authors: "Yang, H., Chi, H., Zeng, W.F., Zhou, W.J., He, S.M.",
      journal: "Bioinformatics",
      year: "2019",
      doi: "10.1093/bioinformatics/btz366",
      status: "Published"
    },
    {
      title: "Uncovering Thousands of New Peptides with Sequence-Mask-Search Hybrid De Novo Peptide Sequencing Framework",
      authors: "Karunratanakul, K., Tang, H.Y., Speicher, D.W., Chuangsuwanich, E.",
      journal: "Molecular & Cellular Proteomics",
      year: "2019",
      doi: "10.1074/mcp.TIR119.001656",
      status: "Published"
    },
    {
      title: "De novo peptide sequencing by deep learning",
      authors: "Tran, N.H., Zhang, X., Xin, L., Li, M.",
      journal: "Proceedings of the National Academy of Sciences (PNAS)",
      year: "2017",
      doi: "10.1073/pnas.1705691114",
      status: "Published"
    }
  ];

  const updateLogs = [
    {
      date: "2024-12-19",
      version: "v3.0.0",
      type: "Model Evaluation",
      title: "Comprehensive Evaluation of 13 State-of-the-Art Models",
      description: "Updated comprehensive evaluation results for 13 peptide sequencing models including InstaNovo, ContraNovo, CasaNovo et al. ,with enhanced metrics and performance analysis.",
      changes: [
        "AdaNovo",
        "CasanovoV1", 
        "CasanovoV2",
        "ContraNovo",
        "DeepNovo",
        "InstaNovo",
        "PepNet",
        "PGPointNovo",
        "pi-HelixNovo",
        "pi-PrimeNovo",
        "pNovo3",
        "PointNovo",
        "SMSNet"
      ],
      icon: "Settings"
    }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Settings": return <Settings className="w-5 h-5" />;
      default: return <GitCommit className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Model Addition": return "bg-blue-100 text-blue-800";
      case "Dataset Update": return "bg-green-100 text-green-800";
      case "Major Release": return "bg-purple-100 text-purple-800";
      case "Feature Update": return "bg-orange-100 text-orange-800";
      case "Model Evaluation": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full text-white mb-6 shadow-xl">
            <BookOpen className="w-10 h-10" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            News & Updates
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest developments, publications, and platform enhancements
          </p>
        </div>

        {/* Update Logs */}
        <Card className="mb-12 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Calendar className="w-6 h-6 text-blue-600" />
              Platform Updates
            </CardTitle>
            <CardDescription>
              Latest updates, model additions, and feature enhancements to AbNovoBench
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {updateLogs.map((update, index) => (
                <Card 
                  key={index} 
                  className="border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full text-blue-600">
                          {getIcon(update.icon)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900">{update.title}</h3>
                            <Badge className={getTypeColor(update.type)}>
                              {update.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {update.date}
                            <Badge variant="outline" className="text-xs">
                              {update.version}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{update.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Publications */}
        <Card className="mb-12 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <BookOpen className="w-6 h-6 text-green-600" />
              Publications
            </CardTitle>
            <CardDescription>
              Research papers and publications related to AbNovoBench
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {publications.map((pub, index) => (
                <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex-1 mr-4">{pub.title}</h4>
                      <Badge className={
                        pub.status === 'Published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {pub.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{pub.authors}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span><em>{pub.journal}</em> ({pub.year})</span>
                      <a 
                        href={`https://doi.org/${pub.doi}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                      >
                        DOI: {pub.doi}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
} 