import { GraduationCap, ShieldCheck, Mail } from 'lucide-react'

const Profile = ({ user }) => {
  if (!user) {
    return <div className="p-8 text-center text-body-lg text-outline font-semibold">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-inter text-on-surface">
      {/* Profile Header */}
      <section className="bg-white border border-[#E2E8F0] shadow-ambient rounded-xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
            alt="Student Avatar"
            className="w-24 h-24 rounded-lg object-cover border border-[#E2E8F0] shadow-sm"
          />
          <div className="absolute -bottom-1 -right-1 bg-primary text-white w-8 h-8 rounded-full grid place-items-center border-2 border-white shadow-sm">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <p className="text-label-sm uppercase tracking-widest text-[#737686] font-semibold">
            Institutional Student Account
          </p>
          <h1 className="text-display text-on-surface mt-1 leading-tight">
            {user.name}
          </h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-body-md text-[#737686]">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" /> {user.email}
            </span>
          </div>
        </div>
      </section>

      {/* Academic Information Details Card */}
      <section className="bg-white border border-[#E2E8F0] shadow-ambient rounded-xl p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface">Academic Details</h2>
          <p className="text-body-md text-[#737686] mt-0.5">Official curriculum details synced from Palacký University STAG system.</p>
        </div>

        <div className="border-t border-[#E2E8F0] pt-6 grid gap-4 sm:grid-cols-2">
          {/* University */}
          <div className="rounded-lg bg-[#F2F4F6] border border-[#E2E8F0]/40 p-4">
            <p className="text-label-sm text-[#737686] uppercase font-bold tracking-wider">University</p>
            <p className="mt-2 text-headline-md font-semibold text-on-surface">{user.university || "Palacký University Olomouc"}</p>
          </div>

          {/* Faculty */}
          <div className="rounded-lg bg-[#F2F4F6] border border-[#E2E8F0]/40 p-4">
            <p className="text-label-sm text-[#737686] uppercase font-bold tracking-wider">Faculty</p>
            <p className="mt-2 text-headline-md font-semibold text-on-surface">{user.faculty || "Faculty of Science"}</p>
          </div>

          {/* Program */}
          <div className="rounded-lg bg-[#F2F4F6] border border-[#E2E8F0]/40 p-4">
            <p className="text-label-sm text-[#737686] uppercase font-bold tracking-wider">Study Program</p>
            <p className="mt-2 text-headline-md font-semibold text-on-surface">{user.program || "Applied Informatics"}</p>
          </div>

          {/* Academic Year */}
          <div className="rounded-lg bg-[#F2F4F6] border border-[#E2E8F0]/40 p-4">
            <p className="text-label-sm text-[#737686] uppercase font-bold tracking-wider">Academic Year</p>
            <p className="mt-2 text-headline-md font-semibold text-on-surface">{user.year || "1st Year"}</p>
          </div>
        </div>

        {/* STAG Connection Status */}
        <div className="border-t border-[#E2E8F0] pt-6 flex flex-col items-center sm:flex-row sm:gap-0 gap-3 justify-between bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 mt-2">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-label-md font-bold text-emerald-950 leading-tight">STAG System Connection</h4>
              <p className="text-sm sm:text-[18px] text-body-sm text-emerald-800 mt-0.5">Grades, deadlines, and schedule courses are fully connected.</p>
            </div>
          </div>
          <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-sm shadow-sm">
            Connected
          </span>
        </div>
      </section>
    </div>
  )
}

export default Profile
