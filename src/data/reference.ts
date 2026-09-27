// Reference data used by the mock generation service.
// In production this should be swapped for calls to a maintained Bible API
// and a vetted, licensed Ellen G. White source database via the
// generate-sermon Edge Function — see supabase/functions/generate-sermon.
// The KJV text below is public domain and used only as illustrative sample
// content for a handful of common verses so the demo has real scripture text.

export const KJV_SAMPLE: Record<string, string> = {
  'John 3:16':
    'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
  'Romans 8:28':
    'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
  'Philippians 4:6-7':
    'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
  'Psalm 23:1-3':
    'The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name\u2019s sake.',
  'Isaiah 41:10':
    'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.',
  'Matthew 11:28-29':
    'Come unto me, all ye that labour and are heavy laden, and I will give you rest. Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.'
}

export const FUNDAMENTAL_BELIEFS: { number: number; title: string; summary: string }[] = [
  { number: 1, title: 'The Holy Scriptures', summary: 'The Bible is the infallible revelation of God\u2019s will, the standard of character and test of experience.' },
  { number: 9, title: 'The Life, Death, and Resurrection of Christ', summary: 'Christ\u2019s substitutionary death, burial, and resurrection provide the only means of atonement for sin.' },
  { number: 11, title: 'Growing in Christ', summary: 'Through Christ we are freed from sin\u2019s dominion and grow daily in His likeness by the Spirit.' },
  { number: 17, title: 'Spiritual Gifts and Ministries', summary: 'The Spirit gives gifts to build up the church for ministry and to mature believers in faith.' },
  { number: 19, title: 'The Sabbath', summary: 'The seventh-day Sabbath is a perpetual sign of creation, redemption, and rest in Christ.' },
  { number: 24, title: 'Christ\u2019s Ministry in the Heavenly Sanctuary', summary: 'Christ ministers on our behalf, applying the benefits of His atoning sacrifice.' },
  { number: 28, title: 'The Millennium and the End of Sin', summary: 'At Christ\u2019s return the redeemed reign with Him, and sin is finally eradicated from the universe.' }
]

/**
 * Placeholder for a verified Ellen G. White excerpt. Real citations must come
 * from a licensed source lookup — never fabricate a quotation or page number.
 */
export function egwPlaceholder(topic: string): { body: string; reference: string } {
  return {
    body: `Connect a verified Ellen G. White source lookup to surface a citation relevant to "${topic}". No excerpt is fabricated here — this card is a placeholder until a licensed source is wired in.`,
    reference: 'Source pending — verified lookup not yet connected'
  }
}
