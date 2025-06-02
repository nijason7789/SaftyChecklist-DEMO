import React from 'react';

export interface InspectionItemProps {
  id: number;
  description: string;
  name: string;
  status: 'normal' | 'needsImprovement';
  note: string;
  onStatusChange: (id: number, status: 'normal' | 'needsImprovement') => void;
  onNoteChange: (id: number, note: string) => void;
}

const InspectionItem: React.FC<InspectionItemProps> = ({
  id,
  description,
  name,
  status,
  note,
  onStatusChange,
  onNoteChange
}) => {
  return (
    <tr>
      <td>{id}</td>
      <td>{description}</td>
      <td>
        <input
          type="radio"
          name={`${name}_status`}
          value="normal"
          checked={status === 'normal'}
          onChange={() => onStatusChange(id, 'normal')}
        />
      </td>
      <td>
        <input
          type="radio"
          name={`${name}_status`}
          value="needsImprovement"
          checked={status === 'needsImprovement'}
          onChange={() => onStatusChange(id, 'needsImprovement')}
        />
      </td>
      <td>
        <input
          type="text"
          name={`${name}_note`}
          value={note}
          onChange={(e) => onNoteChange(id, e.target.value)}
        />
      </td>
    </tr>
  );
};

export default InspectionItem;
