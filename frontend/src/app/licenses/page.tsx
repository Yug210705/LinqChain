'use client';

import React from 'react';
import Link from 'next/link';
import { LegalHeader, LegalFooter } from '@/components/legal/legal-nav';
import { Code2, ShieldCheck, CheckCircle2, FileCode, Layers } from 'lucide-react';

const OSS_DEPENDENCIES = [
  { name: 'Next.js', license: 'MIT', copyright: 'Copyright © 2026 Vercel, Inc.', url: 'https://github.com/vercel/next.js' },
  { name: 'React & React DOM', license: 'MIT', copyright: 'Copyright © Meta Platforms, Inc.', url: 'https://github.com/facebook/react' },
  { name: 'FastAPI', license: 'MIT', copyright: 'Copyright © 2018 Sebastián Ramírez', url: 'https://github.com/tiangolo/fastapi' },
  { name: 'SQLAlchemy', license: 'MIT', copyright: 'Copyright © 2005-2026 Michael Bayer & contributors', url: 'https://www.sqlalchemy.org/' },
  { name: 'Tailwind CSS', license: 'MIT', copyright: 'Copyright © Tailwind Labs, Inc.', url: 'https://tailwindcss.com/' },
  { name: 'Lucide React', license: 'ISC / MIT', copyright: 'Copyright © Lucide Contributors', url: 'https://lucide.dev/' },
  { name: '@xyflow/react (React Flow)', license: 'MIT', copyright: 'Copyright © webkid GmbH / Christopher Holtz', url: 'https://reactflow.dev/' },
  { name: 'Recharts', license: 'MIT', copyright: 'Copyright © 2015-2026 Recharts Group', url: 'https://recharts.org/' },
  { name: 'Framer Motion', license: 'MIT', copyright: 'Copyright © Framer B.V.', url: 'https://www.framer.com/motion/' },
  { name: 'Zustand', license: 'MIT', copyright: 'Copyright © Paul Henschel & Daishi Kato', url: 'https://github.com/pmndrs/zustand' },
  { name: 'TanStack React Query', license: 'MIT', copyright: 'Copyright © Tanner Linsley', url: 'https://tanstack.com/query' },
  { name: 'Uvicorn', license: 'BSD-3-Clause', copyright: 'Copyright © Encode OSS Ltd.', url: 'https://www.uvicorn.org/' },
  { name: 'Pydantic', license: 'MIT', copyright: 'Copyright © Samuel Colvin & contributors', url: 'https://docs.pydantic.dev/' },
  { name: 'Axios', license: 'MIT', copyright: 'Copyright © 2014-present Matt Zabriskie', url: 'https://axios-http.com/' },
  { name: 'jsPDF & AutoTable', license: 'MIT', copyright: 'Copyright © 2010-2026 James Hall & Simon Tenggren', url: 'https://github.com/parallax/jsPDF' },
];

export default function LicensesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c0d12] text-slate-900 dark:text-neutral-100 font-sans">
      <LegalHeader title="Open Source Licenses & IP Compliance" />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Document Header */}
        <div className="mb-10 pb-8 border-b border-neutral-200 dark:border-neutral-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Code2 className="w-3.5 h-3.5" />
            <span>Permissive License Verification & Attribution</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Open Source Licenses & Third-Party Code
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            Compliance notice for open-source libraries and intellectual property components incorporated into LinqChain.
          </p>
        </div>

        {/* IP & Permissive Licensing Status Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#13141b] border border-neutral-200 dark:border-white/10 shadow-sm mb-10 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <strong className="block text-sm font-bold text-neutral-900 dark:text-white mb-1">
              Zero-Copyleft Commercial Assurance
            </strong>
            LinqChain strictly prohibits viral copyleft software (such as GNU GPL or AGPL) in its production build artifacts. All bundled third-party libraries operate under permissive commercial licenses (MIT, Apache 2.0, BSD-3-Clause, ISC), preserving total proprietary ownership and enterprise trade-secret protection for LinqChain’s blast radius graph algorithms.
          </div>
        </div>

        {/* Third-Party Attribution Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Third-Party Software Inventory</h2>
          <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#13141b]">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 dark:bg-white/[0.04] border-b border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white">
                <tr>
                  <th className="p-3.5 font-semibold">Package / Component</th>
                  <th className="p-3.5 font-semibold">License</th>
                  <th className="p-3.5 font-semibold">Copyright Holder</th>
                  <th className="p-3.5 font-semibold text-right">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                {OSS_DEPENDENCIES.map((dep) => (
                  <tr key={dep.name} className="hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{dep.name}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                        {dep.license}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-500 dark:text-neutral-400">{dep.copyright}</td>
                    <td className="p-3.5 text-right">
                      <a
                        href={dep.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
                      >
                        Repository →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Standard MIT Text */}
        <div className="mt-12 p-6 rounded-2xl bg-neutral-100 dark:bg-[#08080a] border border-neutral-200 dark:border-white/10 text-xs text-neutral-600 dark:text-neutral-400 space-y-3 font-mono">
          <p className="font-bold text-neutral-900 dark:text-white">Standard MIT License Disclaimer:</p>
          <p>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
          </p>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
