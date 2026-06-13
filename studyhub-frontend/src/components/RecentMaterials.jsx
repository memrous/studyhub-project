import { Folder, FileText, ExternalLink, Download } from 'lucide-react'

const getResourceTypeStyles = (type) => {
  switch (type) {
    case 'PDF': return { bg: 'bg-red-50 text-red-600', label: 'PDF' };
    case 'SLIDES': return { bg: 'bg-blue-50 text-blue-600', label: 'Slides' };
    case 'LINK': return { bg: 'bg-emerald-50 text-emerald-600', label: 'URL' };
    case 'NOTES': return { bg: 'bg-indigo-50 text-indigo-600', label: 'Notes' };
    default: return { bg: 'bg-slate-50 text-slate-600', label: 'Doc' };
  }
};

const RecentMaterials = ({ resources, subjects }) => {
  // Desktop materials (up to 3)
  const recentListDesktop = [...(resources || [])]
    .sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''))
    .slice(0, 3);

  // Mobile materials (up to 2)
  const recentListMobile = [...(resources || [])]
    .sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''))
    .slice(0, 2);

  return (
    <>
      {/* MOBILE LAYOUT: Recent Materials */}
      <section className="flex lg:hidden flex-col gap-3 font-inter text-on-surface">
        <h3 className="text-headline-md font-semibold">Recent Materials</h3>
        
        <div className="flex flex-col gap-3">
          {recentListMobile.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] p-4 rounded-lg text-center text-body-md text-[#737686] italic">
              No resources available.
            </div>
          ) : (
            recentListMobile.map(res => {
              const subject = (subjects || []).find(s => s.id === res.subjectId);
              const subCode = subject ? subject.code : '';
              const styles = getResourceTypeStyles(res.type);
              const isExternal = res.type === 'LINK';

              return (
                <div 
                  key={res.id} 
                  className="bg-white border border-[#E2E8F0] p-4 rounded-lg shadow-ambient flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 ${styles.bg} flex items-center justify-center rounded-md shrink-0`}>
                      {isExternal ? <ExternalLink className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-label-md font-semibold truncate" title={res.title}>
                        {res.title}
                      </h4>
                      <span className="text-label-sm text-[#737686] block mt-0.5 truncate">
                        {subCode} • {styles.label}
                      </span>
                    </div>
                  </div>
                  
                  <a 
                    href={res.url}
                    target={isExternal ? '_blank' : '_self'}
                    rel="noreferrer"
                    className="p-2 border border-[#E2E8F0] hover:bg-surface-container rounded-sm text-[#737686] hover:text-on-surface shrink-0 transition-colors cursor-pointer ml-2 animate-none"
                  >
                    {isExternal ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  </a>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* DESKTOP LAYOUT: Recent Materials */}
      <div className="hidden lg:flex bg-white border border-[#E2E8F0] p-5 rounded-lg shadow-ambient flex-col gap-4 relative font-inter text-on-surface">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5" />
          <h2 className="text-headline-md font-semibold">Recent Materials</h2>
        </div>

        <div className="flex flex-col gap-3">
          {recentListDesktop.length === 0 ? (
            <p className="text-body-md text-[#737686] italic text-center py-2">No resources available.</p>
          ) : (
            recentListDesktop.map(res => {
              const subject = (subjects || []).find(s => s.id === res.subjectId);
              const subName = subject ? subject.name : '';
              const styles = getResourceTypeStyles(res.type);
              const isExternal = res.type === 'LINK';

              return (
                <a 
                  key={res.id} 
                  href={res.url} 
                  target={isExternal ? '_blank' : '_self'}
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-surface rounded-md border border-[#E2E8F0] hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <div className={`w-9 h-9 ${styles.bg} flex items-center justify-center rounded-md shrink-0`}>
                    {isExternal ? <ExternalLink className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-label-md font-semibold truncate" title={res.title}>
                      {res.title}
                    </h4>
                    <span className="text-label-sm text-[#737686]">
                      {res.size || 'Attachment'} • {styles.label} {subName && `• ${subName}`}
                    </span>
                  </div>
                </a>
              );
            })
          )}
        </div>
      </div>
    </>
  )
}

export default RecentMaterials
