import React, { useState, useMemo, lazy, Suspense } from 'react';
import { ExternalLink, ArrowRight, Sparkles, FolderCode } from 'lucide-react';
import SectionTitle from './common/SectionTitle';
import Button from './common/Button';
import BackToHome from './common/BackToHome';
import { getProjectsByLang } from '../data/projects';

const ProjectModal = lazy(() => import('./ProjectModal'));

export const Projects = ({ t, currentLang, onNavigate, isStandalonePage = false }) => {
  const allProjects = useMemo(() => getProjectsByLang(currentLang), [currentLang]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalProject, setActiveModalProject] = useState(null);

  const isRtl = currentLang === 'ar';
  const projectsCount = allProjects.length;

  // Rule 4: Hide filter bar automatically when fewer than 4 projects exist
  const showFilterBar = projectsCount >= 4;

  // Distinct categories if filter bar is shown
  const categories = useMemo(() => {
    if (!showFilterBar) return [];
    const cats = Array.from(new Set(allProjects.map((p) => p.category)));
    return ['All', ...cats];
  }, [allProjects, showFilterBar]);

  const filteredProjects = useMemo(() => {
    if (!showFilterBar || selectedCategory === 'All') return allProjects;
    return allProjects.filter((p) => p.category === selectedCategory);
  }, [allProjects, selectedCategory, showFilterBar]);

  // Rule 5: With fewer than 3 projects, make cards larger (2 columns on desktop, 1 on mobile)
  const isCompactCount = projectsCount < 3;
  const gridClasses = isCompactCount
    ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  const openProjectModal = (project) => {
    setActiveModalProject(project);
  };

  const closeProjectModal = () => {
    setActiveModalProject(null);
  };

  const sectionT = t.projectsSection;

  return (
    <section id="projects" className="relative py-24 md:py-32 bg-[#0A0A0A] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#00FF88]/[0.035] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#00FF88]/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back to Home + Breadcrumb — only on standalone /projects page */}
        {isStandalonePage && onNavigate && (
          <BackToHome
            onNavigate={onNavigate}
            isRtl={isRtl}
            label={sectionT.backToHome}
            breadcrumbs={[
              { label: t.contactSection?.breadcrumbHome || 'Home', href: '/' },
              { label: t.contactSection?.breadcrumbProjects || sectionT.title },
            ]}
          />
        )}

        {/* Section Header */}
        <SectionTitle
          badge={sectionT.badge}
          title={sectionT.title}
          subtitle={sectionT.subtitle}
          className="mb-14 text-center"
        />

        {/* Rule 4: Category Filter Bar (Visible ONLY when 4+ projects exist) */}
        {showFilterBar && (
          <div className="flex items-center justify-center flex-wrap gap-2 mb-12">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-mono transition-all duration-200 border ${isActive
                    ? 'bg-[#00FF88] text-[#0A0A0A] border-[#00FF88] font-bold shadow-[0_0_15px_rgba(0,255,136,0.35)]'
                    : 'bg-[#111111] text-[#A1A1AA] border-white/10 hover:border-[#00FF88]/40 hover:text-white'
                    }`}
                >
                  {cat === 'All' ? sectionT.allFilter : cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Projects Grid */}
        <div className={gridClasses}>
          {filteredProjects.map((project) => {
            const coverImage = project.images?.[0] || '';

            return (
              <div
                key={project.id}
                onClick={() => openProjectModal(project)}
                className={`group relative rounded-[22px] bg-[#111111]/90 border border-white/[0.08] backdrop-blur-xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00FF88]/50 hover:shadow-[0_0_30px_rgba(0,255,136,0.22)] ${isCompactCount ? 'p-6 sm:p-8' : 'p-5 sm:p-6'
                  }`}
              >
                {/* Top Subtle Neon Edge Line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:via-[#00FF88]/60 transition-colors duration-300" />

                <div>
                  {/* Card Cover Image — fixed 16/9 ratio, all images uniform height */}
                  <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#0D0D0D] border border-white/[0.08] mb-6 group-hover:border-[#00FF88]/40 transition-all duration-300">
                    <img
                      src={coverImage}
                      alt={project.title}
                      width="640"
                      height="360"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                    {/* Subtle bottom fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/60 via-transparent to-transparent opacity-50 group-hover:opacity-10 transition-opacity duration-300" />

                    {/* Badges on Top of Image */}
                    <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
                      <span className="font-mono text-xs px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-white">
                        {project.category}
                      </span>

                      {/* Rule 3: Concept Badge (JetBrains Mono, neon green outline) */}
                      {project.is_concept && (
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full border border-[#00FF88] text-[#00FF88] bg-[#00FF88]/10 tracking-wider shadow-[0_0_10px_rgba(0,255,136,0.25)]">
                          {sectionT.conceptBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className={`font-heading font-bold text-white group-hover:text-[#00FF88] transition-colors duration-200 mb-3 tracking-tight ${isCompactCount
                      ? 'text-2xl sm:text-3xl'
                      : 'text-xl sm:text-2xl'
                      }`}
                  >
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p
                    className={`text-[#A1A1AA] leading-relaxed line-clamp-3 mb-6 font-normal ${isCompactCount ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
                      }`}
                  >
                    {project.description}
                  </p>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.tech_stack?.slice(0, 5).map((tech, i) => (
                      <span
                        key={i}
                        className="font-mono text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/[0.08] text-[#D4D4D8]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white group-hover:text-[#00FF88] transition-colors">
                    <span>{sectionT.viewCaseStudy}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
                  </span>

                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#A1A1AA] hover:text-[#00FF88] hover:border-[#00FF88]/50 transition-colors"
                      aria-label={`${sectionT.visitLive} ${project.title}`}
                      title={sectionT.visitLive}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {/* Rule 6: Final Card at the end of the grid: "Your project could be next" */}
          <div
            className={`group relative rounded-[22px] bg-gradient-to-br from-[#121212] via-[#101010] to-[#0D0D0D] border-2 border-dashed border-white/15 backdrop-blur-xl p-8 sm:p-10 flex flex-col justify-between items-center text-center transition-all duration-300 hover:border-[#00FF88]/60 hover:shadow-[0_0_35px_rgba(0,255,136,0.18)] ${isCompactCount ? 'min-h-[460px]' : 'min-h-[380px]'
              }`}
          >
            {/* Top glowing dot or icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center justify-center text-[#00FF88] mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all duration-300">
              <Sparkles className="w-8 h-8" />
            </div>

            {/* Card Content */}
            <div className="flex flex-col items-center max-w-sm mb-6">
              <span className="font-mono text-xs text-[#00FF88] tracking-widest uppercase mb-2">
                // NEXT COLLABORATION
              </span>
              <h3
                className={`font-heading font-extrabold text-white mb-4 tracking-tight ${isCompactCount ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                  }`}
              >
                {sectionT.nextCardTitle}
              </h3>
              <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed font-normal">
                {sectionT.nextCardSubtitle}
              </p>
            </div>

            {/* Neon Start a Project Button linking to /contact */}
            <Button
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('/contact');
                else window.location.href = '/contact';
              }}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto font-bold px-8 shadow-[0_0_25px_rgba(0,255,136,0.4)] hover:shadow-[0_0_35px_rgba(0,255,136,0.65)] group"
            >
              <span>{sectionT.nextCardCta}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>

      {/* Project Details Modal (Case Study layout) - Code-split */}
      {activeModalProject && (
        <Suspense fallback={null}>
          <ProjectModal
            project={activeModalProject}
            projects={filteredProjects}
            isOpen={Boolean(activeModalProject)}
            onClose={closeProjectModal}
            onNavigate={(nextProj) => setActiveModalProject(nextProj)}
            onNavigateToRoute={onNavigate}
            t={t}
            isRtl={isRtl}
          />
        </Suspense>
      )}
    </section>
  );
};

export default Projects;

