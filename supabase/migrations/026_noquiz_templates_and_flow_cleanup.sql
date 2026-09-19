-- 026_noquiz_templates_and_flow_cleanup.sql
-- 1. Quiz-free follow-up templates. sendFlowEmail() uses the `_noquiz` twin of a
--    template for leads with no quiz report (manual / contact form / business
--    card), so they never see "your score is 0/100" copy. No quiz variables here.
-- 2. Flow cleanup: give the three flows real names, and add the missing 7-day
--    wait between follow-up 3 and follow-up 4 on the warmed-up branch of the
--    default flow (node ids are preserved so in-flight leads keep their place).
-- Run in Supabase SQL editor: project xcifmbfxatkunsjoozyv

insert into public.email_templates (id, label, timing, subject, heading, paragraphs, cta_text) values
('followup_1_noquiz',
 'No quiz — Follow-up 1',
 'Day 1 after being added',
 '{firstName}, great connecting with you',
 'Good to connect, {firstName}',
 ARRAY[
   'Thank you again for your time. I wanted to follow up now that we have connected.',
   'My goal is simple: help you see where you and your family stand if something unexpected happens, and give you clear options. No pressure and no jargon.',
   'If you have 15 minutes this week, I would love to hear what matters most to you right now. Or just reply to this email. I read every message. 😊'
 ],
 'Book a Free 15-min Call →'),

('followup_2_noquiz',
 'No quiz — Follow-up 2',
 'Day 3 after being added',
 'The #1 mistake Filipinos make with insurance 📋',
 'The #1 mistake Filipinos make with their finances 📋',
 ARRAY[
   'It is not about not saving enough. It is about saving before protecting.',
   'Most Filipinos I talk to have their priorities flipped. They are building savings and investments, but they have not secured the foundation yet.',
   'If something happens to you before that foundation is set, everything you have built can disappear overnight.',
   'The good news: closing that gap can start small, and a short conversation costs nothing. Let us look at where you stand.'
 ],
 'Let''s Talk →'),

('followup_3_noquiz',
 'No quiz — Follow-up 3',
 'Day 7 after being added',
 '{firstName}, is now a good time to talk?',
 'Ready to look at your protection? 🛡️',
 ARRAY[
   'It has been a little while since we connected. A lot of people tell me they mean to deal with this "soon." But soon has a way of becoming never, and the cost of waiting is always higher than the cost of starting.',
   'I am not here to pressure you. I just want to make sure you have the information you need to make the right call for you and your family.',
   'If now is a good time, let us talk. If not, no worries. Just let me know when works.'
 ],
 'Let''s Talk →'),

('followup_4_noquiz',
 'No quiz — Follow-up 4',
 'Day 14 after being added',
 'A quick story about someone in your situation 💛',
 'She almost didn''t do it. Then one phone call changed everything.',
 ARRAY[
   'Ana was 29, working in Makati, and kept telling herself she would "deal with insurance later." She was not sick, she had her HMO, and money was tight after rent.',
   'Then her dad got diagnosed. The bills hit fast. Her family scrambled. And Ana realized her HMO only covered her, not them.',
   'She called me three months after that. We set up her plan in two meetings. She told me later it was the one thing that gave her peace of mind during the hardest year of her life.',
   '{firstName}, I do not know your story. But if Ana''s sounds familiar, let us talk. No pressure, no sales pitch. Just clarity.'
 ],
 'Book a Free Call →')
on conflict (id) do nothing;

-- Flow names
update public.automation_flows set name = 'Default (all leads)'  where id = '3ff0fc10-5f7d-4696-a605-92084c8748b4';
update public.automation_flows set name = 'Doctors (manual)'     where id = 'fe14ba3e-ca05-41e8-b5bc-86afd727b8c3';
update public.automation_flows set name = 'Old draft (inactive)' where id = '8287483f-1056-4041-a3ab-cbfa7511ab49';

-- Default flow: wait 7 days between follow-up 3 (node 13) and follow-up 4 (node 15)
update public.automation_flows
set flow_json = jsonb_build_object(
  'nodes', (flow_json->'nodes') || '[{"id":"16","type":"wait","position":{"x":397,"y":1220},"data":{"type":"wait","label":"Wait 7 days","days":7}}]'::jsonb,
  'edges', (
    select jsonb_agg(case when e->>'id' = 'e14' then jsonb_set(e, '{target}', '"16"') else e end)
    from jsonb_array_elements(flow_json->'edges') e
  ) || '[{"id":"e16","source":"16","target":"15","sourceHandle":null}]'::jsonb
)
where id = '3ff0fc10-5f7d-4696-a605-92084c8748b4'
  and not exists (select 1 from jsonb_array_elements(flow_json->'nodes') n where n->>'id' = '16');
