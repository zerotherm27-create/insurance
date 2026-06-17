-- 014_segment_email_templates.sql
-- Adds 24 segment-specific follow-up email templates (6 segments × 4 follow-ups).
-- The report template stays generic (sent immediately, before any flow branching).
-- Run in Supabase SQL editor: project xcifmbfxatkunsjoozyv

insert into public.email_templates (id, label, timing, subject, heading, paragraphs, cta_text) values

-- ── Young Professional ───────────────────────────────────────────────────────

('followup_1_pro',
 'Pro — Follow-up 1',
 'Day 1 after submission',
 '{firstName}, did you check your score?',
 'Your score is in. Here is what it means for you.',
 ARRAY[
   'Yesterday you got your Financial Protection Score: {score}/100 ({scoreLabel}). The biggest gap I found: {gap}',
   'Here is the thing about being in your position: time is your biggest advantage. Starting protection early means lower premiums and more options. Most people wait until life gets complicated. You do not have to.',
   'If you have 15 minutes this week, let us talk through what this actually means for your situation. No pressure, just clarity.'
 ],
 'Book a Free 15-min Call'),

('followup_2_pro',
 'Pro — Follow-up 2',
 'Day 3 after submission',
 'The advantage you have right now (and how to use it)',
 'The one financial move most young professionals skip',
 ARRAY[
   'Most people in their 20s and 30s focus on investing before they protect. It makes sense on the surface, but the math does not work. Your investments are only safe if your income keeps coming in.',
   'Your score was {score}/100. The gap flagged, {topGapName}, is exactly this kind of foundation risk. And at a starter level of {topGapStarter}, it is more reachable than most people think.',
   'The best time to close this gap is before you have a mortgage, dependants, or a health event on record. That time is now.'
 ],
 'See What This Costs for You'),

('followup_3_pro',
 'Pro — Follow-up 3',
 'Day 7 after submission',
 '{firstName}, your income is your most valuable asset',
 'One gap worth closing before everything else',
 ARRAY[
   'It has been a week since your Financial Protection Check. Your score: {score}/100. The gap: {gap}',
   'Your income right now is funding everything: your lifestyle, your savings, your plans. If that income stopped, how long could you sustain your current life? For most people, the answer is a few months at best.',
   '{topGapName} at the starter level is {topGapStarter}. That is the difference between your financial foundation holding or collapsing. Let us make sure it holds.'
 ],
 'Let Us Talk'),

('followup_4_pro',
 'Pro — Follow-up 4',
 'Day 14 after submission',
 'He started at 26. Here is what happened.',
 'He almost skipped it. Then he did not.',
 ARRAY[
   'Miguel was 26, working in BGC, earning well. He kept telling himself he would deal with insurance "when things settle down." He was healthy, no dependants, no urgency.',
   'Then a close friend got a cancer diagnosis at 28. Watching his friend navigate that without a plan changed everything for Miguel. He called me the next week.',
   '{firstName}, I do not know your story. But I know your score is {score}/100 and that there is a gap worth closing. If now feels like the right time, I am here.'
 ],
 'Book a Free Call'),

-- ── Family / Parent ─────────────────────────────────────────────────────────

('followup_1_family',
 'Family — Follow-up 1',
 'Day 1 after submission',
 '{firstName}, your results are ready to review',
 'Here is what your score says about your family''s protection',
 ARRAY[
   'Yesterday you completed your Financial Protection Check: {score}/100 ({scoreLabel}). The biggest gap I found: {gap}',
   'As a provider, this gap is not just a number. It is the question of what your family''s day-to-day life looks like if your income ever stopped. That is a question worth answering now, not later.',
   'I would love to walk you through what this means and what closing it actually takes. Free, no pressure. Just a real conversation.'
 ],
 'Book a Free 15-min Call'),

('followup_2_family',
 'Family — Follow-up 2',
 'Day 3 after submission',
 'The gap most parents do not see until it is too late',
 'Most parents protect their children. Few protect their income.',
 ARRAY[
   'Here is a pattern I see often: parents prioritise their children''s needs above everything else. School fees, health, future plans. It is love in action.',
   'But here is the blind spot: the whole plan depends on the parent''s income continuing. If that income stops, the children''s stability stops with it. Your score was {score}/100. The gap flagged, {topGapName}, is exactly this kind of risk.',
   'Protecting yourself is protecting your family. That is not a sales line. It is just how the math works.'
 ],
 'See What This Looks Like'),

('followup_3_family',
 'Family — Follow-up 3',
 'Day 7 after submission',
 '{firstName}, what does your family''s plan look like if you can''t work?',
 'The question most providers avoid',
 ARRAY[
   'A week ago you took the Financial Protection Check. Score: {score}/100. Gap: {gap}',
   'I am not asking this to alarm you. I am asking because the families who plan for this scenario are the ones who come through it. The families who do not are the ones I hear the hardest stories from.',
   '{topGapName} at the starter level is {topGapStarter}. That is the floor of protection for the people who depend on you. Let us see if we can get you there.'
 ],
 'Let Us Talk'),

('followup_4_family',
 'Family — Follow-up 4',
 'Day 14 after submission',
 'What her kids remember about that year',
 'She planned ahead. It made all the difference.',
 ARRAY[
   'Cynthia was a breadwinner with two kids in school. Her husband worked but her income was the one carrying the household. She came to me because her friend''s husband had passed suddenly and the family had nothing in place.',
   'We set up her plan in two meetings. Two years later, she was diagnosed with a critical illness. She was out of work for six months. Her plan covered it. Her kids'' schooling continued without interruption.',
   '{firstName}, you took the first step by checking your score. The next step is a conversation. When you are ready, I am here.'
 ],
 'Book a Free Call'),

-- ── OFW ─────────────────────────────────────────────────────────────────────

('followup_1_ofw',
 'OFW — Follow-up 1',
 'Day 1 after submission',
 '{firstName}, your Protection Score is ready',
 'You work hard for them. Let us make sure they are covered.',
 ARRAY[
   'Yesterday you completed your Financial Protection Check: {score}/100 ({scoreLabel}). The biggest gap I found: {gap}',
   'You are doing something extraordinary, working far from home so your family has what they need. But there is one risk that could undo all of that: the gap between what your family depends on and what is protected if something happened to you.',
   'I would like to walk you through what this means. Free, no pressure. Just a clear picture of where things stand.'
 ],
 'Book a Free 15-min Call'),

('followup_2_ofw',
 'OFW — Follow-up 2',
 'Day 3 after submission',
 'What happens to the remittances if something happens to you?',
 'The one risk most OFWs overlook',
 ARRAY[
   'You send money home every month. Your family budgets around it, plans around it, depends on it. But what is the plan if that remittance stops?',
   'Most OFWs I talk to have thought about this but have not acted on it yet. Your score was {score}/100. The gap flagged, {topGapName}, is exactly what stands between your family''s stability and a very difficult situation.',
   'The good news: closing this gap does not require a big budget. At the starter level, {topGapStarter} puts real protection in place for the people back home.'
 ],
 'See What This Costs'),

('followup_3_ofw',
 'OFW — Follow-up 3',
 'Day 7 after submission',
 '{firstName}, your family deserves a backup plan',
 'You are already their plan. Give them a backup.',
 ARRAY[
   'A week since your Financial Protection Check. Score: {score}/100. Gap: {gap}',
   'You are already the plan for your family. Every month, your sacrifice shows up in their lives. But what you have not done yet is put a backup in place for them, one that does not depend on you being healthy and employed.',
   '{topGapName} at {topGapStarter} is that backup. Let us talk about what it takes to put it in place.'
 ],
 'Let Us Talk'),

('followup_4_ofw',
 'OFW — Follow-up 4',
 'Day 14 after submission',
 'Her family in Cebu had no idea what was coming',
 'She was the backup plan. Then she needed one.',
 ARRAY[
   'Rosa had been working in Singapore for seven years. She sent money home every month without fail. Her parents, her younger siblings, her children — all of them counted on her.',
   'Then she had a serious health emergency abroad. She was hospitalised for two months. The remittances stopped. Her family had no savings buffer.',
   '{firstName}, I do not know your situation. But I know your score is {score}/100 and that there is a gap worth closing. When you are ready to talk, I am here.'
 ],
 'Book a Free Call'),

-- ── Entrepreneur ─────────────────────────────────────────────────────────────

('followup_1_entrepreneur',
 'Entrepreneur — Follow-up 1',
 'Day 1 after submission',
 '{firstName}, here is what your score actually means',
 'No employer benefits means the gap falls on you',
 ARRAY[
   'Yesterday you completed your Financial Protection Check: {score}/100 ({scoreLabel}). The biggest gap I found: {gap}',
   'Unlike salaried employees, you have no employer to provide an HMO, group life cover, or sick pay. Every one of those gaps is yours to fill. Your score reflects that reality.',
   'I would like to walk you through what closing the most important gap actually costs. No jargon, no pressure. Just a real picture of what makes sense for someone in your position.'
 ],
 'Book a Free 15-min Call'),

('followup_2_entrepreneur',
 'Entrepreneur — Follow-up 2',
 'Day 3 after submission',
 'What a health crisis does to a solo business',
 'The scenario most entrepreneurs have not planned for',
 ARRAY[
   'Imagine this: you are out of commission for three months. No new clients, no follow-ups, no deliverables. But your subscriptions, your rent, your commitments — those keep going.',
   'Your score was {score}/100. The gap flagged, {topGapName}, is what stands between that scenario being manageable and it wiping out what you have built.',
   'Closing it at the starter level costs {topGapStarter}. That is the cushion that keeps your business alive while you recover.'
 ],
 'See What This Looks Like'),

('followup_3_entrepreneur',
 'Entrepreneur — Follow-up 3',
 'Day 7 after submission',
 '{firstName}, you are the business. Protect the business.',
 'The one investment most entrepreneurs skip',
 ARRAY[
   'A week since your Financial Protection Check. Score: {score}/100. Gap: {gap}',
   'You invest in your tools, your team, your marketing. But the single biggest risk to your business is you. If you are out, the business is out. That is not a what-if. That is the structure of a solo operation.',
   '{topGapName} at {topGapStarter} is the insurance policy on the person who makes everything else run. Let us make sure that person is covered.'
 ],
 'Let Us Talk'),

('followup_4_entrepreneur',
 'Entrepreneur — Follow-up 4',
 'Day 14 after submission',
 'He lost six months of clients in three weeks',
 'No sick days. No backup. No plan.',
 ARRAY[
   'Marco ran a small design agency, three clients at a time, always fully booked. He was good at what he did and assumed his reputation would carry him through anything.',
   'Then he got dengue. What started as a week off turned into a month in and out of the hospital. His clients moved on. By the time he recovered, he had to rebuild from scratch.',
   '{firstName}, your score is {score}/100. There is a gap worth closing. When you are ready to talk, I am here.'
 ],
 'Book a Free Call'),

-- ── Business Owner ────────────────────────────────────────────────────────────

('followup_1_business',
 'Business — Follow-up 1',
 'Day 1 after submission',
 '{firstName}, your Protection Score is ready to review',
 'The gap your business cannot afford to ignore',
 ARRAY[
   'Yesterday you completed your Financial Protection Check: {score}/100 ({scoreLabel}). The biggest gap I found: {gap}',
   'For a business owner, this gap is not just personal. It is a key-person risk. If you were suddenly out of the picture, what happens to payroll, supplier relationships, and the clients you have spent years building?',
   'I would like to walk you through what this means for your specific situation. No pressure. Just a clear picture of the risk and what it takes to address it.'
 ],
 'Book a Free 15-min Call'),

('followup_2_business',
 'Business — Follow-up 2',
 'Day 3 after submission',
 'The risk most business owners have not quantified',
 'Key-person risk: what it is and why it matters',
 ARRAY[
   'Every business has a key person. Someone whose relationships, knowledge, or leadership keeps the operation running. For most SMEs in the Philippines, that person is the owner.',
   'Your score was {score}/100. The gap flagged, {topGapName}, is what your business is exposed to if that key person is suddenly unavailable. The cost of this gap is not just medical bills. It is continuity, credit, and client confidence.',
   'Protecting the key person is the first line of any serious business continuity plan. It costs less than most owners expect.'
 ],
 'See What This Looks Like'),

('followup_3_business',
 'Business — Follow-up 3',
 'Day 7 after submission',
 '{firstName}, what does your succession plan look like?',
 'Continuity starts with protecting the person at the top',
 ARRAY[
   'A week since your Financial Protection Check. Score: {score}/100. Gap: {gap}',
   'Most business owners I talk to have thought about succession but have not formalised anything yet. The first step is not a legal structure. It is making sure the person at the top is protected so the business has time to adapt if the unexpected happens.',
   '{topGapName} at {topGapStarter} buys your business that time. Let us talk about how to put this in place.'
 ],
 'Let Us Talk'),

('followup_4_business',
 'Business — Follow-up 4',
 'Day 14 after submission',
 'What happened to the business when he passed',
 'His team survived. Here is why.',
 ARRAY[
   'Ernesto ran a 15-person logistics company for 12 years. When he passed unexpectedly, the business was at a crossroads. His family had no liquidity to cover the liabilities. But Ernesto had planned ahead.',
   'A key-person plan paid out within weeks. It covered the outstanding loans, kept payroll running for six months, and gave the family time to decide on succession without being forced into a rushed sale.',
   '{firstName}, your score is {score}/100. A conversation about continuity planning does not take long. When you are ready, I am here.'
 ],
 'Book a Free Call'),

-- ── High Net Worth ────────────────────────────────────────────────────────────

('followup_1_hnw',
 'HNW — Follow-up 1',
 'Day 1 after submission',
 '{firstName}, your estate protection score is ready',
 'Your score: {score}/100. Here is what it means for your estate.',
 ARRAY[
   'Yesterday you completed your Financial Protection Check: {score}/100 ({scoreLabel}). The biggest gap I found: {gap}',
   'At your level of wealth, the primary risk is not income replacement. It is whether your estate will transfer to the next generation cleanly, or whether estate tax and probate will force your heirs into decisions you would not want them to make.',
   'I would like to walk you through what your score means in practical terms. This is a conversation, not a pitch.'
 ],
 'Schedule a Conversation'),

('followup_2_hnw',
 'HNW — Follow-up 2',
 'Day 3 after submission',
 'Estate tax in the Philippines: what the numbers look like',
 'The estate tax bill most families are not ready for',
 ARRAY[
   'Estate tax in the Philippines is assessed at 6% of the net estate, and it must be paid before any assets can transfer to heirs. For a significant estate, this is a material liquidity event.',
   'Your score was {score}/100. The gap flagged, {topGapName}, reflects the liquidity shortfall your estate may face at the time of settlement. Without a plan in place, heirs typically have two options: liquidate assets under pressure, or delay settlement.',
   'A properly structured plan creates immediate, tax-efficient liquidity for this exact scenario. It is an estate planning tool, not an expense.'
 ],
 'Let Us Talk Strategy'),

('followup_3_hnw',
 'HNW — Follow-up 3',
 'Day 7 after submission',
 '{firstName}, how will your estate pay its tax bill?',
 'The question every estate plan should answer',
 ARRAY[
   'A week since your Financial Protection Check. Score: {score}/100. Gap: {gap}',
   'The question is not whether estate tax will apply. At the net estate level you are working with, it will. The question is whether your heirs will have the liquidity to pay it without disrupting the assets you have spent a lifetime building.',
   'A plan designed around this need costs a fraction of what a forced sale would. And unlike a forced sale, it is on your terms. Let us talk about what this looks like for your situation.'
 ],
 'Schedule a Strategy Call'),

('followup_4_hnw',
 'HNW — Follow-up 4',
 'Day 14 after submission',
 'The family that almost sold the property',
 'They had the assets. They did not have the liquidity.',
 ARRAY[
   'A family in Quezon City came to me three months after their patriarch passed. The estate was substantial: land, a business, shares. But the estate tax bill came to over eight figures. Payable within one year.',
   'They did not have that kind of cash sitting idle. They were weeks away from selling the family property at a significant discount when we found a solution.',
   '{firstName}, your score is {score}/100. If there is a gap in your estate liquidity plan, it is worth addressing now, on your terms, not under pressure. I am available when you are ready.'
 ],
 'Schedule a Conversation')

on conflict (id) do nothing;
