import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import supabase from "../utils/supabase";
import { alertError } from "../utils/alert";

export default function UserRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    })

    if (error) {
      alertError(error.message);
    } else {
      console.log("Registration successful:", data);      
      // Reset form fields after submission
      setEmail("");
      setPassword("");
    } 
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
              <div className="relative z-0 flex flex-col min-w-0 break-words bg-white border-0 shadow-xl rounded-2xl bg-clip-border">
                <div className="p-6 mb-0 text-center bg-white border-b-0 rounded-t-2xl">
                  <h5>Register Your Account</h5>
                </div>
                <div className="flex-auto p-6">
                  <form role="form text-left" onSubmit={handleRegister}>
                    <div className="mb-4">
                      <input type="email" className="placeholder:text-gray-500 text-sm focus:shadow-primary-outline leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:border-blue-500 focus:bg-white focus:text-gray-700 focus:outline-none focus:transition-shadow" placeholder="Email" aria-label="Email" aria-describedby="email-addon"
                      value={email} onChange={(e)=> setEmail(e.target.value)} />
                    </div>
                    <div className="mb-4">
                      <input type="password" className="placeholder:text-gray-500 text-sm focus:shadow-primary-outline leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:border-blue-500 focus:bg-white focus:text-gray-700 focus:outline-none focus:transition-shadow" placeholder="Password" aria-label="Password" aria-describedby="password-addon" 
                      value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="text-center">
                      <button type="submit" className="inline-block w-full px-5 py-2.5 mt-6 mb-2 font-bold text-center text-white align-middle transition-all bg-transparent border-0 rounded-lg cursor-pointer active:opacity-85 hover:-translate-y-px hover:shadow-xs leading-normal text-sm ease-in tracking-tight-rem shadow-md bg-150 bg-x-25 bg-gradient-to-tl from-zinc-800 to-zinc-700 hover:border-slate-700 hover:bg-slate-700 hover:text-white">Sign up</button>
                    </div>
                    <p className="mt-4 mb-0 leading-normal text-sm">Already have an account? <Link to="/login" className="font-bold text-slate-700">Sign in</Link></p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* -------- START FOOTER 3 w/ COMPANY DESCRIPTION WITH LINKS & SOCIAL ICONS & COPYRIGHT ------- */}
      <footer className="py-12">
        <div className="container">
          <div className="flex flex-wrap -mx-3">
            <div className="w-8/12 max-w-full px-3 mx-auto mt-1 text-center flex-0">
              <p className="mb-0 text-slate-400">
                Copyright ©
                Argon Dashboard 2 by Creative Tim.
              </p>
            </div>
          </div>
        </div>
      </footer>
      {/* -------- END FOOTER 3 w/ COMPANY DESCRIPTION WITH LINKS & SOCIAL ICONS & COPYRIGHT ------- */}
    </main>

  )
}