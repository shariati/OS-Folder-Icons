'use client';

import { useState } from 'react';
import { DB, AuditLog } from '@/lib/types';
import { Clock, User, FileSearch, Search } from 'lucide-react';
import { NeumorphBox } from '@/components/ui/NeumorphBox';

interface AuditLogViewerProps {
  initialData: DB;
}

export function AuditLogViewer({ initialData }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>(initialData.auditLogs || []);
  const [searchTerm, setSearchTerm] = useState('');

  // Sort logs by timestamp desc
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredLogs = sortedLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  return (
    <NeumorphBox className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h3 className="font-bold text-xl text-black dark:text-white flex items-center gap-2">
          <FileSearch size={24} className="text-primary" />
          Audit Log
        </h3>
        <div className="relative w-full sm:w-96">
            <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-primary active:border-primary dark:border-gray-700 dark:bg-gray-800"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left">
              <th className="min-w-[150px] py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">
                Action / Event
              </th>
              <th className="min-w-[200px] py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">
                User
              </th>
              <th className="min-w-[250px] py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">
                Description
              </th>
              <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider text-right">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, key) => (
                <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                        {log.action}
                    </span>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary">
                             <User size={16} />
                         </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-black dark:text-white">
                                {log.userEmail.split('@')[0]}
                            </span>
                             <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded w-fit">
                                {log.userEmail}
                            </span>
                        </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {log.details}
                    </p>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-sm text-gray-500 font-medium">
                      <Clock size={16} className="text-gray-400" />
                      {formatDate(log.timestamp)}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                            <FileSearch size={32} />
                        </div>
                        <p>No audit logs found matching your criteria.</p>
                    </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </NeumorphBox>
  );
}
