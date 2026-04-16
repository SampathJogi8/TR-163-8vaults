import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 reveal">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex items-center justify-between group transition-all"
      >
        <span className={`text-xl font-bold tracking-tight transition-premium ${isOpen ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-premium ${isOpen ? 'bg-white text-black border-white' : 'text-gray-500 group-hover:border-white/20'}`}>
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 pb-12' : 'max-h-0'}`}>
        <p className="text-gray-500 font-medium leading-[1.8] max-w-3xl">
          {answer}
        </p>
      </div>
    </div>
  );
};

const AuditFAQ = () => {
  const faqs = [
    {
      question: "How secure is my source code during an audit?",
      answer: "We treat your intellectual property with absolute priority. Repositories are scanned in transient sandboxed environments. We never store source code locally on our engine, and all analysis is performed over encrypted channels."
    },
    {
      question: "What AI models power the Reasoning Core?",
      answer: "Our 'Dual-Core' engine leverages a hybrid of Anthropic's Claude 3.5 Sonnet and Google's Gemini 1.5 Pro. This combination allows for both high-level architectural reasoning and granular, line-by-line vulnerability detection."
    },
    {
      question: "Can I use DebtScan for private repositories?",
      answer: "Yes. Our Professional and Enterprise protocols support private source integration via secure access tokens or local ZIP archive uploads, ensuring even internal infrastructure remains optimized."
    },
    {
      question: "How accurate is the Health Score?",
      answer: "The Health Score is derived from a cross-weighted matrix of severity (Critical/Major/Minor) and structural impact. Research shows our scoring correlates with actual maintenance effort with over 92% accuracy."
    },
    {
      question: "Does it support monolithic architectures?",
      answer: "Absolutely. In fact, large-scale monoliths are where our engine thrives. We excel at identifying dependencies and fragility that often go unnoticed in massive codebases."
    }
  ];

  return (
    <section className="w-full max-w-4xl py-32 px-6 mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-4xl font-black text-white tracking-widest uppercase mb-4">FAQs</h2>
        <p className="text-gray-600 font-bold text-[10px] tracking-[0.4em]">DOCUMENTATION & INTEL REPOSITORY</p>
      </div>

      <div className="flex flex-col">
        {faqs.map((faq, i) => (
          <FAQItem key={i} {...faq} />
        ))}
      </div>
    </section>
  );
};

export default AuditFAQ;
