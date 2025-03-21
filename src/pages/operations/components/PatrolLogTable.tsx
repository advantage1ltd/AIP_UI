import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PatrolLogTableHeader } from './PatrolLogTableHeader';
import { PatrolLog } from './PatrolLogTypes';

interface PatrolLogTableProps {
  logs: PatrolLog[];
  selectedRow: PatrolLog | null;
  onRowClick: (log: PatrolLog) => void;
}

export const PatrolLogTable: React.FC<PatrolLogTableProps> = ({
  logs,
  selectedRow,
  onRowClick
}) => {
  return (
    <>
      {/* Desktop view - table layout */}
      <div className="hidden sm:block">
        <Table>
          <PatrolLogTableHeader />
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <TableRow 
                  key={log.id} 
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedRow?.id === log.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => onRowClick(log)}
                >
                  <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{log.patrolType}</TableCell>
                  <TableCell className="text-xs sm:text-sm p-2 sm:p-3 whitespace-nowrap">{log.logDate}</TableCell>
                  <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{log.building}</TableCell>
                  <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{log.location}</TableCell>
                  <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{log.issueDescription}</TableCell>
                  <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{log.additionalInfo}</TableCell>
                  <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{log.maximoPorterTracNo}</TableCell>
                  <TableCell className="text-xs sm:text-sm p-2 sm:p-3">
                    <Badge variant={log.status === 'Open' ? 'default' : 'outline'} className={log.status === 'Open' ? 'bg-amber-500' : 'bg-green-100 text-green-800 border-green-300'}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{log.trustByesTeamAssign}</TableCell>
                  <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{log.actionTaken}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <p className="text-gray-500">No records found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view - card layout */}
      <div className="sm:hidden p-2">
        {logs.length > 0 ? (
          logs.map((log) => (
            <Card 
              key={log.id} 
              className={`mb-3 cursor-pointer ${selectedRow?.id === log.id ? 'border-blue-500 border-2' : 'border-gray-200'}`}
              onClick={() => onRowClick(log)}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-sm">{log.location} - {log.building}</h3>
                    <p className="text-xs text-muted-foreground">{log.logDate}</p>
                  </div>
                  <Badge variant={log.status === 'Open' ? 'default' : 'outline'} className={log.status === 'Open' ? 'bg-amber-500' : 'bg-green-100 text-green-800 border-green-300'}>
                    {log.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Type:</span> {log.patrolType}
                  </div>
                  <div>
                    <span className="text-gray-500">Issue:</span> {log.issueDescription}
                  </div>
                  <div>
                    <span className="text-gray-500">Team:</span> {log.trustByesTeamAssign}
                  </div>
                  <div>
                    <span className="text-gray-500">Action:</span> {log.actionTaken}
                  </div>
                </div>
                {log.additionalInfo && (
                  <div className="mt-2 text-xs">
                    <span className="text-gray-500">Additional Info:</span> {log.additionalInfo}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-4 text-xs text-muted-foreground">
            No records found
          </div>
        )}
      </div>
    </>
  );
}; 