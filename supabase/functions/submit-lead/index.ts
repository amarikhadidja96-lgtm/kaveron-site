import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const DEFAULT_SALT = "kaveron_secure_ip_salt_2026";

async function hashIp(ip: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${ip}:${salt}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const siteUrl = Deno.env.get("SITE_URL") || "";

  let allowedOrigin = siteUrl;
  if (
    !siteUrl ||
    origin === siteUrl ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.startsWith("https://localhost:")
  ) {
    allowedOrigin = origin || "*";
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // 1. Honeypot check: reject bots immediately without saving or emailing
    if (body.honeypot && String(body.honeypot).trim() !== "") {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Validate required fields
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const serviceType = typeof body.service_type === "string" ? body.service_type.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : null;
    const budget = typeof body.budget === "string" ? body.budget.trim() : null;
    const selectedPlan = typeof body.selected_plan === "string" ? body.selected_plan.trim() : null;
    const rawSource = typeof body.source === "string" ? body.source.trim() : "contact_form";
    const source = rawSource === "chatbot" ? "chatbot" : "contact_form";
    const rawLang = typeof body.language === "string" ? body.language.trim() : "en";
    const language = rawLang === "ar" ? "ar" : "en";

    if (!name || name.length > 120) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid name format or length" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!email || email.length > 255 || !EMAIL_REGEX.test(email)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!message || message.length > 5000) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid message length" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!serviceType || serviceType.length > 100) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid service type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (phone && phone.length > 50) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid phone length" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (budget && budget.length > 50) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid budget length" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Extract and hash client IP
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "0.0.0.0";

    const salt = Deno.env.get("IP_HASH_SALT") || DEFAULT_SALT;
    const ipHash = await hashIp(clientIp, salt);

    // 4. Initialize Supabase Admin Client (Service Role Key)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in edge function environment.");
      return new Response(JSON.stringify({ ok: false, error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    // 5. Rate Limiting: Max 5 submissions per hour per hashed IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", oneHourAgo);

    if (countError) {
      console.error("Rate limit check error:", countError);
    } else if (count !== null && count >= 5) {
      return new Response(
        JSON.stringify({ ok: false, error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 6. Insert lead into database
    const { data: newLead, error: insertError } = await supabase
      .from("leads")
      .insert({
        name,
        email,
        phone,
        service_type: serviceType,
        budget,
        message,
        source,
        selected_plan: selectedPlan,
        status: "new",
        language,
        ip_hash: ipHash,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(JSON.stringify({ ok: false, error: "Failed to submit lead" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 7. Optional Email Notification via Resend (skip if missing without failing request)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("NOTIFY_EMAIL");

    if (resendApiKey && notifyEmail) {
      try {
        const emailSubject = `[Kaveron] New Lead: ${name} (${serviceType})`;
        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0A0A0A; color: #E4E4E7; border-radius: 12px; border: 1px solid #27272A;">
            <div style="border-bottom: 1px solid #27272A; padding-bottom: 16px; margin-bottom: 20px;">
              <span style="color: #00FF88; font-family: monospace; font-weight: bold; font-size: 14px;">// NEW INQUIRY RECEIVED</span>
              <h2 style="color: #FFFFFF; margin: 8px 0 0 0; font-size: 20px;">${name}</h2>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #A1A1AA; width: 130px;">Email:</td>
                <td style="padding: 8px 0; color: #00FF88;"><a href="mailto:${email}" style="color: #00FF88; text-decoration: none;">${email}</a></td>
              </tr>
              ${phone ? `<tr><td style="padding: 8px 0; color: #A1A1AA;">Phone:</td><td style="padding: 8px 0; color: #FFFFFF;">${phone}</td></tr>` : ""}
              <tr>
                <td style="padding: 8px 0; color: #A1A1AA;">Service Type:</td>
                <td style="padding: 8px 0; color: #FFFFFF; font-weight: bold;">${serviceType}</td>
              </tr>
              ${selectedPlan ? `<tr><td style="padding: 8px 0; color: #A1A1AA;">Plan:</td><td style="padding: 8px 0; color: #FFFFFF;">${selectedPlan}</td></tr>` : ""}
              ${budget ? `<tr><td style="padding: 8px 0; color: #A1A1AA;">Budget:</td><td style="padding: 8px 0; color: #FFFFFF;">${budget}</td></tr>` : ""}
              <tr>
                <td style="padding: 8px 0; color: #A1A1AA;">Language:</td>
                <td style="padding: 8px 0; color: #FFFFFF;">${language.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #A1A1AA;">Source:</td>
                <td style="padding: 8px 0; color: #FFFFFF;">${source}</td>
              </tr>
            </table>
            <div style="background: #141414; padding: 16px; border-radius: 8px; border: 1px solid #27272A; margin-bottom: 20px;">
              <span style="color: #71717A; font-size: 12px; font-family: monospace; display: block; margin-bottom: 8px;">MESSAGE / PROJECT DETAILS:</span>
              <p style="margin: 0; color: #FFFFFF; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
            <div style="font-size: 12px; color: #71717A; border-top: 1px solid #27272A; padding-top: 12px;">
              Lead ID: ${newLead.id} &bull; Received: ${new Date().toISOString()}
            </div>
          </div>
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Kaveron Leads <onboarding@resend.dev>",
            to: [notifyEmail],
            subject: emailSubject,
            html: emailHtml,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send Resend email notification (non-fatal):", emailErr);
      }
    }

    // 8. Return success response
    return new Response(JSON.stringify({ ok: true, id: newLead.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unhandled submit-lead error:", err);
    return new Response(JSON.stringify({ ok: false, error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

