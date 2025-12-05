'use client';

import { useState } from 'react';
import { DB, AuditLog } from '@/lib/types';
import { Clock, User, Activity } from 'lucide-react';
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

  return (
    <NeumorphBox className="p-6">
      <div className="mb-6 flex justify-between">
        <h3 className="font-medium text-black dark:text-white flex items-center gap-2">
          <Activity size={20} />
          System Activity
        </h3>
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded border border-stroke bg-transparent py-2 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
        />
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Action
              </th>
              <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                User
              </th>
              <th className="min-w-[250px] py-4 px-4 font-medium text-black dark:text-white">
                Details
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, key) => (
                <tr key={key}>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <p className="font-medium text-black dark:text-white">
                      {log.action}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-primary" />
                      <span className="text-sm">{log.userEmail}</span>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {log.details}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={14} />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-5 text-center text-gray-500">
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </NeumorphBox>
  );
}
