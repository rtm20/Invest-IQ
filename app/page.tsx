import MultiDocumentUpload from '@/components/MultiDocumentUpload';
import { SpeedInsights } from "@vercel/speed-insights/next"


export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
       <SpeedInsights />
      <MultiDocumentUpload />
    </main>
  );
}
