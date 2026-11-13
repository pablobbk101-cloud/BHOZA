// Cloudflare Pages Function: POST /api/contact
// Receives the enquiry form, validates it and emails it via Resend (https://resend.com, free tier).
//
// Set these in Cloudflare Pages > Settings > Variables and Secrets:
//   RESEND_API_KEY  (secret)  your Resend API key
//   CONTACT_TO                where enquiries go. TODO: Bhoza's real enquiries address
//   CONTACT_FROM              a sender on a domain verified in Resend, e.g. "Bhoza Mphela website <enquiries@bhoza.co.za>"
//
// Prefer Formspree instead? Put your Formspree URL in content/site.json -> "formEndpoint" and this function is not used.

const CATEGORIES = {
  marketing: 'Marketing and consulting',
  dj: 'DJ bookings',
  mc: 'MC and hosting bookings',
  speaking: 'Speaking engagements',
  events: 'Event collaborations',
  partnerships: 'Partnerships and sponsorships',
  general: 'General business enquiries',
};
const TODO_TO = 'TODO-enquiries@bhoza.co.za'; // TODO: replace, or set CONTACT_TO

export async function onRequestPost({ request, env }) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const reply = (status, body) => wantsJson
    ? new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
    : status < 400
      ? Response.redirect(new URL('/contact/?sent=1#enquiry', request.url).toString(), 303)
      : new Response(`<!doctype html><meta charset="utf-8"><title>Enquiry not sent</title><p>${body.error}</p><p><a href="/contact/">Back to the form</a></p>`, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });

  let form;
  try { form = await request.formData(); } catch { return reply(400, { ok: false, error: 'The form could not be read.' }); }
  const get = (k, max = 5000) => String(form.get(k) || '').trim().slice(0, max);

  // Bots fill the hidden field; pretend it worked.
  if (get('website')) return reply(200, { ok: true });

  const data = {
    name: get('name', 120), email: get('email', 200), phone: get('phone', 40), organisation: get('organisation', 160),
    category: CATEGORIES[get('category')] ? get('category') : '', date: get('date', 20), location: get('location', 160), message: get('message'),
  };
  const errors = {};
  if (!data.name) errors.name = 'Name is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.email = 'A valid email is required.';
  if (!data.category) errors.category = 'Choose a category.';
  if (data.message.length < 20) errors.message = 'Please add a few more details.';
  if (Object.keys(errors).length) return reply(422, { ok: false, error: 'Please check the highlighted fields.', errors });

  const label = CATEGORIES[data.category];
  const text = [
    `New enquiry from the website: ${label}`, '',
    `Name: ${data.name}`, `Email: ${data.email}`,
    data.phone && `Phone: ${data.phone}`, data.organisation && `Organisation: ${data.organisation}`,
    data.date && `Event date: ${data.date}`, data.location && `City or venue: ${data.location}`,
    '', data.message,
  ].filter((l) => l !== '' && l !== undefined && l !== false).join('\n');

  if (!env.RESEND_API_KEY) {
    // Local preview (scripts/serve.mjs sets DEV_ECHO): log instead of sending.
    if (env.DEV_ECHO) { console.log('\n--- enquiry (not sent, no RESEND_API_KEY) ---\n' + text + '\n'); return reply(200, { ok: true, dev: true }); }
    return reply(503, { ok: false, error: 'Email is not configured yet.' });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM || 'Bhoza Mphela website <onboarding@resend.dev>',
      to: [env.CONTACT_TO || TODO_TO],
      reply_to: data.email,
      subject: `[${label}] ${data.name}${data.organisation ? `, ${data.organisation}` : ''}`,
      text,
    }),
  });
  if (!res.ok) return reply(502, { ok: false, error: 'The message could not be delivered. Please email directly.' });
  return reply(200, { ok: true });
}
