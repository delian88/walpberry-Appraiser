
import React from 'react';
import { AppraisalStatus } from '../types';
import { STATUS_LABELS } from '../constants';

interface Props {
  status: AppraisalStatus;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const config = STATUS_LABELS[status];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
};
