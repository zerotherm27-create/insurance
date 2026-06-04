-- Email templates table: allows Jojo to customize email automation
-- content from the admin dashboard without code changes.
-- Template variables: {firstName}, {score}, {scoreLabel}, {gap}

create table if not exists public.email_templates (
  id           text primary key,  -- 'report' | 'followup_1' | 'followup_2' | 'followup_3' | 'followup_4'
  label        text not null,     -- human-readable name shown in admin
  timing       text not null,     -- e.g. 'Immediate', 'Day 1', 'Day 3' etc.
  subject      text not null,
  heading      text not null,
  paragraphs   text[] not null,   -- array of editable body paragraphs
  cta_text     text not null,
  updated_at   timestamptz not null default now()
);

-- Seed defaults matching the current hardcoded email templates
insert into public.email_templates (id, label, timing, subject, heading, paragraphs, cta_text) values

('report',
 'Protection Report',
 'Immediate — sent when lead unlocks their report',
 '{firstName}, here is your Financial Protection Report 🛡️',
 'Your Financial Protection Report 🛡️',
 ARRAY[
   'Hi {firstName}! Here''s what we found based on your answers.',
   'Your protection score is {score}/100 — {scoreLabel}.',
   'Biggest gap we identified: {gap}',
   '{recommendation}',
   '{nextStep}'
 ],
 'Book a Free Call with Jojo →'),

('followup_1',
 'Follow-up 1 — Did you review?',
 'Day 1 after submission',
 '{firstName}, did you review your results?',
 'Hi {firstName}, did you get a chance to review your results?',
 ARRAY[
   'Yesterday you got your Financial Protection Score — {score}/100 ({scoreLabel}).',
   'The biggest thing I noticed: {gap}',
   'If you have 15 minutes this week, I''d love to walk you through what this means for your situation — completely free, no pressure. Just real talk about your options.',
   'Or just reply to this email — I read every message. 😊'
 ],
 'Book a Free 15-min Call →'),

('followup_2',
 'Follow-up 2 — The #1 Mistake',
 'Day 3 after submission',
 'The #1 mistake Filipinos make with insurance 📋',
 'The #1 mistake Filipinos make with their finances 📋',
 ARRAY[
   'It''s not about not saving enough. It''s about saving before protecting.',
   'Most Filipinos I talk to have their priorities flipped. They''re building savings, investing in crypto or VUL — but they haven''t secured the foundation yet.',
   'Here''s the thing: if something happens to you before that foundation is set, everything you''ve built can disappear overnight.',
   'Your score was {score}/100. The gap we flagged — {gap} — is exactly this kind of foundation risk.',
   'Let''s fix that before we talk about anything else.'
 ],
 'Let''s Fix This Together →'),

('followup_3',
 'Follow-up 3 — Ready to close gaps?',
 'Day 7 after submission',
 '{firstName}, ready to close your protection gaps?',
 'Ready to close your protection gaps? 🛡️',
 ARRAY[
   'It''s been a week since you took the Financial Protection Check. Your score was {score}/100 — and the gap we identified was: {gap}',
   'A lot of people tell me they mean to deal with this "soon." But soon has a way of becoming never — and the cost of waiting is always higher than the cost of starting.',
   'I''m not here to pressure you. I just want to make sure you have the information you need to make the right call for your family.',
   'If now is a good time, let''s talk. If not, no worries — just let me know when works.'
 ],
 'Let''s Talk →'),

('followup_4',
 'Follow-up 4 — A story for you',
 'Day 14 after submission',
 'A quick story about someone in your situation 💛',
 'She almost didn''t do it. Then one phone call changed everything.',
 ARRAY[
   'Ana was 29, working in Makati, and kept telling herself she''d "deal with insurance later." She wasn''t sick, she had her HMO, and money was tight after rent.',
   'Then her dad got diagnosed. The bills hit fast. Her family scrambled. And Ana realized her HMO only covered her — not them.',
   'She called me three months after that. We set up her plan in two meetings. She told me later it was the one thing that gave her peace of mind during the hardest year of her life.',
   '{firstName}, I don''t know your story. But I know your score is {score}/100 and that there''s a gap worth closing.',
   'If Ana''s story sounds familiar — let''s talk. No pressure, no sales pitch. Just clarity.'
 ],
 'Book a Free Call →')

on conflict (id) do nothing;
