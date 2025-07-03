import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";

// Impor ikon untuk password visibility
import { FiEye, FiEyeOff } from "react-icons/fi";

// Konstanta untuk kelas CSS agar lebih rapi
const inputClasses = "placeholder:text-gray-500 text-sm focus:shadow-primary-outline leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:border-blue-500 focus:bg-white focus:text-gray-700 focus:outline-none focus:transition-shadow";
const buttonClasses = "inline-block w-full px-5 py-2.5 mt-6 mb-2 font-bold text-center text-white align-middle transition-all bg-transparent border-0 rounded-lg cursor-pointer active:opacity-85 hover:-translate-y-px hover:shadow-xs leading-normal text-sm ease-in tracking-tight-rem shadow-md bg-150 bg-x-25 bg-gradient-to-tl from-zinc-800 to-zinc-700 hover:border-slate-700 hover:bg-slate-700 hover:text-white";

export default function UserRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const navigate = useNavigate();

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (password.length < 6) {
        setMessage({ type: "error", text: "Password harus terdiri dari minimal 6 karakter." });
        setLoading(false);
        return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else if (data.user) {
      // Menampilkan pesan sukses dan memberitahu akan diarahkan
      setMessage({ type: "success", text: "Registrasi berhasil! Mengarahkan ke halaman login..." });
      
      // Arahkan ke halaman login setelah 2 detik agar pesan sempat terbaca
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
    setLoading(false);
  }

  return (
    <main className="mt-0 transition-all duration-200 ease-in-out">
      <section className="min-h-screen">
        <div className="bg-top relative flex items-start pt-12 pb-56 m-4 overflow-hidden bg-cover min-h-50-screen rounded-xl bg-[url('https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signup-cover.jpg')]">
          <span className="absolute top-0 left-0 w-full h-full bg-center bg-cover bg-gradient-to-tl from-zinc-800 to-zinc-700 opacity-60" />
          <div className="container z-10">
            <div className="flex flex-wrap justify-center -mx-3">
              <div className="w-full max-w-full px-3 mx-auto mt-0 text-center lg:flex-0 shrink-0 lg:w-5/12">
                <h1 className="mt-12 mb-2 text-white">Welcome!</h1>
                <p className="text-white">Use these awesome forms to login or create new account in your project for free.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="flex flex-wrap -mx-3 -mt-48 md:-mt-56 lg:-mt-48">
            <div className="w-full max-w-full px-3 mx-auto mt-0 md:flex-0 shrink-0 md:w-7/12 lg:w-5/12 xl:w-4/12">
              <div className="relative z-0 flex flex-col min-w-0 break-words bg-white border-0 shadow-xl rounded-2xl bg-clip-border transform transition-all hover:scale-[1.02] duration-300">
                <div className="p-6 mb-0 text-center bg-white border-b-0 rounded-t-2xl">
                  <h5>Register Your Account</h5>
                </div>
                
                <div className="flex-auto p-6">
                  <form role="form text-left" onSubmit={handleRegister}>
                    {/* Pesan Sukses atau Error */}
                    {message.text && (
                      <div className={`p-3 mb-4 text-center text-sm rounded-lg ${
                          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {message.text}
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <input type="email" className={inputClasses} placeholder="Email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="relative mb-4">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={inputClasses}
                        placeholder="Password"
                        aria-label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 cursor-pointer">
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <button type="submit" className={`${buttonClasses} disabled:opacity-50 disabled:cursor-not-allowed`} disabled={loading}>
                        {loading ? (
                            <div className="flex items-center justify-center">
                              <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </div>
                        ) : 'Sign Up'}
                      </button>
                    </div>

                    <p className="mt-4 mb-0 leading-normal text-center text-sm">
                      Already have an account? <Link to="/" className="font-bold text-slate-700 hover:text-blue-500 transition-colors">Sign in</Link>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="py-12">
        <div className="container">
          <div className="flex flex-wrap -mx-3">
            <div className="w-8/12 max-w-full px-3 mx-auto mt-1 text-center flex-0">
              <p className="mb-0 text-slate-400">Copyright © Argon Dashboard 2 by Creative Tim.</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}