import { NextResponse } from "next/server";

/** Vercel ayar kontrolü — gizli anahtarları göstermez. */
export async function GET() {
  return NextResponse.json({
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.length),
    supabaseAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length),
    serviceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.length),
    adminPassword: Boolean(process.env.ADMIN_PASSWORD?.length),
    branchPanel: Boolean(process.env.BRANCH_PANEL_PASSWORD?.length),
    displayKey: Boolean(process.env.DISPLAY_ACCESS_KEY?.length),
    branchId: Boolean(process.env.BRANCH_PANEL_BRANCH_ID?.length),
    cronSecret: Boolean(process.env.CRON_SECRET?.length),
    resendApiKey: Boolean(process.env.RESEND_API_KEY?.length),
    siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.length),
  });
}
