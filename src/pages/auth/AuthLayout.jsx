import React from "react";
import { Outlet } from "react-router-dom";
import {
  Globe2,
  FileText,
  Users,
  ShoppingCart,
  Megaphone,
  Store,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const AuthLayout = () => {
  const features = [
    {
      icon: Globe2,
      title: "Website & SEO",
      text: "Build and grow your online presence",
    },
    {
      icon: FileText,
      title: "Content & Blog",
      text: "Create content that drives traffic",
    },
    {
      icon: Users,
      title: "CRM & Leads",
      text: "Capture and convert more leads",
    },
    {
      icon: ShoppingCart,
      title: "Sales Management",
      text: "Track orders and business growth",
    },
    {
      icon: Megaphone,
      title: "Marketing",
      text: "Automate your marketing campaigns",
    },
    {
      icon: Store,
      title: "Store Management",
      text: "Manage products and your store",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* =========================
            LEFT PANEL
        ========================== */}
        <div className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col">
          {/* Background decoration */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-[450px] w-[450px] rounded-full bg-indigo-500/20 blur-3xl" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
            {/* Logo */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg shadow-blue-900/30">
                  <img
                    src="https://app.brielix.com/favicon.png"
                    alt="Brielix"
                    className="h-8 w-8 object-contain"
                  />
                </div>

                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    Brielix
                  </h1>

                  <p className="text-xs font-medium text-slate-400">
                    Business Management Platform
                  </p>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="max-w-2xl py-6">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-blue-200 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                Everything your business needs
              </div>

              <h2 className="text-4xl font-bold leading-[1.12] tracking-tight text-white xl:text-5xl">
                Run your entire business
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  from one powerful platform.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-400">
                Manage your website, SEO, content, products, sales, leads,
                customers, marketing automation and team — all from one
                beautifully connected workspace.
              </p>

              {/* Feature cards */}
              <div className="mt-9 grid grid-cols-2 gap-3">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="group rounded-2xl border border-white/[0.08] bg-white/[0.045] p-4 backdrop-blur-sm transition-all duration-300 hover:border-blue-400/30 hover:bg-white/[0.08]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                          <Icon className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            {feature.title}
                          </h3>

                          <p className="mt-1 text-[11px] leading-4 text-slate-500">
                            {feature.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

             
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/10 pt-5">
              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} Brielix. All rights reserved.
              </p>

              
            </div>
          </div>
        </div>

        {/* =========================
            RIGHT AUTH PANEL
        ========================== */}
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-10 sm:px-8">
          {/* Mobile background decoration */}
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl lg:hidden" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-100/40 blur-3xl lg:hidden" />

          <div className="relative z-10 w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-8 flex items-center justify-center lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                  <img
                    src="https://app.brielix.com/favicon.png"
                    alt="Brielix"
                    className="h-7 w-7 object-contain"
                  />
                </div>

                <div>
                  <h1 className="text-lg font-bold text-slate-900">Brielix</h1>
                  <p className="text-[10px] text-slate-500">
                    Business Management Platform
                  </p>
                </div>
              </div>
            </div>

            {/* Auth content */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.15)] sm:p-8">
              <Outlet />
            </div>

            {/* Security footer */}
            <div className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Your account and business data are securely protected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
