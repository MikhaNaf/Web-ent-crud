import { useState } from "react";
import type { FormEvent } from 'react';
import supabase from "../utils/supabase";
import { alertError } from "../utils/alert";
import { useNavigate, Link } from "react-router-dom";
import { useLocalStorage } from "react-use";
import type { UserResponseDTO } from "../dtos/user.response.dto";

// 1. IMPORT GAMBAR DI SINI
import loginBgImage from '../assets/Gemini_Generated_Image_ut7lcvut7lcvut7l.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setToken] = useLocalStorage("token", "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      alertError(error.message);
      return;
    }
    const userData: UserResponseDTO = Object.assign(data);
    console.log(data);
    console.log(userData);
    console.log('Login successfully', userData.session.access_token);
    navigate('/dashboard');
    setToken(userData.session.access_token);
  };

  return (
    <div>
      <main className="mt-0 transition-all duration-200 ease-in-out">
        <section>
          <div className="relative flex items-center min-h-screen p-0 overflow-hidden bg-center bg-cover">
            <div className="container z-1">
              <div className="flex flex-wrap -mx-3">
                <div className="flex flex-col w-full max-w-full px-3 mx-auto lg:mx-0 shrink-0 md:flex-0 md:w-7/12 lg:w-5/12 xl:w-4/12">
                  <div className="relative flex flex-col min-w-0 break-words bg-transparent border-0 shadow-none lg:py4 dark:bg-gray-950 rounded-2xl bg-clip-border">
                    <div className="p-6 pb-0 mb-0">
                      <h4 className="font-bold">Sign In</h4>
                      <p className="mb-0">Enter your email and password to sign in</p>
                    </div>
                    <div className="flex-auto p-6">
                      <form role="form" onSubmit={handleSubmit}>
                        <div className="mb-4">
                          <input type="email" placeholder="Email" className="focus:shadow-primary-outline dark:bg-gray-950 dark:placeholder:text-white/80 dark:text-white/80 text-sm leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding p-3 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-fuchsia-300 focus:outline-none"
                            value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="mb-4">
                          <input type="password" placeholder="Password" className="focus:shadow-primary-outline dark:bg-gray-950 dark:placeholder:text-white/80 dark:text-white/80 text-sm leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding p-3 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-fuchsia-300 focus:outline-none"
                            value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="text-center">
                          <button type="submit" className="inline-block w-full px-16 py-3.5 mt-6 mb-0 font-bold leading-normal text-center text-white align-middle transition-all bg-blue-500 border-0 rounded-lg cursor-pointer hover:-translate-y-px active:opacity-85 hover:shadow-xs text-sm ease-in tracking-tight-rem shadow-md bg-150 bg-x-25">Sign in</button>
                        </div>
                      </form>
                    </div>
                    <div className="border-black/12.5 rounded-b-2xl border-t-0 border-solid p-6 text-center pt-0 px-1 sm:px-6">
                      <p className="mx-auto mb-6 leading-normal text-sm">Don't have an account?
                        <Link to="/register" className="font-semibold text-transparent bg-clip-text bg-gradient-to-tl from-blue-500 to-violet-500"> Sign up</Link>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 flex-col justify-center hidden w-6/12 h-full max-w-full px-3 pr-0 my-auto text-center flex-0 lg:flex">
                  {/* 2. GUNAKAN GAMBAR DENGAN INLINE STYLE */}
                  <div 
                    className="relative flex flex-col justify-center h-full bg-cover px-24 m-4 overflow-hidden rounded-xl"
                    style={{ backgroundImage: `url(${loginBgImage})` }}
                  >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}