import { cn } from "@/lib/utils";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
    mode?: 'signin' | 'signup';
    onSubmit?: (data: { email: string; password: string; name?: string }) => void;
    isLoading?: boolean;
    error?: string;
}

export default function LoginForm({
    mode = 'signin',
    onSubmit,
    isLoading = false,
    error
}: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({ email, password, name: mode === 'signup' ? name : undefined });
        }
    };

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side Image */}
            <div className="w-full hidden md:inline-block">
                <img
                    className="h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop"
                    alt="Office workspace"
                />
            </div>

            {/* Right Side Form */}
            <div className="w-full flex flex-col items-center justify-center px-4 bg-white">
                <form onSubmit={handleSubmit} className="md:w-96 w-80 flex flex-col items-center justify-center">
                    <h2 className="text-4xl text-gray-900 font-medium">
                        {mode === 'signin' ? 'Entrar' : 'Criar Conta'}
                    </h2>
                    <p className="text-sm text-gray-500/90 mt-3">
                        {mode === 'signin'
                            ? 'Bem-vindo de volta! Entre para continuar'
                            : 'Crie sua conta e comece a criar quizzes incríveis'}
                    </p>

                    {/* Google Sign In Button */}
                    <button
                        type="button"
                        className="w-full mt-8 bg-gray-500/10 flex items-center justify-center h-12 rounded-full hover:bg-gray-500/20 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="ml-2 text-gray-700">Continuar com Google</span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 w-full my-5">
                        <div className="w-full h-px bg-gray-300/90"></div>
                        <p className="w-full text-nowrap text-sm text-gray-500/90">
                            ou {mode === 'signin' ? 'entre' : 'cadastre-se'} com email
                        </p>
                        <div className="w-full h-px bg-gray-300/90"></div>
                    </div>

                    {/* Name Input (only for signup) */}
                    {mode === 'signup' && (
                        <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2 mb-4">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 8a4 4 0 100-8 4 4 0 000 8zM8 10c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" fill="#6B7280" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Nome completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full pr-6"
                                required
                            />
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full pr-6"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <Lock className="w-4 h-4 text-gray-500" />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="pr-6 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="w-full mt-4 p-3 bg-red-50 border border-red-200 rounded-full text-center">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Remember Me & Forgot Password (only for signin) */}
                    {mode === 'signin' && (
                        <div className="w-full flex items-center justify-between mt-8 text-gray-500/80">
                            <div className="flex items-center gap-2">
                                <input
                                    className="h-5 w-5 rounded"
                                    type="checkbox"
                                    id="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label className="text-sm cursor-pointer" htmlFor="checkbox">Lembrar-me</label>
                            </div>
                            <a className="text-sm underline hover:text-indigo-500" href="/forgot-password">Esqueceu a senha?</a>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-8 w-full h-11 rounded-full text-white bg-indigo-500 hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            mode === 'signin' ? 'Entrar' : 'Criar Conta'
                        )}
                    </button>

                    {/* Sign Up / Sign In Link */}
                    <p className="text-gray-500/90 text-sm mt-4">
                        {mode === 'signin' ? (
                            <>Não tem uma conta? <a className="text-indigo-500 hover:underline" href="/register">Cadastre-se</a></>
                        ) : (
                            <>Já tem uma conta? <a className="text-indigo-500 hover:underline" href="/login">Entrar</a></>
                        )}
                    </p>
                </form>
            </div>
        </div>
    );
}
