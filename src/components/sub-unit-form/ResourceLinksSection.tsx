import React, { memo } from 'react';
import { Link } from 'lucide-react';
import { PrepResource } from '../../types';
import { UrlWithUpload } from './UrlWithUpload';
import { ResourceBankEditor } from '../ResourceBankEditor';

interface ResourceLinksSectionProps {
  worksheetUrl: string;
  onlinePracticeUrl: string;
  kahootUrl: string;
  homeworkUrl: string;
  vocabPracticeUrl: string;
  sharedResources: PrepResource[];
  onWorksheetUrlChange: (v: string) => void;
  onOnlinePracticeUrlChange: (v: string) => void;
  onKahootUrlChange: (v: string) => void;
  onHomeworkUrlChange: (v: string) => void;
  onVocabPracticeUrlChange: (v: string) => void;
  onSharedResourcesChange: (resources: PrepResource[]) => void;
}

function ResourceLinksSectionInner({
  worksheetUrl,
  onlinePracticeUrl,
  kahootUrl,
  homeworkUrl,
  vocabPracticeUrl,
  sharedResources,
  onWorksheetUrlChange,
  onOnlinePracticeUrlChange,
  onKahootUrlChange,
  onHomeworkUrlChange,
  onVocabPracticeUrlChange,
  onSharedResourcesChange,
}: ResourceLinksSectionProps) {
  return (
    <section className="space-y-4 border-t border-slate-100 pt-8">
      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
        <Link size={16} className="text-blue-500" />
        快速资源入口 Quick Links
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UrlWithUpload label="练习单 Worksheet URL" value={worksheetUrl} onChange={onWorksheetUrlChange} />
        <UrlWithUpload label="线上练习 Online Practice URL" value={onlinePracticeUrl} onChange={onOnlinePracticeUrlChange} />
        <UrlWithUpload label="Kahoot URL" value={kahootUrl} onChange={onKahootUrlChange} />
        <UrlWithUpload label="课后作业 Homework URL" value={homeworkUrl} onChange={onHomeworkUrlChange} />
        <UrlWithUpload label="核心词汇练习 Vocab Practice URL" value={vocabPracticeUrl} onChange={onVocabPracticeUrlChange} />
      </div>
      <ResourceBankEditor
        label="共享资料库 Shared Resource Bank"
        resources={sharedResources}
        onChange={onSharedResourcesChange}
        emptyText="No extra shared resources yet. Use this area for slides, videos, textbook pages, assessments, answer keys, simulations, past papers, and printable materials."
        description="These entries are reused by objective prep packs and displayed in the sub-unit resource sidebar."
      />
    </section>
  );
}

export const ResourceLinksSection = memo(ResourceLinksSectionInner);
