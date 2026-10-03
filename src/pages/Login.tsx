import { useState } from "react";
import {
    Inventory2Outlined,
    LockOutlined,
    VisibilityOffOutlined,
    VisibilityOutlined,
} from "@mui/icons-material";
import {
    Alert,
    Button,
    IconButton,
    InputAdornment,
    TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";

export function Login({
    onLogin,
}: {
    onLogin: (user: {
        id: string | number;
        name: string;
        email: string;
        role: string;
    }) => void;
}) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("admin@stockroom.io");
    const [password, setPassword] = useState("stockroom24");
    const [showPassword, setShowPassword] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
            setError("Enter a valid work email address.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setBusy(true);
        try {
            const user = await login(email.trim(), password);
            onLogin(user);
            navigate("/", { replace: true });
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "Unable to sign in. Check that the mock API is running."
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="app-shell grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_.95fr]">
            <section className="relative hidden min-h-screen overflow-hidden bg-[#173d2c] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
                <div className="absolute -right-20 top-24 h-80 w-80 rounded-full border border-white/10" />
                <div className="absolute -right-2 top-40 h-56 w-56 rounded-full border border-white/10" />
                <div className="absolute bottom-[-120px] left-[-65px] h-96 w-96 rounded-full bg-[#286b4b]/45" />
                <div className="relative flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10">
                        <Inventory2Outlined />
                    </span>
                    <span className="font-heading text-lg font-extrabold">Stockroom</span>
                </div>
                <div className="relative max-w-xl pb-5">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-[#c2dfca]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#9bd3ad]" /> Your
                        store, in good order
                    </div>
                    <h1 className="font-heading mb-5 text-4xl font-extrabold leading-[1.13] xl:text-5xl">
                        Clarity for every corner of your inventory.
                    </h1>
                    <p className="max-w-md text-sm leading-6 text-white/65">
                        A calmer way to manage products, orders and the people who keep your
                        business moving.
                    </p>
                    <div className="mt-12 grid max-w-lg grid-cols-3 gap-3">
                        <div className="border-t border-white/20 pt-3">
                            <span className="font-heading block text-xl font-bold">Live</span>
                            <span className="mt-1 block text-[10px] text-white/55">
                                stock visibility
                            </span>
                        </div>
                        <div className="border-t border-white/20 pt-3">
                            <span className="font-heading block text-xl font-bold">One</span>
                            <span className="mt-1 block text-[10px] text-white/55">
                                connected workspace
                            </span>
                        </div>
                        <div className="border-t border-white/20 pt-3">
                            <span className="font-heading block text-xl font-bold">
                                Simple
                            </span>
                            <span className="mt-1 block text-[10px] text-white/55">
                                everyday operations
                            </span>
                        </div>
                    </div>
                </div>
                <p className="relative mb-0 text-[10px] text-white/45">
                    © 2026 Stockroom operations
                </p>
            </section>
            <section className="flex min-h-screen flex-col bg-[#fbfcfa] px-6 py-6 sm:px-12 lg:px-14">
                <div className="flex items-center gap-2 lg:hidden">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#246b4b] text-white">
                        <Inventory2Outlined fontSize="small" />
                    </span>
                    <span className="font-heading font-extrabold">Stockroom</span>
                </div>
                <div className="flex flex-1 items-center justify-center py-12">
                    <div className="w-full max-w-[380px]">
                        <div className="mb-8">
                            <p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-[#6c957b]">
                                Admin portal
                            </p>
                            <h2 className="font-heading mb-2 text-3xl font-extrabold">
                                Welcome back
                            </h2>
                            <p className="m-0 text-sm text-[#7a857c]">
                                Sign in to your Stockroom workspace.
                            </p>
                        </div>
                        <form onSubmit={submit} className="space-y-5" noValidate>
                            <div className="mb-6">
                                <TextField
                                    fullWidth
                                    label="Work email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    autoComplete="username"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    autoComplete="current-password"
                                    required
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockOutlined sx={{ fontSize: 18, color: "#819087" }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label={
                                                            showPassword ? "Hide password" : "Show password"
                                                        }
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? (
                                                            <VisibilityOffOutlined fontSize="small" />
                                                        ) : (
                                                            <VisibilityOutlined fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </div>
                            {error && (
                                <Alert severity="error" sx={{ fontSize: 12 }}>
                                    {error}
                                    {error.includes("fetch") && (
                                        <span>
                                            {" "}
                                            Start the API with <code>npm run server</code>.
                                        </span>
                                    )}
                                </Alert>
                            )}
                            <div className="pt-2">
                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    disabled={busy}
                                    sx={{
                                        py: 1.35,
                                        bgcolor: "#246b4b",
                                        "&:hover": { bgcolor: "#194d36" },
                                        textTransform: "none",
                                        fontWeight: 700,
                                        borderRadius: 2,
                                    }}
                                >
                                    {busy ? "Signing in…" : "Sign in to dashboard"}
                                </Button>
                            </div>
                        </form>
                        <div className="mt-7 rounded-lg border border-[#e8ece7] bg-white p-3.5">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#819087]">
                                Demo access
                            </p>
                            <p className="m-0 text-xs text-[#667168]">
                                admin@stockroom.io{" "}
                                <span className="mx-1.5 text-[#c4ccc5]">/</span> stockroom24
                            </p>
                        </div>
                    </div>
                </div>
                <p className="mb-0 text-center text-[10px] text-[#99a19a]">
                    Secure access for Stockroom administrators{" "}
                    <span className="mx-1.5">·</span> Need help? Contact support
                </p>
            </section>
        </main>
    );
}
