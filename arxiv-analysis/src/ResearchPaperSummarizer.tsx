import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowRight, FileText, Code, ChevronRight, ChevronLeft, BookOpen, FlaskConical, PieChart, Flag, ExternalLink } from 'lucide-react';

interface SubSection {
  title: string;
  content: string;
  isOpen: boolean;
  progress: number;
  notes: string;
}

const ResearchPaperSummarizer: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'business' | 'technical'>('business');
  const [businessSummary, setBusinessSummary] = useState<string>('');
  const [technicalSummary, setTechnicalSummary] = useState<string>('');
  const [processedText, setProcessedText] = useState<string>('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [summaryStatus, setSummaryStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [subSections, setSubSections] = useState<SubSection[]>([]);
  const [sectionSummaries, setSectionSummaries] = useState<{ [key: string]: string }>({});
  const [isSectionSummaryLoading, setIsSectionSummaryLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessed(false);
    setSummaryStatus('idle');
    setBusinessSummary('');
    setTechnicalSummary('');
    try {
      const response = await fetch('http://localhost:5001/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const data = await response.json();
      setProcessedText(data.processed_text);
      setRequestId(data.request_id);
      setIsProcessed(true);

      if (data.status === 'Cached' && data.business_summary && data.tech_summary) {
        setBusinessSummary(data.business_summary);
        setTechnicalSummary(data.tech_summary);
        setSummaryStatus('completed');
      } else {
        setSummaryStatus('processing');
      }
    } catch (error) {
      console.error('Error processing paper:', error);
      setIsProcessed(false);
      setSummaryStatus('idle');
    }
  };

  useEffect(() => {
    const pollForSummaries = async () => {
      if (!requestId || summaryStatus !== 'processing') return;

      try {
        const response = await fetch(`http://localhost:5001/summaries/${requestId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'completed') {
            setBusinessSummary(data.business_summary);
            setTechnicalSummary(data.tech_summary);
            setSummaryStatus('completed');
          } else if (data.status === 'error') {
            throw new Error(data.error);
          }
        }
      } catch (error) {
        console.error('Error polling for summaries:', error);
        setSummaryStatus('idle');
      }
    };

    const intervalId = setInterval(pollForSummaries, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [requestId, summaryStatus]);

  const toggleSubSection = (index: number) => {
    setSubSections(subSections.map((section, i) => 
      i === index ? { ...section, isOpen: !section.isOpen } : { ...section, isOpen: false }
    ));
  };

  const updateNotes = (index: number, newNotes: string) => {
    setSubSections(subSections.map((section, i) => 
      i === index ? { ...section, notes: newNotes } : section
    ));
    
  };

  const handleGenerateSectionSummaries = async () => {
    if (!requestId) return;
    setIsSectionSummaryLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/section-summaries/${requestId}`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setSectionSummaries(data.section_summaries);
      }
    } catch (error) {
      console.error('Error generating section summaries:', error);
    } finally {
      setIsSectionSummaryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center">Research Paper Summarizer</h1>
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="w-full lg:w-1/3">
          <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <label htmlFor="paper-url" className="block text-sm font-medium text-gray-700 mb-2">Paper URL</label>
            <div className="flex items-center mb-4">
              <div className="flex-grow mr-2 border border-gray-300 rounded overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  id="paper-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/paper"
                  className="w-full p-2 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 flex items-center justify-center"
              >
                Process
                <ArrowRight className="ml-2" size={20} />
              </button>
            </div>
            {isProcessed && (
              <p className="text-green-600 font-medium mt-2">Document successfully processed</p>
            )}
            {summaryStatus === 'processing' && (
              <p className="text-blue-600 font-medium mt-2">Generating summaries...</p>
            )}
            {summaryStatus === 'completed' && (
              <p className="text-green-600 font-medium mt-2">Summaries generated</p>
            )}
          </form>
        </div>
        <div className="w-full lg:w-2/3">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md h-full">
            <div className="flex mb-4 bg-gray-100 p-1 rounded-md">
              <button
                onClick={() => setActiveTab('business')}
                className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                  activeTab === 'business' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
                } flex items-center justify-center`}
              >
                <FileText className="mr-2" size={20} />
                Business Summary
              </button>
              <button
                onClick={() => setActiveTab('technical')}
                className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                  activeTab === 'technical' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
                } flex items-center justify-center`}
              >
                <Code className="mr-2" size={20} />
                Technical Summary
              </button>
            </div>
            <div className="mt-4 h-[calc(100%-4rem)] overflow-auto p-4 bg-gray-50 rounded-md">
              <ReactMarkdown className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
                {activeTab === 'business'
                  ? (businessSummary || 'No business summary available.')
                  : (technicalSummary || 'No technical summary available.')}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300 my-6 md:my-8"></div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Section Summaries</h2>
        <button
          onClick={handleGenerateSectionSummaries}
          disabled={!isProcessed || isSectionSummaryLoading}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-300 flex items-center justify-center"
        >
          {isSectionSummaryLoading ? 'Generating...' : 'Generate Section Summaries'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {subSections.map((section, index) => (
          <div key={index} className="border-b border-gray-200 last:border-b-0">
            <button
              className="w-full p-4 text-left font-semibold flex justify-between items-center focus:outline-none hover:bg-gray-50 transition-colors duration-200"
              onClick={() => toggleSubSection(index)}
            >
              <div className="flex items-center">
                <span>{section.title}</span>
              </div>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2.5 mr-2 hidden sm:block">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${section.progress}%` }}
                  ></div>
                </div>
                {section.isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </div>
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              section.isOpen ? 'max-h-[500px]' : 'max-h-0'
            }`}>
              <div className="p-4 bg-gray-50 flex flex-col md:flex-row">
                <div className="flex-1 mr-0 md:mr-4 mb-4 md:mb-0 overflow-auto">
                  <h3 className="font-bold mb-2 text-lg">{section.title} Summary</h3>
                  <p className="text-sm md:text-base">{section.content}</p>
                </div>
                <div className="w-full md:w-64">
                  <h3 className="font-bold mb-2 text-lg">Notes</h3>
                  <textarea
                    className="w-full h-32 p-2 border border-gray-300 rounded text-sm md:text-base"
                    value={section.notes}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="Enter your notes here..."
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        {Object.entries(sectionSummaries).map(([title, summary]) => (
          <div key={title} className="mb-4">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p>{summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchPaperSummarizer;