/* ============================================
   TBIBNA – Reusable Component Snippets
   ============================================ */

/**
 * BUTTONS
 */

// Primary Button
<button className="rounded-xl bg-[#0F3D3E] px-6 py-3 text-[15px] font-semibold text-[#FBF9F4] shadow-lg shadow-[#0F3D3E]/20 transition duration-200 hover:bg-[#0B2D2E] hover:shadow-xl active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/30">
  Action
</button>

// Secondary Button
<button className="rounded-xl border border-[#E4DFD3] bg-white/60 px-6 py-3 text-[15px] font-medium text-[#0F3D3E] backdrop-blur transition duration-200 hover:border-[#0F3D3E]/30 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/30">
  Action
</button>

// Icon Button
<button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[#0F3D3E]/8 transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/30">
  <Icon size={20} className="text-[#0F3D3E]" />
</button>

/**
 * FORM INPUTS
 */

// Text Input
<div>
  <label htmlFor="input" className="mb-1.5 block text-[13px] font-medium text-[#0F3D3E]">
    Label
  </label>
  <div className="relative">
    <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9A94] pointer-events-none" />
    <input
      id="input"
      type="text"
      placeholder="Placeholder"
      className="w-full rounded-xl border border-[#E4DFD3] bg-[#FBF9F4] py-2.5 pl-10 pr-3.5 text-[14.5px] text-[#1C1C1A] outline-none transition duration-200 focus:border-[#0F3D3E] focus:bg-white focus:ring-2 focus:ring-[#0F3D3E]/20"
    />
  </div>
</div>

// Textarea
<div>
  <label htmlFor="textarea" className="mb-1.5 block text-[13px] font-medium text-[#0F3D3E]">
    Message
  </label>
  <textarea
    id="textarea"
    placeholder="Type here..."
    rows={4}
    className="w-full rounded-xl border border-[#E4DFD3] bg-[#FBF9F4] p-3.5 text-[14.5px] text-[#1C1C1A] outline-none transition duration-200 focus:border-[#0F3D3E] focus:bg-white focus:ring-2 focus:ring-[#0F3D3E]/20 resize-none"
  />
</div>

// Select
<div>
  <label htmlFor="select" className="mb-1.5 block text-[13px] font-medium text-[#0F3D3E]">
    Option
  </label>
  <select
    id="select"
    className="w-full rounded-xl border border-[#E4DFD3] bg-[#FBF9F4] py-2.5 px-3.5 text-[14.5px] text-[#1C1C1A] outline-none transition duration-200 focus:border-[#0F3D3E] focus:bg-white focus:ring-2 focus:ring-[#0F3D3E]/20"
  >
    <option value="">Select an option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
  </select>
</div>

// Checkbox
<label className="flex items-center gap-3 cursor-pointer">
  <input
    type="checkbox"
    className="h-5 w-5 rounded border border-[#E4DFD3] checked:bg-[#0F3D3E] checked:border-[#0F3D3E] accent-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/20"
  />
  <span className="text-[14.5px] text-[#1C1C1A]">Agree to terms</span>
</label>

// Radio
<label className="flex items-center gap-3 cursor-pointer">
  <input
    type="radio"
    name="option"
    value="a"
    className="h-5 w-5 rounded-full border border-[#E4DFD3] checked:bg-[#0F3D3E] checked:border-[#0F3D3E] accent-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/20"
  />
  <span className="text-[14.5px] text-[#1C1C1A]">Option A</span>
</label>

/**
 * ALERTS / MESSAGES
 */

// Success Alert
<div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 flex gap-3 items-start text-[14px] text-emerald-700 animate-slideDown">
  <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
  <span>Success message</span>
</div>

// Error Alert
<div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 flex gap-3 items-start text-[14px] text-red-700 animate-slideDown">
  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
  <span>Error message</span>
</div>

// Warning Alert
<div className="rounded-xl border border-yellow-200 bg-yellow-50/80 px-4 py-3 flex gap-3 items-start text-[14px] text-yellow-700 animate-slideDown">
  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
  <span>Warning message</span>
</div>

// Info Alert
<div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 flex gap-3 items-start text-[14px] text-blue-700 animate-slideDown">
  <Info size={18} className="flex-shrink-0 mt-0.5" />
  <span>Info message</span>
</div>

/**
 * CARDS
 */

// Basic Card
<div className="rounded-2xl border border-[#E4DFD3] bg-[#FBF9F4] p-6 transition-all duration-300 hover:border-[#0F3D3E]/20 hover:shadow-lg hover:-translate-y-1">
  <h3 className="text-[16.5px] font-medium text-[#0F3D3E]">Card Title</h3>
  <p className="mt-2 text-[14px] leading-relaxed text-[#5C5A54]">
    Card content goes here
  </p>
</div>

// Feature Card with Icon
<div className="flex gap-4 rounded-2xl border border-[#E4DFD3]/80 bg-[#FBF9F4] p-5 transition-all duration-200 hover:border-[#0F3D3E]/20 hover:shadow-md">
  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFEAE0] text-[#3E7C6A]">
    <Icon size={20} strokeWidth={1.7} />
  </div>
  <div>
    <h3 className="text-[15px] font-medium text-[#0F3D3E]">Title</h3>
    <p className="mt-1 text-[13.5px] leading-relaxed text-[#5C5A54]">
      Description text
    </p>
  </div>
</div>

/**
 * BADGES / TAGS
 */

// Badge
<span className="inline-flex items-center gap-2 rounded-full border border-[#E4DFD3] bg-white/70 px-3.5 py-1.5 text-[13px] font-medium text-[#3E7C6A] shadow-sm backdrop-blur">
  <span className="relative flex h-2 w-2">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3E7C6A] opacity-60" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3E7C6A]" />
  </span>
  Status
</span>

// Tag
<span className="inline-block rounded-lg border border-[#E4DFD3] bg-[#EFEAE0] px-3 py-1 text-[12.5px] font-medium text-[#0F3D3E]">
  Tag
</span>

/**
 * LOADING STATES
 */

// Spinner
<div className="w-5 h-5 border-2 border-[#E4DFD3] border-t-[#0F3D3E] rounded-full animate-spin" />

// Skeleton
<div className="rounded-xl bg-gradient-to-r from-[#FBF9F4] via-[#EFEAE0] to-[#FBF9F4] bg-[length:1000px_100%] animate-shimmer h-12 w-full" />

// Loading Text
<div className="space-y-2">
  <div className="h-4 bg-[#EFEAE0] rounded animate-pulse"></div>
  <div className="h-4 bg-[#EFEAE0] rounded w-5/6 animate-pulse"></div>
</div>

/**
 * EMPTY STATES
 */

<div className="rounded-2xl border-2 border-dashed border-[#E4DFD3] bg-[#FBF9F4]/50 p-12 text-center">
  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFEAE0]">
    <EmptyIcon size={32} className="text-[#9C9A94]" />
  </div>
  <h3 className="text-[16px] font-medium text-[#0F3D3E]">Nothing here yet</h3>
  <p className="mt-1 text-[14px] text-[#5C5A54]">Start by creating something</p>
</div>

/**
 * FOOTER LINK GROUPS
 */

// Footer Section
<div>
  <h4 className="text-[14px] font-semibold text-[#0F3D3E] mb-4">Section</h4>
  <ul className="space-y-2">
    <li>
      <a href="#" className="text-[13px] text-[#5C5A54] hover:text-[#0F3D3E] transition duration-200">
        Link
      </a>
    </li>
  </ul>
</div>

/**
 * SECTIONS
 */

// Hero Section
<section className="relative overflow-hidden">
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute -top-32 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#0F3D3E]/[0.03] blur-3xl" />
    <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-[#E8C77E]/10 blur-3xl" />
  </div>
  
  <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-20 lg:px-8 lg:py-28">
    {/* Content */}
  </div>
</section>

// Content Section
<section className="border-t border-[#E4DFD3] bg-white/40">
  <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
    {/* Content */}
  </div>
</section>

/**
 * GRID LAYOUTS
 */

// 2-Column
<div className="grid grid-cols-2 gap-3">
  {/* Items */}
</div>

// 3-Column
<div className="grid gap-6 md:grid-cols-3">
  {/* Items */}
</div>

// 4-Column
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
  {/* Items */}
</div>

/**
 * DIVIDERS
 */

// Horizontal
<div className="h-px bg-[#E4DFD3]" />

// With Text
<div className="relative py-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-[#E4DFD3]" />
  </div>
  <div className="relative flex justify-center">
    <span className="bg-[#FBF9F4] px-2 text-[14px] text-[#5C5A54]">
      Or
    </span>
  </div>
</div>

/**
 * TOOLTIPS
 */

// Hover Tooltip
<div className="group relative cursor-help">
  <button className="focus:outline-none">Help</button>
  <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-lg bg-[#0F3D3E] px-3 py-2 text-[12px] text-[#FBF9F4] opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
    Tooltip text
  </div>
</div>

---

**Utilisez ces snippets comme base pour construire des composants réutilisables! 🎨**
