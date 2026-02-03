// src/components/auth/AuthLayout.tsx

export const AuthOverlay = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 
                  bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
    {children}
  </div>
);

export const AuthCard = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white w-full max-w-[400px] rounded-[3rem] 
                  /* Shadow 2xl cực mạnh để tạo độ nổi khối */
                  shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] 
                  relative overflow-hidden px-10 py-12 
                  border border-slate-50
                  animate-in fade-in zoom-in-95 duration-500">
    {children}
  </div>
);