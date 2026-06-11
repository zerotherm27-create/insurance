-- Refresh drip template copy:
-- 1. Remove em dashes (brand copy rule: use periods, commas, or colons)
-- 2. Use the new top-gap variables {topGapName} {topGapIdeal} {topGapStarter}
--    so emails repeat the concrete peso amounts from the report
-- 3. Drop the crypto/VUL reference in followup_2 (no product categories in copy)
-- NOTE: overwrites any manual edits made in the admin Email Content tab.

update public.email_templates set
  subject = '{firstName}, here is your Financial Protection Report 🛡️',
  heading = 'Your Financial Protection Report 🛡️',
  paragraphs = ARRAY[
    'Hi {firstName}! Here''s what we found based on your answers.',
    'Your protection score is {score}/100: {scoreLabel}.',
    'Biggest gap we identified: {gap}',
    '{recommendation}',
    '{nextStep}'
  ],
  cta_text = 'Book a Free Call with Jojo →',
  updated_at = now()
where id = 'report';

update public.email_templates set
  subject = '{firstName}, did you review your results?',
  heading = 'Hi {firstName}, did you get a chance to review your results?',
  paragraphs = ARRAY[
    'Yesterday you got your Financial Protection Score: {score}/100 ({scoreLabel}).',
    'The biggest thing I noticed: {gap}',
    'For {topGapName}, the ideal level for your profile is {topGapIdeal}. You don''t have to start there. A starter level of {topGapStarter} already puts real protection in place.',
    'If you have 15 minutes this week, I''d love to walk you through what this means for your situation. Completely free, no pressure. Just real talk about your options.',
    'Or just reply to this email. I read every message. 😊'
  ],
  cta_text = 'Book a Free 15-min Call →',
  updated_at = now()
where id = 'followup_1';

update public.email_templates set
  subject = 'The #1 mistake Filipinos make with insurance 📋',
  heading = 'The #1 mistake Filipinos make with their finances 📋',
  paragraphs = ARRAY[
    'It''s not about not saving enough. It''s about saving before protecting.',
    'Most Filipinos I talk to have their priorities flipped. They''re building savings and investments, but they haven''t secured the foundation yet.',
    'Here''s the thing: if something happens to you before that foundation is set, everything you''ve built can disappear overnight.',
    'Your score was {score}/100. The gap we flagged, {topGapName}, is exactly this kind of foundation risk. And closing it starts at {topGapStarter}, not millions.',
    'Let''s fix that before we talk about anything else.'
  ],
  cta_text = 'Let''s Fix This Together →',
  updated_at = now()
where id = 'followup_2';

update public.email_templates set
  subject = '{firstName}, ready to close your protection gaps?',
  heading = 'Ready to close your protection gaps? 🛡️',
  paragraphs = ARRAY[
    'It''s been a week since you took the Financial Protection Check. Your score was {score}/100, and the gap we identified was: {gap}',
    'A lot of people tell me they mean to deal with this "soon." But soon has a way of becoming never, and the cost of waiting is always higher than the cost of starting.',
    'Remember the numbers: {topGapName} at the starter level is {topGapStarter}. That''s the gap between your family being exposed and being protected.',
    'I''m not here to pressure you. I just want to make sure you have the information you need to make the right call for your family.',
    'If now is a good time, let''s talk. If not, no worries. Just let me know when works.'
  ],
  cta_text = 'Let''s Talk →',
  updated_at = now()
where id = 'followup_3';

update public.email_templates set
  subject = 'A quick story about someone in your situation 💛',
  heading = 'She almost didn''t do it. Then one phone call changed everything.',
  paragraphs = ARRAY[
    'Ana was 29, working in Makati, and kept telling herself she''d "deal with insurance later." She wasn''t sick, she had her HMO, and money was tight after rent.',
    'Then her dad got diagnosed. The bills hit fast. Her family scrambled. And Ana realized her HMO only covered her, not them.',
    'She called me three months after that. We set up her plan in two meetings. She told me later it was the one thing that gave her peace of mind during the hardest year of her life.',
    '{firstName}, I don''t know your story. But I know your score is {score}/100 and that there''s a gap worth closing.',
    'If Ana''s story sounds familiar, let''s talk. No pressure, no sales pitch. Just clarity.'
  ],
  cta_text = 'Book a Free Call →',
  updated_at = now()
where id = 'followup_4';
