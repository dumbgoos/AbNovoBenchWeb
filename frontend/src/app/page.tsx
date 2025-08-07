"use client";

import { Hero } from "@/components/home/Hero";
import { AnimatedSection, FloatingElement, Parallax } from "@/components/home/ScrollAnimations";
import { 
  MagneticHover, 
  ParticleBackground, 
  TypewriterEffect, 
  CountUpAnimation, 
  GlowEffect 
} from "@/components/ui/AnimatedComponents";
import { ScrollEnhancer } from "@/components/ui/ScrollEnhancer";
import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/LoadingButton";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface PlatformStats {
  num_models: number;
  num_evaluations: number;
  last_updated_at: string;
}

export default function Home() {
  // Using static data based on the research paper
  const stats: PlatformStats = {
    num_models: 25,
    num_evaluations: 1638248, // PSMs from the paper
    last_updated_at: "2024-01-15"
  };
  const loading = false;

  return (
    <ScrollEnhancer>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <Hero />

        {/* About AbNovoBench Section */}
        <section id="about-section" className="smooth-scroll-section py-16 bg-white relative overflow-hidden">
          <ParticleBackground className="absolute inset-0 opacity-30" />
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#333366]">
                  <TypewriterEffect 
                    texts={[
                      "AbNovoBench: The comprehensive benchmarking platform for antibody de novo sequencing."
                    ]}
                    className="gradient-text"
                  />
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Our platform provides the largest high-quality dataset to date, comprising 1,638,248 peptide-spectrum matches (PSMs) from 131 monoclonal antibodies (mAbs) across six species and 11 proteases, as well as eight mAbs with known sequences for evaluating full-length reconstruction. In addition, it offers an unbiased evaluation infrastructure that ensures fair comparisons. Through a unified training dataset, we benchmarked leading sequencing and assembly tools across six metric categories, spanning peptide sequencing (accuracy, robustness, efficiency, error types) and assembly (coverage depth, assembly score).
                </p>

              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Antibody-specific Dataset Section */}
        <section className="py-16 bg-gray-50 relative">
          {/* Floating antibody symbols */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-[10%]">
              <FloatingElement amplitude={10} duration={4}>
                <span className="text-2xl">💉</span>
              </FloatingElement>
            </div>
            <div className="absolute bottom-20 left-[15%]">
              <FloatingElement amplitude={8} duration={3.5} className="delay-500">
                <span className="text-2xl">🔬</span>
              </FloatingElement>
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-[#333366]">
                Antibody-specific Dataset
              </h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* High-Quality PSM Dataset */}
              <AnimatedSection direction="up" delay={100}>
                <MagneticHover className="h-full">
                  <Card className="hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden h-full feature-card">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="w-full h-32 relative bg-orange-50 flex items-center justify-center">
                        <FloatingElement>
                          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-3xl">📋</span>
                          </div>
                        </FloatingElement>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold mb-3 text-center">High-Quality PSM Dataset</h3>
                        <p className="text-gray-600 mb-4 text-sm text-center leading-relaxed">
                          Comprehensive dataset comprising 1,638,248 high-quality peptide-spectrum matches from 131 monoclonal antibodies across multiple species and proteases
                        </p>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-orange-600">131</div>
                            <div className="text-xs text-orange-800">mAbs</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-orange-600">1.6M+</div>
                            <div className="text-xs text-orange-800">PSMs</div>
                          </div>
                        </div>
                        <LoadingLink 
                          href="/datasets" 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full morph-button w-full mt-auto"
                          loadingText="Loading..."
                        >
                          Explore Dataset
                        </LoadingLink>
                      </div>
                    </CardContent>
                  </Card>
                </MagneticHover>
              </AnimatedSection>

              {/* 8 mAbs with Known Sequences */}
              <AnimatedSection direction="up" delay={200}>
                <MagneticHover className="h-full">
                  <Card className="hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden h-full feature-card">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="w-full h-32 relative bg-teal-50 flex items-center justify-center">
                        <FloatingElement amplitude={12} duration={3.5}>
                          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                            <span className="text-3xl">🔗</span>
                          </div>
                        </FloatingElement>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold mb-3 text-center">Full-Length Validation Set</h3>
                        <p className="text-gray-600 mb-4 text-sm text-center leading-relaxed">
                          Eight monoclonal antibodies with known sequences for evaluating full-length sequence reconstruction and assembly performance
                        </p>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-teal-600">8</div>
                            <div className="text-xs text-teal-800">Known mAbs</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-teal-600">100%</div>
                            <div className="text-xs text-teal-800">Validated</div>
                          </div>
                        </div>
                        <LoadingLink 
                          href="/datasets" 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full morph-button w-full mt-auto"
                          loadingText="Loading..."
                        >
                          View Sequences
                        </LoadingLink>
                      </div>
                    </CardContent>
                  </Card>
                </MagneticHover>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-16 bg-white relative">
          {/* Floating antibody symbols */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-[10%]">
              <FloatingElement amplitude={15} duration={4}>
                <span className="text-2xl">🧬</span>
              </FloatingElement>
            </div>
            <div className="absolute bottom-20 right-[15%]">
              <FloatingElement amplitude={12} duration={3.5} className="delay-500">
                <span className="text-2xl">⚗️</span>
              </FloatingElement>
            </div>
            <div className="absolute top-1/3 right-[20%]">
              <FloatingElement amplitude={18} duration={5} className="delay-1000">
                <span className="text-2xl">🔬</span>
              </FloatingElement>
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-[#333366]">
                Comprehensive Benchmarking Features
              </h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Accuracy (01) */}
              <AnimatedSection direction="up" delay={100}>
                <MagneticHover className="h-full">
                  <Card className="hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden h-full feature-card">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="w-full h-32 relative bg-red-50 flex items-center justify-center">
                        <FloatingElement>
                          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-3xl">🎯</span>
                          </div>
                        </FloatingElement>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold mb-3 text-center text-red-600">Accuracy</h3>
                        <p className="text-gray-600 mb-4 text-sm text-center leading-relaxed">
                          Comprehensive accuracy metrics including amino acid and peptide precision/recall, PTM identification accuracy, and AUC performance
                        </p>
                        <div className="text-xs text-gray-500 mb-4 text-center">
                          <div>• AA Precision, AA Recall</div>
                          <div>• Peptide Precision, Peptide Recall</div>
                          <div>• PTM Precision, PTM Recall</div>
                          <div>• AUC</div>
                        </div>
                        <LoadingLink 
                          href="/leaderboard" 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full morph-button w-full mt-auto"
                          loadingText="Loading..."
                        >
                          View Metrics
                        </LoadingLink>
                      </div>
                    </CardContent>
                  </Card>
                </MagneticHover>
              </AnimatedSection>

              {/* Efficiency (02) */}
              <AnimatedSection direction="up" delay={200}>
                <MagneticHover className="h-full">
                  <Card className="hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden h-full feature-card">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="w-full h-32 relative bg-blue-50 flex items-center justify-center">
                        <FloatingElement amplitude={12} duration={3.5}>
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-3xl">⚡</span>
                          </div>
                        </FloatingElement>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold mb-3 text-center text-blue-600">Efficiency</h3>
                        <p className="text-gray-600 mb-4 text-sm text-center leading-relaxed">
                          Performance evaluation focusing on computational efficiency and resource utilization for practical deployment
                        </p>
                        <div className="text-xs text-gray-500 mb-4 text-center">
                          <div>• Computing Time</div>
                          <div>• Resources</div>
                        </div>
                        <LoadingLink 
                          href="/leaderboard" 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full morph-button w-full mt-auto"
                          loadingText="Loading..."
                        >
                          View Metrics
                        </LoadingLink>
                      </div>
                    </CardContent>
                  </Card>
                </MagneticHover>
              </AnimatedSection>

              {/* Robustness (03) */}
              <AnimatedSection direction="up" delay={300}>
                <MagneticHover className="h-full">
                  <Card className="hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden h-full feature-card">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="w-full h-32 relative bg-yellow-50 flex items-center justify-center">
                        <FloatingElement amplitude={8} duration={4}>
                          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                            <span className="text-3xl">🛡️</span>
                          </div>
                        </FloatingElement>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold mb-3 text-center text-yellow-600">Robustness</h3>
                        <p className="text-gray-600 mb-4 text-sm text-center leading-relaxed">
                          Stability assessment across different experimental conditions including varying peptide lengths and spectral quality
                        </p>
                        <div className="text-xs text-gray-500 mb-4 text-center">
                          <div>• Peptide Length</div>
                          <div>• Noise Peaks</div>
                          <div>• Missing Fragmentation Ions</div>
                        </div>
                        <LoadingLink 
                          href="/leaderboard" 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full morph-button w-full mt-auto"
                          loadingText="Loading..."
                        >
                          View Metrics
                        </LoadingLink>
                      </div>
                    </CardContent>
                  </Card>
                </MagneticHover>
              </AnimatedSection>

              {/* Coverage Depth (04) */}
              <AnimatedSection direction="up" delay={400}>
                <MagneticHover className="h-full">
                  <Card className="hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden h-full feature-card">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="w-full h-32 relative bg-green-50 flex items-center justify-center">
                        <FloatingElement amplitude={10} duration={3.8}>
                          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-3xl">📊</span>
                          </div>
                        </FloatingElement>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold mb-3 text-center text-green-600">Coverage Depth</h3>
                        <p className="text-gray-600 mb-4 text-sm text-center leading-relaxed">
                          Sequence coverage analysis evaluating the depth and completeness of peptide identification
                        </p>
                        <div className="text-xs text-gray-500 mb-4 text-center">
                          <div>• 7-mer</div>
                          <div>• Peptide</div>
                        </div>
                        <LoadingLink 
                          href="/leaderboard" 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full morph-button w-full mt-auto"
                          loadingText="Loading..."
                        >
                          View Metrics
                        </LoadingLink>
                      </div>
                    </CardContent>
                  </Card>
                </MagneticHover>
              </AnimatedSection>

              {/* Error Types (05) */}
              <AnimatedSection direction="up" delay={500}>
                <MagneticHover className="h-full">
                  <Card className="hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden h-full feature-card">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="w-full h-32 relative bg-slate-50 flex items-center justify-center">
                        <FloatingElement amplitude={14} duration={4.2}>
                          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                            <span className="text-3xl">🔍</span>
                          </div>
                        </FloatingElement>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold mb-3 text-center text-slate-600">Error Types</h3>
                        <p className="text-gray-600 mb-4 text-sm text-center leading-relaxed">
                          Detailed error analysis categorizing different types of prediction mistakes and their patterns
                        </p>
                        <div className="text-xs text-gray-500 mb-4 text-center">
                          <div>• Inversion, AA Replace</div>
                          <div>• More than 6 AAs Wrong</div>
                          <div>• Others</div>
                        </div>
                        <LoadingLink 
                          href="/leaderboard" 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full morph-button w-full mt-auto"
                          loadingText="Loading..."
                        >
                          View Metrics
                        </LoadingLink>
                      </div>
                    </CardContent>
                  </Card>
                </MagneticHover>
              </AnimatedSection>

              {/* Assembly (06) */}
              <AnimatedSection direction="up" delay={600}>
                <MagneticHover className="h-full">
                  <Card className="hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden h-full feature-card">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="w-full h-32 relative bg-purple-50 flex items-center justify-center">
                        <FloatingElement amplitude={16} duration={3.3}>
                          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-3xl">🧩</span>
                          </div>
                        </FloatingElement>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold mb-3 text-center text-purple-600">Assembly</h3>
                        <p className="text-gray-600 mb-4 text-sm text-center leading-relaxed">
                          Full-length sequence reconstruction evaluation including assembly quality and structural integrity
                        </p>
                        <div className="text-xs text-gray-500 mb-4 text-center">
                          <div>• Assembly Score</div>
                          <div>• Coverage, Accuracy</div>
                          <div>• Gap, Insertion</div>
                        </div>
                        <LoadingLink 
                          href="/leaderboard" 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full morph-button w-full mt-auto"
                          loadingText="Loading..."
                        >
                          View Metrics
                        </LoadingLink>
                      </div>
                    </CardContent>
                  </Card>
                </MagneticHover>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Research Impact Section */}
        <section className="py-16 bg-[#f9fafb] circuit-bg relative overflow-hidden">
          <Parallax speed={-5} className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50"></div>
            <svg className="absolute w-full h-full opacity-30" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(75, 85, 190, 0.2)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </Parallax>

          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-[#333366]">
                Research Applications
              </h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatedSection direction="left" delay={100}>
                <MagneticHover>
                  <GlowEffect color="blue" className="rounded-lg">
                    <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow h-64">
                      <div className="w-16 h-16 rounded-full bg-[#ebeefe] flex items-center justify-center mb-4">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#5f57d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2 17L12 22L22 17" stroke="#5f57d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2 12L12 17L22 12" stroke="#5f57d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-3">De Novo Sequencing</h3>
                      <p className="text-gray-600 mb-4 text-sm flex-1 flex items-center">
                        Advanced algorithms for peptide sequence prediction from tandem mass spectrometry data
                      </p>
                      <div className="flex space-x-2">
                        <LoadingLink 
                          href="/models" 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full morph-button"
                          loadingText="Loading..."
                        >
                          View Models
                        </LoadingLink>
                      </div>
                    </div>
                  </GlowEffect>
                </MagneticHover>
              </AnimatedSection>

              <AnimatedSection direction="right" delay={200}>
                <MagneticHover>
                  <GlowEffect color="purple" className="rounded-lg">
                    <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow h-64">
                      <div className="w-16 h-16 rounded-full bg-[#f3f0ff] flex items-center justify-center mb-4">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 11H15M9 15H15M21 5V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V5C3 4.44772 3.44772 4 4 4H20C20.5523 4 21 4.44772 21 5Z" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M9 7H15" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-3">Benchmarking</h3>
                      <p className="text-gray-600 mb-4 text-sm flex-1 flex items-center">
                        Comprehensive evaluation metrics and standardized datasets for model comparison
                      </p>
                      <div className="flex space-x-2">
                        <LoadingLink 
                          href="/leaderboard" 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full morph-button"
                          loadingText="Loading..."
                        >
                          View Rankings
                        </LoadingLink>
                      </div>
                    </div>
                  </GlowEffect>
                </MagneticHover>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#5f57d3] to-[#4a51be] text-white relative overflow-hidden">
          <ParticleBackground className="absolute inset-0 opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to Benchmark Your Model?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Join researchers worldwide in advancing antibody de novo sequencing
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <LoadingLink 
                    href="/submit" 
                    variant="outline" 
                    size="lg" 
                    className="btn-unified morph-button transition-all duration-300"
                    loadingText="Loading..."
                  >
                    Submit Model
                  </LoadingLink>
                  <LoadingLink 
                    href="/about" 
                    variant="outline" 
                    size="lg" 
                    className="btn-unified morph-button transition-all duration-300"
                    loadingText="Loading..."
                  >
                    Learn More
                  </LoadingLink>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </ScrollEnhancer>
  );
}
