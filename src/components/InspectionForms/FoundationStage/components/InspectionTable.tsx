import React from 'react';
import InspectionItem, { InspectionItemProps } from './InspectionItem';

export interface InspectionItemData {
  id: number;
  description: string;
  name: string;
  status: 'normal' | 'needsImprovement';
  note: string;
}

interface InspectionTableProps {
  items: InspectionItemData[];
  onStatusChange: (id: number, status: 'normal' | 'needsImprovement') => void;
  onNoteChange: (id: number, note: string) => void;
}

const InspectionTable: React.FC<InspectionTableProps> = ({
  items,
  onStatusChange,
  onNoteChange
}) => {
  return (
    <table className="inspection-table">
      <thead>
        <tr>
          <th>序號</th>
          <th>檢查項目</th>
          <th>正常</th>
          <th>需改善</th>
          <th>說明/備註</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <InspectionItem
            key={item.id}
            id={item.id}
            description={item.description}
            name={item.name}
            status={item.status}
            note={item.note}
            onStatusChange={onStatusChange}
            onNoteChange={onNoteChange}
          />
        ))}
      </tbody>
    </table>
  );
};

export default InspectionTable;
