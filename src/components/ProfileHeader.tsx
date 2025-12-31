import { UserResource } from "@clerk/types";

const ProfileHeader = ({ user }: { user: UserResource | null | undefined }) => {
  if (!user) return null;
  return (
    <div className="mb-10 relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative">
          {user.imageUrl ? (
            <div className="relative w-24 h-24 overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl">
              <img
                src={user.imageUrl}
                alt={user.fullName || "Profile"}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
              <span className="text-4xl font-bold text-white">
                {user.fullName?.charAt(0) || "U"}
              </span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-4 border-white dark:border-slate-900 shadow-lg"></div>
        </div>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {user.fullName}
            </h1>
            <div className="flex items-center bg-green-50 dark:bg-green-950/30 backdrop-blur-sm border border-green-200 dark:border-green-800/50 rounded-xl px-4 py-2 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
              <p className="text-xs font-semibold text-green-700 dark:text-green-400">USER ACTIVE</p>
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-purple-500/50 my-3"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {user.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;




