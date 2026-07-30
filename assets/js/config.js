/* ==========================================================================
   SayNeel Technologies — Site configuration
   --------------------------------------------------------------------------
   EDIT THIS FILE ONLY to change contact details across the entire website.
   Every page reads these values at runtime and updates the relevant links,
   labels and mailto:/tel: targets.

   The HTML also contains the same values hard-coded as a no-JavaScript
   fallback. If you change a value here, run a find-and-replace across the
   .html files for the old value so both stay in sync. (Search for the string
   you are replacing — e.g. "contact@sayneeltech.in" — and replace all occurrences.)
   ========================================================================== */
window.SAYNEEL = {
  /* --- Primary contact ------------------------------------------------- */
  email: "contact@sayneeltech.in",
  phoneDisplay: "+91 8600 40 50 88", // shown to visitors — replace with the real number
  phoneDial: "+918600405088", // used in tel: links — digits and leading + only

  /* --- Department mailboxes -------------------------------------------- */
  emailSales: "contact@sayneeltech.in",
  emailBalSaathi: "balsaathi@sayneeltech.in",
  emailCareers: "careers@sayneeltech.in",
  emailInvestors: "investors@sayneeltech.in",
  emailSupport: "support@sayneeltech.in",
  emailPrivacy: "privacy@sayneeltech.in",
  emailLegal: "legal@sayneeltech.in",
  emailConsultation: "contact@sayneeltech.in",

  /* --- Calendly (book-consultation.html) --------------------------------
     Replace calendlyUrl with your scheduling page URL, e.g.
     "https://calendly.com/sayneeltech/consultation". The inline widget will
     then replace the booking form's placeholder card automatically. Leave
     empty ('') to keep the plain consultation form only. If you enable this,
     also allow calendly.com in the CSP (see vercel.json and _headers).      */
  calendlyUrl: "",

  /* --- Address & hours -------------------------------------------------- */
  addressLine1: "SayNeel Technologies Private Limited",
  addressLine2:
    "C2, FL-15, Shivtirth Nagar Society, S.No. 59/2A/1/4, Rahatani, Kalewadi, Pune City",
  addressLine3: "Pune - 411017, Maharashtra, India",
  hoursWeekday: "Monday to Friday · 9:30 AM - 6:30 PM IST",
  hoursSaturday: "Saturday · 10:00 AM - 2:00 PM IST",
  hoursSunday: "Sunday · Closed",

  /* --- Google Maps ------------------------------------------------------
     Replace mapEmbed with the src of your Google Maps "Embed a map" iframe
     and mapLink with the shareable map URL. Leave mapEmbed empty ('') to
     keep the styled placeholder card shown on contact.html.               */
  mapEmbed: "",
  mapLink: "https://maps.app.goo.gl/8AQTzm5KrjC6Quh79",

  /* --- Social profiles (replace with your real handles) ----------------- */
  social: {
    linkedin: "https://www.linkedin.com/company/sayneel",
    x: "https://x.com/sayneel",
    github: "https://github.com/sayneel",
    youtube: "https://www.youtube.com/@sayneel",
  },

  /* --- Site --------------------------------------------------------------
     baseUrl is used for canonical links in the SEO checklist only.        */
  baseUrl: "https://www.sayneeltech.in",
};
